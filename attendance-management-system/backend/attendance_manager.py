from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from models import Attendance, Student
from schemas import AttendanceCreate, AttendanceUpdate, AttendancePercentage
from typing import List


def create_attendance_record(db: Session, attendance: AttendanceCreate) -> Attendance:
    """Create a new attendance record"""
    db_attendance = Attendance(
        student_id=attendance.student_id,
        status=attendance.status,
        date=attendance.date or datetime.utcnow()
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance_by_date(db: Session, target_date: date) -> List[Attendance]:
    """Get all attendance records for a specific date"""
    # Calculate the start and end of the target date for filtering
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())
    
    return db.query(Attendance).filter(
        Attendance.date >= start_datetime,
        Attendance.date <= end_datetime
    ).all()


def get_attendance_by_student(db: Session, student_id: int) -> List[Attendance]:
    """Get all attendance records for a specific student"""
    return db.query(Attendance).filter(Attendance.student_id == student_id).all()


def get_attendance_by_student_and_date(db: Session, student_id: int, target_date: date) -> List[Attendance]:
    """Get attendance records for a specific student on a specific date"""
    # Calculate the start and end of the target date for filtering
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())
    
    return db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.date >= start_datetime,
        Attendance.date <= end_datetime
    ).all()


def update_attendance_record(db: Session, attendance_id: int, attendance_update: AttendanceUpdate) -> Attendance:
    """Update an attendance record"""
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_attendance:
        db_attendance.student_id = attendance_update.student_id
        db_attendance.status = attendance_update.status
        db_attendance.date = attendance_update.date
        db.commit()
        db.refresh(db_attendance)
    return db_attendance


def delete_attendance_record(db: Session, attendance_id: int) -> bool:
    """Delete an attendance record by ID"""
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_attendance:
        db.delete(db_attendance)
        db.commit()
        return True
    return False


def calculate_attendance_percentage(db: Session, student_id: int) -> AttendancePercentage:
    """Calculate attendance percentage for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None
    
    all_attendance = get_attendance_by_student(db, student_id)
    
    if not all_attendance:
        return AttendancePercentage(
            student_id=student_id,
            student_name=student.name,
            total_days=0,
            present_days=0,
            absent_days=0,
            late_days=0,
            percentage=0.0
        )
    
    total_days = len(all_attendance)
    present_days = sum(1 for att in all_attendance if att.status.lower() == 'present')
    absent_days = sum(1 for att in all_attendance if att.status.lower() == 'absent')
    late_days = sum(1 for att in all_attendance if att.status.lower() == 'late')
    
    percentage = (present_days / total_days) * 100 if total_days > 0 else 0
    
    return AttendancePercentage(
        student_id=student_id,
        student_name=student.name,
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        late_days=late_days,
        percentage=round(percentage, 2)
    )


def get_attendance_summary_by_date(db: Session, target_date: date) -> dict:
    """Get attendance summary for a specific date"""
    attendance_records = get_attendance_by_date(db, target_date)
    
    total = len(attendance_records)
    present = sum(1 for att in attendance_records if att.status.lower() == 'present')
    absent = sum(1 for att in attendance_records if att.status.lower() == 'absent')
    late = sum(1 for att in attendance_records if att.status.lower() == 'late')
    
    return {
        "date": target_date.isoformat(),
        "total": total,
        "present": present,
        "absent": absent,
        "late": late
    }