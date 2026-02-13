from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Student
from schemas import StudentCreate, StudentUpdate


def get_student_by_id(db: Session, student_id: int) -> Student:
    """Get a student by ID"""
    return db.query(Student).filter(Student.id == student_id).first()


def get_student_by_name(db: Session, name: str) -> Student:
    """Get a student by name (case-insensitive)"""
    return db.query(Student).filter(Student.name.ilike(f"%{name}%")).first()


def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> list[Student]:
    """Get all students with pagination"""
    return db.query(Student).offset(skip).limit(limit).all()


def create_student(db: Session, student: StudentCreate) -> Student:
    """Create a new student"""
    db_student = Student(name=student.name)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: int, student_update: StudentUpdate) -> Student:
    """Update a student's information"""
    db_student = get_student_by_id(db, student_id)
    if db_student:
        db_student.name = student_update.name
        db.commit()
        db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int) -> bool:
    """Delete a student by ID"""
    db_student = get_student_by_id(db, student_id)
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False


def search_students_by_name(db: Session, name: str) -> list[Student]:
    """Search students by name (case-insensitive partial match)"""
    return db.query(Student).filter(Student.name.ilike(f"%{name}%")).all()