from sqlalchemy.orm import Session
from models import models
from schemas import schemas
from typing import List
from datetime import date


def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()


def get_student_by_name(db: Session, name: str):
    return db.query(models.Student).filter(models.Student.name == name).first()


def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()


def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(name=student.name)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
    return student


def get_attendance_by_date(db: Session, target_date: date):
    # Convert datetime to date for comparison
    return db.query(models.Attendance).filter(
        models.Attendance.date >= target_date,
        models.Attendance.date < target_date.replace(day=target_date.day + 1)
    ).all()


def get_attendance_by_student(db: Session, student_id: int):
    return db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()


def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    # If no date is provided, use current date
    if not attendance.date:
        from datetime import datetime
        attendance.date = datetime.utcnow()
    
    db_attendance = models.Attendance(
        student_id=attendance.student_id,
        date=attendance.date,
        status=attendance.status.value  # Convert enum to string
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance