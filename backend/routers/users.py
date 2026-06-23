from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import User
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.dependencies import get_current_user
from core.security import verify_password, hash_password
from user_schema import UserResponse

class UpdateEmailRequest(BaseModel):
    new_email: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


router = APIRouter(prefix="/users", tags=["users"])

@router.patch("/update-email", response_model=UserResponse)
def update_email(request: UpdateEmailRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(User).filter(User.email == request.new_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    current_user.email = request.new_email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/update-password", response_model=UserResponse)
def update_password(request: UpdatePasswordRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.password_hash = hash_password(request.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user