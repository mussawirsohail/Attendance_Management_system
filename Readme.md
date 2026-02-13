# AI-Powered Attendance Management System

A full-stack attendance management application that leverages AI to process natural language attendance commands.

## Features

- **AI-Powered Attendance**: Process natural language commands like "Ali is present today" or "Hamza and Ahmed are absent"
- **Student Management**: Add, remove, and view students
- **Attendance Tracking**: Mark attendance manually or via AI
- **Reporting & Analytics**: View attendance summaries and export data
- **Authentication**: Secure teacher login system
- **Voice Input**: Speak attendance commands directly
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hooks

### Backend
- Python FastAPI
- SQLite database
- SQLAlchemy ORM
- Pydantic models

### AI Integration
- Groq API with LLaMA 3 model
- Natural Language Processing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd attendance-management-system/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables:
Create a `.env` file in the backend directory with the following content:
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./attendance.db
SECRET_KEY=your_secret_key_here
```

6. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd attendance-management-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory with the following content:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or use an existing one to log in
3. Add students using the "Students" section
4. Mark attendance manually or use the AI feature with natural language commands
5. View attendance reports and export data as needed

### AI Commands Examples
- "Ali is present today"
- "Hamza and Ahmed are absent"
- "Mark Bilal late"
- "Sarah and Tom are present, John is absent"

### Voice Input
Click the microphone icon next to the AI input field and speak your attendance command.

## API Endpoints

### Authentication
- `POST /api/v1/token` - Login and get access token
- `POST /api/v1/users/` - Create a new user

### Students
- `GET /api/v1/students/` - Get all students
- `POST /api/v1/students/` - Create a new student
- `DELETE /api/v1/students/{id}` - Delete a student

### Attendance
- `POST /api/v1/attendance/manual/` - Mark attendance manually
- `POST /api/v1/attendance/ai/` - Process attendance with AI
- `GET /api/v1/attendance/date/{date_str}` - Get attendance for a specific date
- `GET /api/v1/attendance/student/{id}` - Get attendance for a specific student

### Reports
- `GET /api/v1/reports/summary/{date_str}` - Get attendance summary for a date
- `GET /api/v1/reports/export/csv/{date_str}` - Export attendance to CSV
- `GET /api/v1/reports/export/excel/{date_str}` - Export attendance to Excel

## Project Structure

```
attendance-management-system/
├── backend/
│ ├── api/ # API routes
│ ├── models/ # Database models
│ ├── schemas/ # Pydantic schemas
│ ├── database/ # Database configuration
│ ├── utils/ # Utility functions (AI parser, auth, etc.)
│ ├── main.py # Main application entry point
│ ├── requirements.txt
│ └── .env
└── frontend/
 ├── src/
 │ ├── app/ # Next.js app directory
 │ ├── components/ # Reusable components
 │ └── services/ # API service functions
 ├── package.json
 └── .env.local
```

## Environment Variables

### Backend (.env)
- `GROQ_API_KEY`: Your Groq API key for AI processing
- `DATABASE_URL`: Database connection string (default: SQLite)
- `SECRET_KEY`: Secret key for JWT token signing

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
