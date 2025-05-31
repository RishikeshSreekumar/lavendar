from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone # Ensure all datetime components are imported
from jose import JWTError, jwt # Ensure JWT components are imported

# Project imports
from app import crud, models, schemas
from app.database import get_db, engine # Removed SessionLocal, Base as they are not directly used in main

# --- Configuration ---
SECRET_KEY = "your-secret-key-please-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- OAuth2 Scheme ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

# --- FastAPI app instance ---
app = FastAPI(title="User Profile API with PostgreSQL - Full CRUD")

# --- Token Utility ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Authentication Dependencies ---
async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user_from_token)) -> models.User:
    # Add active/disabled check here if implemented in User model
    return current_user

# --- Auth Endpoints ---
@app.post("/signup", response_model=schemas.User)
async def signup(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user_create.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = crud.create_user(db=db, user=user_create)
    # Automatically create a profile for the new user
    crud.get_or_create_profile(db, user_id=created_user.id)
    return created_user

@app.post("/signin", response_model=schemas.Token)
async def signin(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(db, email=form_data.username)
    # Using pwd_context from crud.py (imported as crud.pwd_context implicitly)
    if not user or not crud.pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Profile Endpoints ---
@app.get("/profiles/me/", response_model=schemas.Profile)
async def get_my_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_or_create_profile(db, user_id=current_user.id)
    # The profile object from CRUD is an SQLAlchemy model.
    # FastAPI will convert it to schemas.Profile based on response_model.
    return profile

@app.put("/profiles/me/", response_model=schemas.Profile)
async def update_my_profile(
    profile_data: schemas.ProfileUpdate, # Using ProfileUpdate schema
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    existing_profile = crud.get_or_create_profile(db, user_id=current_user.id)
    updated_profile = crud.update_user_profile(db, profile_data=profile_data, existing_profile=existing_profile)
    return updated_profile

# --- Experience Endpoints ---
@app.post("/profiles/me/experiences/", response_model=schemas.Experience, status_code=status.HTTP_201_CREATED)
async def add_my_experience(
    experience_data: schemas.ExperienceCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_or_create_profile(db, user_id=current_user.id)
    new_experience = crud.create_profile_experience(db, experience=experience_data, profile_id=profile.id)
    return new_experience

@app.get("/profiles/me/experiences/{experience_id}", response_model=schemas.Experience)
async def get_my_experience_item(
    experience_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    experience = crud.get_experience(db, experience_id=experience_id, profile_id=profile.id)
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found or does not belong to user")
    return experience

@app.put("/profiles/me/experiences/{experience_id}", response_model=schemas.Experience)
async def update_my_experience(
    experience_id: int,
    experience_data: schemas.ExperienceUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for current user")

    db_experience = crud.get_experience(db, experience_id=experience_id, profile_id=profile.id)
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found or not owned by user")

    updated_experience = crud.update_profile_experience(db, experience_data=experience_data, db_experience=db_experience)
    return updated_experience

@app.delete("/profiles/me/experiences/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_experience(
    experience_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        # This case should ideally not happen if user is authenticated and profile is auto-created
        raise HTTPException(status_code=404, detail="Profile not found for current user")

    deleted_experience = crud.delete_profile_experience(db, experience_id=experience_id, profile_id=profile.id)
    if not deleted_experience: # If it didn't exist or wasn't owned
        raise HTTPException(status_code=404, detail="Experience not found or not owned by user")
    return # FastAPI handles 204 No Content response

# --- Public Profile Endpoint ---
@app.get("/profiles/handle/{handle_value}", response_model=schemas.Profile, tags=["Public Profiles"])
async def read_profile_by_handle(
    handle_value: str,
    db: Session = Depends(get_db)
):
    # Ensure handle is treated case-insensitively or as per defined policy
    # For now, assuming case-sensitive match as per default DB behavior
    db_profile = crud.get_profile_by_handle(db, handle=handle_value)
    if db_profile is None:
        raise HTTPException(status_code=404, detail="Profile not found for this handle")
    # The schemas.Profile response_model will automatically serialize the data,
    # including experiences and education history due to eager loading in CRUD
    # and `from_attributes = True` in schemas.
    return db_profile

# --- Education Endpoints (Following similar pattern to Experience) ---
# These are protected endpoints for the authenticated user to manage their own education
@app.post("/profiles/me/education/", response_model=schemas.Education, status_code=status.HTTP_201_CREATED, tags=["Education Management"])
async def add_my_education(
    education_data: schemas.EducationCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_or_create_profile(db, user_id=current_user.id) # Ensures profile exists
    new_education = crud.create_profile_education(db, education=education_data, profile_id=profile.id)
    return new_education

@app.get("/profiles/me/education/{education_id}", response_model=schemas.Education, tags=["Education Management"])
async def get_my_education_item(
    education_id: int,
    current_user: models.User = Depends(get_current_active_user), # Protected
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id) # Get existing profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for current user") # Should not happen if profile auto-created

    education_item = crud.get_education_item(db, education_id=education_id, profile_id=profile.id)
    if not education_item:
        raise HTTPException(status_code=404, detail="Education item not found or does not belong to the current user's profile")
    return education_item

@app.put("/profiles/me/education/{education_id}", response_model=schemas.Education, tags=["Education Management"])
async def update_my_education(
    education_id: int,
    education_data: schemas.EducationUpdate,
    current_user: models.User = Depends(get_current_active_user), # Protected
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for current user")

    db_education_item = crud.get_education_item(db, education_id=education_id, profile_id=profile.id)
    if not db_education_item:
        raise HTTPException(status_code=404, detail="Education item not found or does not belong to current user's profile")

    updated_education_item = crud.update_profile_education(db, education_data=education_data, db_education=db_education_item)
    return updated_education_item

@app.delete("/profiles/me/education/{education_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Education Management"])
async def delete_my_education(
    education_id: int,
    current_user: models.User = Depends(get_current_active_user), # Protected
    db: Session = Depends(get_db)
):
    profile = crud.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for current user")

    deleted_education_item = crud.delete_profile_education(db, education_id=education_id, profile_id=profile.id)
    if not deleted_education_item: # Check if deletion was successful (item existed and belonged to profile)
        raise HTTPException(status_code=404, detail="Education item not found or does not belong to current user's profile")
    return

# --- Root Endpoint ---
@app.get("/", tags=["General"])
async def root():
    return {"message": "Welcome to the User Profile API - Full CRUD with Database!"}
