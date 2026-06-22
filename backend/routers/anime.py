from fastapi import APIRouter, Depends, HTTPException
from services.anime_client import search_anime
from core.dependencies import get_current_user

router = APIRouter(prefix="/anime", tags=["anime"])

@router.get("/search")
async def search_anime_endpoint(q: str = None, genres: str = None, current_user=Depends(get_current_user)):
    if not q and not genres:
        raise HTTPException(status_code=400, detail="Provide at least a search query or a genre")
    results = await search_anime(q, genres)
    if results is None:
        raise HTTPException(status_code=503, detail="Could not reach Anime API")
    return results