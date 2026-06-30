from fastapi import APIRouter, Depends, HTTPException
from routers import anime
from sqlalchemy.orm import Session
from database import get_db
from models import Anime, LibraryEntry, LibraryStatus, UserAnimeData
from core.dependencies import get_current_user
from pydantic import BaseModel
from services.anime_client import get_anime_details
import random
from core.websockets_manager import manager

router = APIRouter(prefix="/library",tags=["library"])

class AddAnimeRequest(BaseModel):
    mal_id: int



@router.post("/add")
async def add_anime(request: AddAnimeRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    anime_data = await get_anime_details(request.mal_id)
    if anime_data is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime data from Jikan")


    try:
        id = anime_data["id"]
        title = anime_data["title"]
        title_en = anime_data.get("alternative_titles", {}).get("en")
        image_url = anime_data.get("main_picture", {}).get("medium")
        synopsis = anime_data.get("synopsis")
        episodes = anime_data.get("num_episodes")
        mean_score = anime_data.get("mean")

        anime = db.query(Anime).filter(Anime.id == request.mal_id).first()
        if not anime:
            anime = Anime(
                id=id,
                title=title,
                title_en=title_en,
                image_url=image_url,
                synopsis=synopsis,
                episodes=episodes,
                mean_score=mean_score
                )
            db.add(anime)
            db.commit()
            db.refresh(anime)
        
        existing = db.query(LibraryEntry).filter(LibraryEntry.anime_id == id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Anime already exists in the library")

        entry = LibraryEntry(
            anime_id=id,
            status=LibraryStatus.plan_to_watch,
            added_by=current_user.id,
            updated_by=current_user.id
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        await manager.broadcast({"type": "anime_added", "anime_id": id})
        return entry
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding anime: {e}")


@router.get("/")
def get_library(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    results = db.query(LibraryEntry, Anime).join(Anime, LibraryEntry.anime_id == Anime.id).all()
    return [
        {
            "id": str(entry.id),
            "anime_id": entry.anime_id,
            "status": entry.status,
            "added_by": str(entry.added_by),
            "updated_by": str(entry.updated_by),
            "created_at": entry.created_at,
            "updated_at": entry.updated_at,
            "anime": {
                "id": anime.id,
                "title": anime.title,
                "title_en": anime.title_en,
                "image_url": anime.image_url,
                "synopsis": anime.synopsis,
                "episodes": anime.episodes,
                "mean_score": anime.mean_score,
            }
        }
        for entry, anime in results
    ]

class UpdateStatusRequest(BaseModel):
    status: LibraryStatus

@router.patch("/{anime_id}/status")
async def update_status(anime_id: int, request: UpdateStatusRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    entry = db.query(LibraryEntry).filter(LibraryEntry.anime_id == anime_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Anime not found in the library")
    
    entry.status = request.status
    entry.updated_by = current_user.id
    db.commit()
    db.refresh(entry)
    await manager.broadcast({"type": "status_changed", "anime_id": anime_id, "status": request.status})
    return entry

class UserDataRequest(BaseModel):
    rating: int = None
    notes: str = None

@router.patch("/{anime_id}/userdata")
async def update_user_data(anime_id: int, request: UserDataRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_data = db.query(UserAnimeData).filter(UserAnimeData.anime_id == anime_id, UserAnimeData.user_id == current_user.id).first()
    if not user_data:
        user_data = UserAnimeData(
            anime_id=anime_id,
            user_id=current_user.id,
            rating=request.rating,
            notes=request.notes
        )
        db.add(user_data)
    else:
        if request.rating is not None:
            user_data.rating = request.rating
        if request.notes is not None:
            user_data.notes = request.notes
    db.commit()
    db.refresh(user_data)
    await manager.broadcast({"type": "userdata_changed", "anime_id": anime_id})
    return user_data

@router.get("/{anime_id}/userdata")
def get_user_data(anime_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_data = db.query(UserAnimeData).filter(UserAnimeData.anime_id == anime_id, UserAnimeData.user_id == current_user.id).first()
    if not user_data:
        return
    return user_data

@router.delete("/{anime_id}")
async def remove_anime(anime_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    entry = db.query(LibraryEntry).filter(LibraryEntry.anime_id == anime_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Anime not found in the library")
    
    db.delete(entry)
    db.commit()
    await manager.broadcast({"type": "anime_removed", "anime_id": anime_id})
    return {"detail": "Anime removed from library"}


class AddCustomAnimeRequest(BaseModel):
    title: str
    image_url: str = None
    synopsis: str = None
    episodes: int = None
    mean_score: float = None

@router.post("/add-custom")
async def add_custom_anime(request: AddCustomAnimeRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    custom_id = -random.randint(1, 999999)
    while db.query(Anime).filter(Anime.id == custom_id).first():
        custom_id = -random.randint(1, 999999)

    anime = Anime(
            id=custom_id,
            title=request.title,
            image_url=request.image_url,
            synopsis=request.synopsis,
            episodes=request.episodes,
            mean_score=request.mean_score
            )
    db.add(anime)
    db.commit()
    db.refresh(anime)
        
    existing = db.query(LibraryEntry).filter(LibraryEntry.anime_id == custom_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Anime already exists in the library")

    entry = LibraryEntry(
            anime_id=custom_id,
            status=LibraryStatus.plan_to_watch,
            added_by=current_user.id,
            updated_by=current_user.id
        )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    await manager.broadcast({"type": "anime_added", "anime_id": custom_id})
    return entry