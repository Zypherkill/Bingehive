from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from user_schema import UserResponse
from routers import auth, anime, library, users
from core.dependencies import get_current_user
from models import User
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from core.websockets_manager import manager

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(anime.router)
app.include_router(library.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Anime library API is alive"}

@app.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.websocket("/ws/library")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)