from fastapi import APIRouter, Depends, HTTPException
from core.dependencies import get_current_user
from services.anilist_client import get_anime_streaming_links
from models import Anime
from database import get_db
from sqlalchemy.orm import Session
from services.anime_client import get_anime_details, get_popular_anime, search_anime

router = APIRouter(prefix="/anime", tags=["anime"])

@router.get("/search")
async def search_anime_endpoint(q: str = None, current_user=Depends(get_current_user)):
    if not q:
        raise HTTPException(status_code=400, detail="Provide a search query")
    results = await search_anime(q)
    if results is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime data from MAL")
    return results


@router.get("/{anime_id}/streaming")
async def get_anime_streaming_links_endpoint(anime_id: int, current_user=Depends(get_current_user)):
    anime_data = await get_anime_details(anime_id)
    if anime_data is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime details")
    title = anime_data.get("title")
    links = await get_anime_streaming_links(title)
    return links

@router.get("/{anime_id}/details")
async def get_anime_details_endpoint(anime_id: int, current_user=Depends(get_current_user)):
    data = await get_anime_details(anime_id)
    if data is None:
        raise HTTPException(status_code=503, detail="Could not fetch anime details")
    return data

@router.get("/popular")
async def get_popular(current_user=Depends(get_current_user)):
    data = await get_popular_anime()
    if data is None:
        raise HTTPException(status_code=503, detail="Could not fetch popular anime")
    return data