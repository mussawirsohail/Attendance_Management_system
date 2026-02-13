from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"


class StudentBase(BaseModel):
    name: str


class StudentCreate(StudentBase):
    pass


class Student(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    student_id: int
    status: AttendanceStatus
    date: Optional[datetime] = None


class AttendanceCreate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class AIParseRequest(BaseModel):
    text: str


class AIParseResponse(BaseModel):
    students: list[str]
    status: AttendanceStatus
    date: Optional[datetime] = None