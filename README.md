# Project Lavendar - Full Stack Application

This project consists of a frontend application (Next.js) and a backend API (FastAPI with Python) that uses Supabase for its PostgreSQL database.

## Overview

*   **Frontend:** Located in `app/frontend/` (Further setup instructions might be available in `app/frontend/README.md`)
*   **Backend:** Located in `app/backend/` (Detailed setup in `app/backend/README.md`)

## Supabase Setup

This project uses Supabase as its backend-as-a-service, primarily for its PostgreSQL database.

### 1. Create a Supabase Account
*   Go to [supabase.com](https://supabase.com) and sign up or log in.

### 2. Create a New Project
*   Once logged in, create a new project.
*   Choose a name for your project and select a region.
*   Generate a strong database password and **save it securely**. You will need this for the connection string.
*   Wait for your project to be provisioned.

### 3. Obtain Your Database Connection String
*   After your project is ready, navigate to your project's dashboard.
*   Go to **Project Settings** (the gear icon on the left sidebar).
*   Click on **Database**.
*   Under **Connection string**, find the string that starts with `postgresql://postgres:[YOUR-PASSWORD]@[AWS-REGION].supabase.co:[PORT]/postgres`.
    *   **Important:** Replace `[YOUR-PASSWORD]` with the database password you saved when creating the project.
    *   This full string is your `SUPABASE_DB_URL`.

## Backend Setup

The backend is a Python FastAPI application.
1.  **Set the `SUPABASE_DB_URL` Environment Variable:**
    Before running the backend, you must set the `SUPABASE_DB_URL` environment variable to the connection string you obtained from your Supabase project.
    ```bash
    export SUPABASE_DB_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@your_project_ref.supabase.co:5432/postgres"
    ```
    (Replace the example URL with your actual Supabase connection string).

2.  **Detailed Backend Setup:**
    For detailed instructions on setting up the Python environment, installing dependencies, running database migrations, and starting the backend server, please refer to the backend's README:
    [Backend Setup Instructions](./app/backend/README.md)

## Frontend Setup

(Information about the frontend setup would go here. For now, you can check `app/frontend/README.md` if it exists.)

## Running the Full Application
1. Ensure your Supabase project is set up and you have the connection string.
2. Follow the instructions in `app/backend/README.md` to start the backend server.
3. Follow any instructions in `app/frontend/README.md` (if available) to start the frontend development server.
4. Typically, the frontend will be configured to make API calls to the backend (e.g., `http://localhost:8000`).
