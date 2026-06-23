from fastapi import FastAPI, Depends
from routers import auth, anime, library, users
from core.dependencies import get_current_user
from models import User

app = FastAPI()

app.include_router(auth.router)
app.include_router(anime.router)
app.include_router(library.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Anime library API is alive"}

@app.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {"id": str(current_user.id), "username": current_user.username, "email": current_user.email}