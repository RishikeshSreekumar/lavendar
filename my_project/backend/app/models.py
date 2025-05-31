from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from .database import Base # Ensure this import works based on your file structure

# Association table for Profile to Skills (if you want a many-to-many for skills)
# For now, skills_used in Experience is a simple Text field (e.g., comma-separated or JSON string)
# If you want a proper many-to-many for skills on Profile or Experience, you'd define a Skill model and association tables.

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    handle = Column(String, unique=True, index=True, nullable=True) # New field

    full_name = Column(String, index=True, nullable=True) # Allow null for initial profile
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")
    experiences = relationship("Experience", back_populates="profile", cascade="all, delete-orphan")
    education_history = relationship("Education", back_populates="profile", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True) # Auto-incrementing integer ID
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)

    title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True) # Nullable if current job
    description = Column(Text, nullable=True)
    skills_used = Column(Text, nullable=True) # Could be comma-separated, JSON, or related to a Skills table

    profile = relationship("Profile", back_populates="experiences")


class Education(Base):
    __tablename__ = "education_history" # Changed from "education" to avoid potential SQL keyword conflicts

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)

    institution_name = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True) # Nullable if currently studying
    description = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="education_history")
