from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserUpdate
from auth import get_password_hash


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User:
    """Get a user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """Get all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User:
    """Update a user's information"""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        if user_update.username is not None:
            db_user.username = user_update.username
        if user_update.email is not None:
            db_user.email = user_update.email
        if user_update.is_active is not None:
            db_user.is_active = user_update.is_active
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete a user by ID"""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def deactivate_user(db: Session, user_id: int) -> User:
    """Deactivate a user account"""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.is_active = False
        db.commit()
        db.refresh(db_user)
    return db_user