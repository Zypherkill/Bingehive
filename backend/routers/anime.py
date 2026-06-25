from fastapi import APIRouter, Depends, HTTPException
from services.anime_client import search_anime
from core.dependencies import get_current_user
from services.anilist_client import get_anime_streaming_links
from models import Anime
from database import get_db
from sqlalchemy.orm import Session
from services.anime_client import get_anime_details

router = APIRouter(prefix="/anime", tags=["anime"])

@router.get("/search")
async def search_anime_endpoint(q: str = None, genres: str = None, current_user=Depends(get_current_user)):
    if not q and not genres:
        raise HTTPException(status_code=400, detail="Provide at least a search query or a genre")
    results = await search_anime(q, genres)
    if results is None:
        raise HTTPException(status_code=503, detail="Could not reach Anime API")
    return results


@router.get("/{anime_id}/streaming")
async def get_anime_streaming_links_endpoint(anime_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    anime = db.query(Anime).filter(Anime.id == anime_id).first()
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")

    links = await get_anime_streaming_links(anime.title)
    if links is None:
        raise HTTPException(status_code=503, detail="Could not reach AniList API")
    return links

@router.get("/{anime_id}/details")
async def get_anime_details_endpoint(anime_id: int, current_user=Depends(get_current_user)):
    data = await get_anime_details(anime_id)
    if data is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime details")
    return data