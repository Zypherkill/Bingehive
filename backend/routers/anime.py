from fastapi import APIRouter, Depends, HTTPException
from services.mal_client import search_anime
from core.dependencies import get_current_user

router = APIRouter(prefix="/anime", tags=["anime"])

@router.get("/search")
async def search_anime_endpoint(q: str, current_user=Depends(get_current_user)):
    results = await search_anime(q)
    if results is None:
        raise HTTPException(status_code=503, detail="Could not reach MAL API")
    return results