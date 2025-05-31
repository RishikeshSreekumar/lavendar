from sqlalchemy.orm import Session
from sqlalchemy import update as sqlalchemy_update # To avoid confusion with schema update models
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- User CRUD ---
def get_user(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Profile CRUD ---
def get_profile_by_user_id(db: Session, user_id: int) -> models.Profile | None:
from fastapi import HTTPException, status # For raising exceptions

# --- Profile CRUD ---
def get_profile_by_user_id(db: Session, user_id: int) -> models.Profile | None:
from sqlalchemy.orm import selectinload # For eager loading

# --- Profile CRUD ---
def get_profile_by_user_id(db: Session, user_id: int) -> models.Profile | None:
    return db.query(models.Profile).options(
        selectinload(models.Profile.experiences),
        selectinload(models.Profile.education_history)
    ).filter(models.Profile.user_id == user_id).first()

def get_profile_by_handle(db: Session, handle: str) -> models.Profile | None:
    return db.query(models.Profile).options(
        selectinload(models.Profile.experiences),
        selectinload(models.Profile.education_history)
    ).filter(models.Profile.handle == handle).first()

def create_user_profile(db: Session, profile_data: schemas.ProfileCreate, user_id: int) -> models.Profile:
    if profile_data.handle:
        existing_handle = db.query(models.Profile).filter(models.Profile.handle == profile_data.handle).first()
        if existing_handle:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")

    # Ensure full_name is explicitly set to None if not provided, as model now allows null
    profile_dict = profile_data.model_dump()
    if 'full_name' not in profile_dict:
        profile_dict['full_name'] = None

    db_profile = models.Profile(**profile_dict, user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_user_profile(db: Session, profile_data: schemas.ProfileUpdate, existing_profile: models.Profile) -> models.Profile:
    update_data = profile_data.model_dump(exclude_unset=True)

    if "handle" in update_data and update_data["handle"] != existing_profile.handle:
        if update_data["handle"] is not None: # Allow unsetting handle to None
            existing_handle = db.query(models.Profile).filter(
                models.Profile.handle == update_data["handle"],
                models.Profile.id != existing_profile.id
            ).first()
            if existing_handle:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")

    for key, value in update_data.items():
        setattr(existing_profile, key, value)

    db.add(existing_profile) # Add to session to track changes
    db.commit()
    db.refresh(existing_profile)
    return existing_profile

def get_or_create_profile(db: Session, user_id: int) -> models.Profile:
    profile = get_profile_by_user_id(db, user_id=user_id)
    if not profile:
        profile = create_user_profile(db, profile_data=schemas.ProfileCreate(), user_id=user_id)
    return profile

# --- Experience CRUD ---
def create_profile_experience(db: Session, experience: schemas.ExperienceCreate, profile_id: int) -> models.Experience:
    db_experience = models.Experience(**experience.model_dump(), profile_id=profile_id)
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def get_experience(db: Session, experience_id: int, profile_id: int) -> models.Experience | None:
    return db.query(models.Experience).filter(
        models.Experience.id == experience_id,
        models.Experience.profile_id == profile_id # Ensure it belongs to the correct profile
    ).first()

def update_profile_experience(db: Session, experience_data: schemas.ExperienceUpdate, db_experience: models.Experience) -> models.Experience:
    update_data = experience_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_experience, key, value)
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def delete_profile_experience(db: Session, experience_id: int, profile_id: int) -> models.Experience | None:
    db_experience = get_experience(db, experience_id=experience_id, profile_id=profile_id)
    if db_experience:
        db.delete(db_experience)
        db.commit()
    return db_experience # Returns the deleted object, or None if not found

# --- Education CRUD ---
def create_profile_education(db: Session, education: schemas.EducationCreate, profile_id: int) -> models.Education:
    db_education = models.Education(**education.model_dump(), profile_id=profile_id)
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

def get_education_item(db: Session, education_id: int, profile_id: int) -> models.Education | None:
    return db.query(models.Education).filter(
        models.Education.id == education_id,
        models.Education.profile_id == profile_id
    ).first()

def update_profile_education(db: Session, education_data: schemas.EducationUpdate, db_education: models.Education) -> models.Education:
    update_data = education_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_education, key, value)
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

def delete_profile_education(db: Session, education_id: int, profile_id: int) -> models.Education | None:
    db_education = get_education_item(db, education_id=education_id, profile_id=profile_id)
    if db_education:
        db.delete(db_education)
        db.commit()
    return db_education # Returns the deleted object, or None if not found
