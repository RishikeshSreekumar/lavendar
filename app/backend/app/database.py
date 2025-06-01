import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# IMPORTANT: Replace with your actual database URL in a production environment
# Consider using environment variables for this.
# Example for PostgreSQL: "postgresql://user:password@host:port/dbname"
# Example for SQLite (for local development): "sqlite:///./test.db"
DATABASE_URL = os.environ.get("SUPABASE_DB_URL")
if DATABASE_URL is None:
    raise RuntimeError("SUPABASE_DB_URL environment variable not set. Please configure it for PostgreSQL.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Import all models here to ensure they are registered with Base
# This can help Alembic autogenerate detect changes.
from . import models # Assuming models.py is in the same directory (app)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
