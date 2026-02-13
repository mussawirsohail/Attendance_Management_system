from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.student_routes import router as student_router
from routes.attendance_routes import router as attendance_router
from routes.user_routes import router as user_router
from models import Base
from database import engine
import os

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Attendance Management System",
    description="A backend system for managing attendance with AI-powered natural language processing",
    version="1.0.0"
)

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(student_router)
app.include_router(attendance_router)
app.include_router(user_router)

@app.get("/")
def read_root():
    return {
        "message": "AI-Powered Attendance Management System",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)