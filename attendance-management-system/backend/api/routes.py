from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models import models
from schemas import schemas
from typing import List
from datetime import datetime, date, timedelta
import crud
from utils import auth
from passlib.context import CryptContext

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# Authentication Routes
@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Student Routes
@router.post("/students/", response_model=schemas.Student, dependencies=[Depends(auth.get_current_user)])
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db=db, student=student)


@router.get("/students/", response_model=List[schemas.Student], dependencies=[Depends(auth.get_current_user)])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = crud.get_students(db, skip=skip, limit=limit)
    return students


@router.delete("/students/{student_id}", dependencies=[Depends(auth.get_current_user)])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db=db, student_id=student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    crud.delete_student(db=db, student_id=student_id)
    return {"message": f"Student {student_id} deleted successfully"}


# Attendance Routes
@router.post("/attendance/manual/", response_model=schemas.Attendance, dependencies=[Depends(auth.get_current_user)])
def create_attendance_manual(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    # Validate student exists
    student = crud.get_student(db=db, student_id=attendance.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return crud.create_attendance(db=db, attendance=attendance)


@router.post("/attendance/ai/", dependencies=[Depends(auth.get_current_user)])
def create_attendance_ai(ai_request: schemas.AIParseRequest, db: Session = Depends(get_db)):
    # Import here to avoid circular imports
    from utils.ai_parser import parse_attendance_with_ai
    
    try:
        result = parse_attendance_with_ai(ai_request.text)
        
        # Process the AI result and create attendance records
        for student_name in result.students:
            # Find student by name
            student = crud.get_student_by_name(db=db, name=student_name)
            if not student:
                # If student doesn't exist, create them first
                new_student = schemas.StudentCreate(name=student_name)
                student = crud.create_student(db=db, student=new_student)
            
            # Create attendance record
            attendance_data = schemas.AttendanceCreate(
                student_id=student.id,
                status=result.status,
                date=result.date or datetime.utcnow()
            )
            crud.create_attendance(db=db, attendance=attendance_data)
        
        return {
            "message": "Attendance processed successfully",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI request: {str(e)}")


@router.get("/attendance/date/{date_str}", response_model=List[schemas.Attendance], dependencies=[Depends(auth.get_current_user)])
def read_attendance_by_date(date_str: str, db: Session = Depends(get_db)):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        attendances = crud.get_attendance_by_date(db=db, target_date=target_date)
        return attendances
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/attendance/student/{student_id}", response_model=List[schemas.Attendance], dependencies=[Depends(auth.get_current_user)])
def read_attendance_by_student(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db=db, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    attendances = crud.get_attendance_by_student(db=db, student_id=student_id)
    return attendances


# Reporting Routes
@router.get("/reports/summary/{date_str}")
def get_attendance_summary(date_str: str, db: Session = Depends(get_db)):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        from utils.reporting import get_attendance_summary
        summary = get_attendance_summary(db=db, target_date=target_date)
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/reports/export/csv/{date_str}")
def export_attendance_csv(date_str: str, db: Session = Depends(get_db)):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        from utils.reporting import export_attendance_to_csv
        csv_buffer = export_attendance_to_csv(db=db, target_date=target_date)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=attendance_{date_str}.csv"}
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/reports/export/excel/{date_str}")
def export_attendance_excel(date_str: str, db: Session = Depends(get_db)):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        from utils.reporting import export_attendance_to_excel
        excel_buffer = export_attendance_to_excel(db=db, target_date=target_date)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=attendance_{date_str}.xlsx"}
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")