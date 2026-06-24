import uuid
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models import User
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.dependencies import get_current_user
from core.security import verify_password, hash_password
from user_schema import UserResponse
from core.supabase import supabase

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


def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")

@router.patch("/update-password", response_model=UserResponse)
def update_password(request: UpdatePasswordRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    validate_password(request.new_password)
    current_user.password_hash = hash_password(request.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WebP images are allowed")
    if file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 2MB")
    
    file_ext = file.filename.split(".")[-1]
    file_name = f"{current_user.id}/{uuid.uuid4()}.{file_ext}"

    contents = await file.read()
    supabase.storage.from_("avatars").upload(file_name, contents, {"content-type": file.content_type})
    url = supabase.storage.from_("avatars").get_public_url(file_name)

    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/avatar-test")
async def test_upload(file: UploadFile = File(...)):
    return {"filename": file.filename, "content_type": file.content_type}