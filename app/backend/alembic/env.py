import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import Base from your models file and DATABASE_URL from your database file
from app.database import Base, DATABASE_URL # Base is defined in database.py
# Explicitly import all models to ensure they are registered with Base.metadata
from app.models import User, Profile, Experience, Education

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Fetch DB_URL from environment variable or alembic.ini
    actual_db_url = DATABASE_URL # This is imported from app.database at the top of the file

    # If using engine_from_config, ensure it uses the fetched DB_URL.
    # Create a new dictionary for engine configuration or update existing one.
    engine_config = config.get_section(config.config_ini_section, {})
    engine_config['sqlalchemy.url'] = actual_db_url  # Override with SUPABASE_DB_URL if available

    connectable = engine_from_config(
        engine_config,  # Use the modified config
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True # Added for SQLite compatibility if used
            # Ensure the url parameter is not redundantly passed if connection is primary
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
