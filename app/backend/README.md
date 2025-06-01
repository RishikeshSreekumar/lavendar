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
    You need to configure the `SUPABASE_DB_URL` environment variable. This URL is provided by your Supabase project.
    *   **Finding your Supabase Database URL:**
        1.  Go to your Supabase project dashboard.
        2.  Navigate to **Project Settings** (the gear icon).
        3.  Click on **Database** in the sidebar.
        4.  Under **Connection string**, find the string that starts with `postgresql://postgres:[YOUR-PASSWORD]@[AWS-REGION].supabase.co:[PORT]/postgres`. Use this entire string.

    *   **Setting the Environment Variable:**
        You can set this variable in your shell, in a `.env` file (if the application is configured to load it - typically using a library like `python-dotenv`, which is not currently listed in requirements, so manual export is safer), or through your deployment environment's configuration.

        Example (for bash/zsh):
        ```bash
        export SUPABASE_DB_URL="your_supabase_connection_string_here"
        ```
        Ensure this variable is set in the terminal session where you run the application.

5.  **Run Database Migrations:**
    The backend uses Alembic to manage database migrations. After setting up your `SUPABASE_DB_URL`, run the following command from the `app/backend` directory to apply any pending migrations:
    ```bash
    alembic upgrade head
    ```
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
