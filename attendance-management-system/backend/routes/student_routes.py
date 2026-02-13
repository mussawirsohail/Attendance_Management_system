from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Student
from schemas import StudentCreate, StudentUpdate, Student
from student_manager import (
    get_student_by_id,
    get_all_students,
    create_student,
    update_student,
    delete_student,
    search_students_by_name
)

router = APIRouter(prefix="/students", tags=["students"])


@router.post("/", response_model=Student)
def create_new_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    try:
        return create_student(db, student)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[Student])
def read_all_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all students with pagination"""
    try:
        students = get_all_students(db, skip=skip, limit=limit)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{student_id}", response_model=Student)
def read_student(student_id: int, db: Session = Depends(get_db)):
    """Get a student by ID"""
    try:
        db_student = get_student_by_id(db, student_id)
        if db_student is None:
            raise HTTPException(status_code=404, detail="Student not found")
        return db_student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{student_id}", response_model=Student)
def update_existing_student(
    student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db)
):
    """Update a student's information"""
    try:
        db_student = update_student(db, student_id, student_update)
        if db_student is None:
            raise HTTPException(status_code=404, detail="Student not found")
        return db_student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{student_id}")
def delete_existing_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student by ID"""
    try:
        success = delete_student(db, student_id)
        if not success:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": "Student deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=list[Student])
def search_students(name: str, db: Session = Depends(get_db)):
    """Search students by name (case-insensitive partial match)"""
    try:
        students = search_students_by_name(db, name)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))