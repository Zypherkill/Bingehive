from database import SessionLocal
from models import User
from core.security import hash_password
import os
from dotenv import load_dotenv

load_dotenv()
db = SessionLocal()
try:
    db.add(User(username=os.getenv("USER1_USERNAME"), email=os.getenv("USER1_EMAIL"), password_hash=hash_password(os.getenv("USER1_PASSWORD"))))
    db.add(User(username=os.getenv("USER2_USERNAME"), email=os.getenv("USER2_EMAIL"), password_hash=hash_password(os.getenv("USER2_PASSWORD"))))
    db.commit()
    print("Användare skapade!")
except Exception as e:
    db.rollback()
    print(f"Error seeding users: {e}")
finally:
    db.close()