import uuid
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import date # For date fields

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase): # For returning user info from API
    id: int
    # email: str # Already in UserBase

    class Config:
        from_attributes = True

# Internal User representation, e.g. for token data
class UserInDB(UserBase):
    id: int
    hashed_password: str # Keep this for internal use, not for API response to client

    class Config:
        from_attributes = True


# --- Experience Schemas ---
class ExperienceBase(BaseModel):
    title: str
    company_name: str
    location: Optional[str] = None
    start_date: date # Changed to date type
    end_date: Optional[date] = None
    description: Optional[str] = None
    skills_used: Optional[List[str]] = Field(default_factory=list) # Assuming list of strings

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase): # Allow all fields to be optional for partial updates
    title: Optional[str] = None
    company_name: Optional[str] = None
    start_date: Optional[date] = None
    # No id here, id comes from path parameter

class Experience(ExperienceBase): # For returning experience from API
    id: int # Integer ID from DB
    # profile_id: int # Usually not exposed directly to client for this sub-resource

    class Config:
        from_attributes = True


# --- Education Schemas ---
class EducationBase(BaseModel):
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: date # Changed to date type
    end_date: Optional[date] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase): # Allow all fields to be optional
    institution_name: Optional[str] = None
    degree: Optional[str] = None
    start_date: Optional[date] = None
    # No id here

class Education(EducationBase): # For returning education from API
    id: int # Integer ID from DB
    # profile_id: int

    class Config:
        from_attributes = True


# --- Profile Schemas ---
class ProfileBase(BaseModel):
    handle: Optional[str] = None # New field
    full_name: Optional[str] = None
    bio: Optional[str] = None
    # Pydantic v2 HttpUrl can be strict, ensure URLs are valid or use str
    profile_picture_url: Optional[str] = None # Using str for flexibility
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None

class ProfileCreate(ProfileBase): # Used when creating a profile, user_id will be from auth
    pass

class ProfileUpdate(ProfileBase): # For PUT request, all fields are optional
    # handle: Optional[str] = None # Already in ProfileBase
    pass
    # experiences: Optional[List[ExperienceCreate]] = Field(default_factory=list)
    # education_history: Optional[List[EducationCreate]] = Field(default_factory=list)
    # Note: Experiences and Education are handled by their own CRUD endpoints typically

class Profile(ProfileBase): # For returning full profile from API
    id: int
    user_id: int
    # handle: Optional[str] = None # Already in ProfileBase
    experiences: List[Experience] = Field(default_factory=list)
    education_history: List[Education] = Field(default_factory=list)

    class Config:
        from_attributes = True


# --- Token Schemas (already in main.py, can be moved here too) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None # Changed from email/username to user_id
    # email: Optional[str] = None # Kept if needed, but user_id is primary for DB lookups now
