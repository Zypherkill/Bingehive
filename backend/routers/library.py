from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Anime, LibraryEntry, LibraryStatus, UserAnimeData
from core.dependencies import get_current_user
from pydantic import BaseModel
from services.anime_client import get_anime_details

router = APIRouter(prefix="/library",tags=["library"])

class AddAnimeRequest(BaseModel):
    mal_id: int


@router.post("/add")
async def add_anime(request: AddAnimeRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    anime_data = await get_anime_details(request.mal_id)
    if anime_data is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime data from Jikan")
    data = anime_data["data"]

    try:
        id = data["mal_id"]
        title = data["title"]
        image_url = data.get("images", {}).get("jpg", {}).get("image_url")
        synopsis = data.get("synopsis")
        episodes = data.get("episodes")
        mean_score = data.get("score")

        anime = db.query(Anime).filter(Anime.id == request.mal_id).first()
        if not anime:
            anime = Anime(
                id=id,
                title=title,
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
        return entry
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding anime: {e}")


@router.get("/")
def get_library(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    entries = db.query(LibraryEntry).all()
    return entries

class UpdateStatusRequest(BaseModel):
    status: LibraryStatus

@router.patch("/{anime_id}/status")
def update_status(anime_id: int, request: UpdateStatusRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    entry = db.query(LibraryEntry).filter(LibraryEntry.anime_id == anime_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Anime not found in the library")
    
    entry.status = request.status
    entry.updated_by = current_user.id
    db.commit()
    db.refresh(entry)
    return entry

class UserDataRequest(BaseModel):
    rating: int = None
    notes: str = None

@router.patch("/{anime_id}/userdata")
def update_user_data(anime_id: int, request: UserDataRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
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
    return user_data
