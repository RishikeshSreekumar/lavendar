# Backend Application Setup

This document provides instructions on how to set up and run the backend application.

## Prerequisites

*   Python 3.8+ (Check your project's specific Python version if available, otherwise assume a recent version)
*   Pip (Python package installer)

## Setup Instructions

1.  **Navigate to Backend Directory:**
    ```bash
    cd app/backend
    ```

2.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set Environment Variables:**

    ### Database Configuration

    **Local Development (Default: SQLite)**

    For local development, the application is configured to use a SQLite database by default. The database file (`local.db`) will be created automatically in the `app/backend` directory when you run migrations or start the application if it doesn't already exist. No specific environment variables are required for this default setup.

    **Using a PostgreSQL Database (e.g., Supabase - Optional)**

    If you prefer to use a PostgreSQL database (like one hosted on Supabase), you can set the `SUPABASE_DB_URL` environment variable. If this variable is set, it will override the default SQLite configuration.

    *   **Finding your Supabase Database URL:**
        1.  Go to your Supabase project dashboard.
        2.  Navigate to **Project Settings** (the gear icon).
        3.  Click on **Database** in the sidebar.
        4.  Under **Connection string**, find the string that starts with `postgresql://postgres:[YOUR-PASSWORD]@[AWS-REGION].supabase.co:[PORT]/postgres`. Use this entire string.
    *   **Setting the Environment Variable:**
        Example (for bash/zsh):
        ```bash
        export SUPABASE_DB_URL="your_supabase_connection_string_here"
        ```
        Ensure this variable is set in the terminal session where you run the application.

5.  **Run Database Migrations:**
    The backend uses Alembic to manage database migrations. After setting up your database configuration, run the following command from the `app/backend` directory to apply any pending migrations:
    ```bash
    alembic upgrade head
    ```
    For the default SQLite setup, if the `local.db` file does not exist, this command (or running the application) will create it automatically. If you are using `SUPABASE_DB_URL`, ensure the database is created on the server before running migrations.
    If you are setting up the database for the first time, this will create all the necessary tables.

6.  **Run the Application:**
    The application uses Uvicorn as an ASGI server. To start the backend server, run the following command from the `app/backend` directory:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *   `main:app` refers to the FastAPI application instance in `main.py`.
    *   `--host 0.0.0.0` makes the server accessible from your local network.
    *   `--port 8000` specifies the port.
    *   `--reload` enables auto-reloading when code changes (useful for development).

## Project Structure

*   `main.py`: FastAPI application entry point.
*   `app/`: Core application logic.
    *   `database.py`: Database connection setup.
    *   `models.py`: SQLAlchemy database models.
    *   `schemas.py`: Pydantic data validation schemas.
    *   `crud.py`: Create, Read, Update, Delete operations.
*   `alembic/`: Database migration scripts.
*   `alembic.ini`: Alembic configuration.
*   `requirements.txt`: Python dependencies.
