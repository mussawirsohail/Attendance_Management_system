# AI-Powered Attendance Management System Backend

This is a backend system for managing attendance with AI-powered natural language processing using FastAPI, SQLite, and Groq LLM.

## Features

- User authentication (signup/login)
- Student management (add, delete, search)
- Attendance tracking (manual and AI-powered)
- Natural language processing for attendance commands
- Attendance percentage calculation
- RESTful API endpoints

## Tech Stack

- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite
- Groq API (LLaMA 3 model)
- Pydantic for data validation
- JWT for authentication
- Passlib for password hashing

## Setup

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Copy `.env.example` to `.env` and add your Groq API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and replace `your_groq_api_key_here` with your actual Groq API key.

## Running the Server

Run the server using uvicorn:
```bash
uvicorn main:app --reload
```

Or use the provided startup script:
- On Windows: `start_server.bat`
- On macOS/Linux: `start_server.sh`

The server will start at `http://localhost:8000`

API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### User Management
- `POST /users/register` - Register a new user
- `POST /users/login` - Login a user and get access token
- `GET /users/` - Get all users
- `GET /users/{user_id}` - Get a user by ID
- `PUT /users/{user_id}` - Update a user
- `DELETE /users/{user_id}` - Delete a user
- `PATCH /users/{user_id}/deactivate` - Deactivate a user

### Student Management
- `POST /students/` - Create a new student
- `GET /students/` - Get all students
- `GET /students/{student_id}` - Get a student by ID
- `PUT /students/{student_id}` - Update a student
- `DELETE /students/{student_id}` - Delete a student
- `GET /students/search?name=` - Search students by name

### Attendance Management
- `POST /attendance/manual` - Manually create attendance
- `POST /attendance/ai` - Create attendance using AI parsing
- `GET /attendance/date/{date_str}` - Get attendance by date
- `GET /attendance/student/{student_id}` - Get attendance by student
- `GET /attendance/percentage/{student_id}` - Get attendance percentage
- `PUT /attendance/{attendance_id}` - Update attendance
- `DELETE /attendance/{attendance_id}` - Delete attendance
- `GET /attendance/summary/{date_str}` - Get attendance summary

## AI Parsing

The system supports natural language commands for attendance:
- "Ali is present today"
- "Hamza and Ahmed are absent"
- "Mark Bilal late"

The AI will parse these commands and automatically create attendance records.

## Authentication

The system uses JWT-based authentication:
1. Register a new user with `/users/register`
2. Login with `/users/login` to get an access token
3. Use the access token in the Authorization header for protected endpoints

## Database

The system uses SQLite with the following tables:
- `users`: Stores user information
- `students`: Stores student information
- `attendance`: Stores attendance records

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key for AI processing

## Project Structure

```
backend/
│
├── main.py                 # FastAPI application entry point
├── database.py             # Database connection and session management
├── models.py               # SQLAlchemy models
├── schemas.py              # Pydantic schemas for request/response validation
├── ai_parser.py            # AI parsing logic using Groq
├── auth.py                 # Authentication utilities
├── user_manager.py         # User management business logic
├── student_manager.py      # Student management business logic
├── attendance_manager.py   # Attendance management business logic
├── routes/
│     ├── user_routes.py           # User-related API endpoints
│     ├── student_routes.py        # Student-related API endpoints
│     └── attendance_routes.py     # Attendance-related API endpoints
├── requirements.txt        # Python dependencies
├── .env.example          # Environment variables template
├── start_server.bat      # Windows startup script
└── start_server.sh       # Unix startup script
```