from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from database import get_db
from models import Attendance, Student
from schemas import (
    AttendanceCreate,
    AttendanceUpdate,
    Attendance as AttendanceSchema,
    AIParseRequest,
    AIParseResponse,
    AttendancePercentage,
    AttendanceWithStudent
)
from attendance_manager import (
    create_attendance_record,
    get_attendance_by_date,
    get_attendance_by_student,
    update_attendance_record,
    delete_attendance_record,
    calculate_attendance_percentage,
    get_attendance_summary_by_date
)
from ai_parser import parse_attendance_command
from student_manager import get_student_by_name

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/manual", response_model=AttendanceSchema)
def create_manual_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """Manually create an attendance record"""
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.id == attendance.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return create_attendance_record(db, attendance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai", response_model=list[AttendanceSchema])
def create_ai_attendance(ai_request: AIParseRequest, db: Session = Depends(get_db)):
    """Create attendance records using AI-parsed natural language command"""
    try:
        # Parse the command using AI
        parsed_result: AIParseResponse = parse_attendance_command(ai_request.command)
        
        created_attendances = []
        
        # Process each student in the command
        for student_name in parsed_result.students:
            # Find student by name (case-insensitive)
            student = get_student_by_name(db, student_name)

            # If student doesn't exist, create them
            if not student:
                from student_manager import create_student
                from schemas import StudentCreate
                new_student_data = StudentCreate(name=student_name)
                student = create_student(db, new_student_data)
            
            # Create attendance record
            attendance_data = AttendanceCreate(
                student_id=student.id,
                status=parsed_result.status,
                date=parsed_result.date
            )
            
            attendance_record = create_attendance_record(db, attendance_data)
            created_attendances.append(attendance_record)
        
        return created_attendances
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI command: {str(e)}")


@router.get("/date/{date_str}", response_model=list[AttendanceWithStudent])
def read_attendance_by_date(date_str: str, db: Session = Depends(get_db)):
    """Get all attendance records for a specific date"""
    try:
        # Parse the date string
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Calculate the start and end of the target date for filtering
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        # Get attendance records with joined student information
        attendance_records = db.query(Attendance, Student).join(Student).filter(
            Attendance.date >= start_datetime,
            Attendance.date <= end_datetime
        ).all()

        # Format the results to include student names
        result = []
        for attendance, student in attendance_records:
            # Ensure SQLAlchemy session state doesn't interfere with serialization
            attendance_dict = {
                'id': attendance.id,
                'student_id': attendance.student_id,
                'student_name': student.name,
                'status': attendance.status,
                'date': attendance.date,
                'created_at': attendance.created_at
            }
            result.append(attendance_dict)

        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}", response_model=list[AttendanceSchema])
def read_attendance_by_student(student_id: int, db: Session = Depends(get_db)):
    """Get all attendance records for a specific student"""
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        attendance_records = get_attendance_by_student(db, student_id)
        return attendance_records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/percentage/{student_id}", response_model=AttendancePercentage)
def read_attendance_percentage(student_id: int, db: Session = Depends(get_db)):
    """Get attendance percentage for a specific student"""
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        percentage = calculate_attendance_percentage(db, student_id)
        if not percentage:
            raise HTTPException(status_code=404, detail="No attendance records found for student")
        
        return percentage
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{attendance_id}", response_model=AttendanceSchema)
def update_attendance(attendance_id: int, attendance_update: AttendanceUpdate, db: Session = Depends(get_db)):
    """Update an attendance record"""
    try:
        updated_attendance = update_attendance_record(db, attendance_id, attendance_update)
        if not updated_attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return updated_attendance
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    """Delete an attendance record"""
    try:
        success = delete_attendance_record(db, attendance_id)
        if not success:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return {"message": "Attendance record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary/{date_str}", response_model=dict)
def read_attendance_summary(date_str: str, db: Session = Depends(get_db)):
    """Get attendance summary for a specific date"""
    try:
        # Parse the date string
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        summary = get_attendance_summary_by_date(db, target_date)
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))