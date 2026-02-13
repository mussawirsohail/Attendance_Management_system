import pandas as pd
from io import BytesIO
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import models
from datetime import date
import crud


def export_attendance_to_csv(db: Session, target_date: date = None):
    """
    Export attendance data to CSV format
    """
    if target_date:
        attendances = crud.get_attendance_by_date(db=db, target_date=target_date)
    else:
        attendances = db.query(models.Attendance).all()
    
    # Prepare data for DataFrame
    data = []
    for attendance in attendances:
        student = crud.get_student(db=db, student_id=attendance.student_id)
        data.append({
            "ID": attendance.id,
            "Student Name": student.name if student else "Unknown",
            "Date": attendance.date.strftime("%Y-%m-%d") if attendance.date else "",
            "Status": attendance.status,
            "Created At": attendance.created_at.strftime("%Y-%m-%d %H:%M:%S") if attendance.created_at else ""
        })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Create a BytesIO buffer to hold the CSV data
    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    
    return buffer


def export_attendance_to_excel(db: Session, target_date: date = None):
    """
    Export attendance data to Excel format
    """
    if target_date:
        attendances = crud.get_attendance_by_date(db=db, target_date=target_date)
    else:
        attendances = db.query(models.Attendance).all()
    
    # Prepare data for DataFrame
    data = []
    for attendance in attendances:
        student = crud.get_student(db=db, student_id=attendance.student_id)
        data.append({
            "ID": attendance.id,
            "Student Name": student.name if student else "Unknown",
            "Date": attendance.date.strftime("%Y-%m-%d") if attendance.date else "",
            "Status": attendance.status,
            "Created At": attendance.created_at.strftime("%Y-%m-%d %H:%M:%S") if attendance.created_at else ""
        })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Create a BytesIO buffer to hold the Excel data
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Attendance', index=False)
    buffer.seek(0)
    
    return buffer


def get_attendance_summary(db: Session, target_date: date = None):
    """
    Get attendance summary statistics
    """
    if target_date:
        attendances = crud.get_attendance_by_date(db=db, target_date=target_date)
    else:
        attendances = db.query(models.Attendance).all()
    
    total_records = len(attendances)
    present_count = sum(1 for att in attendances if att.status == 'present')
    absent_count = sum(1 for att in attendances if att.status == 'absent')
    late_count = sum(1 for att in attendances if att.status == 'late')
    
    summary = {
        "total_records": total_records,
        "present": present_count,
        "absent": absent_count,
        "late": late_count,
        "present_percentage": round((present_count / total_records * 100) if total_records > 0 else 0, 2),
        "absent_percentage": round((absent_count / total_records * 100) if total_records > 0 else 0, 2),
        "late_percentage": round((late_count / total_records * 100) if total_records > 0 else 0, 2)
    }
    
    return summary