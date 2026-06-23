from pydantic import BaseModel
from datetime import datetime
import uuid

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True