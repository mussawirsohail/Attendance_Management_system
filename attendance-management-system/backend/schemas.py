from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"
    late = "Late"


class StudentBase(BaseModel):
    name: str


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class Student(StudentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    student_id: int
    status: AttendanceStatus
    date: Optional[datetime] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceWithStudent(BaseModel):
    id: int
    student_id: int
    student_name: str
    status: AttendanceStatus
    date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class AIParseRequest(BaseModel):
    command: str


class AIParseResponse(BaseModel):
    students: List[str]
    status: AttendanceStatus
    date: Optional[datetime] = None


class AttendancePercentage(BaseModel):
    student_id: int
    student_name: str
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    percentage: float