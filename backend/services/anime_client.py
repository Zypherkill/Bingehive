import httpx
from core.config import MAL_CLIENT_ID 

MAL_FIELDS = "id,title,alternative_titles,main_picture,synopsis,num_episodes,mean,rank,genres,status,start_date,studios,media_type"
MAL_BASE_URL = "https://api.myanimelist.net/v2"

async def search_anime(query: str = None):
    headers = {"X-MAL-CLIENT-ID": MAL_CLIENT_ID }
    params = {"q": query, "fields": MAL_FIELDS, "limit": 25}

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MAL_BASE_URL}/anime", headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None
        
async def get_anime_details(mal_id: int):
    headers = {"X-MAL-CLIENT-ID": MAL_CLIENT_ID }
    params = {"fields": MAL_FIELDS}

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MAL_BASE_URL}/anime/{mal_id}", headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None

async def get_popular_anime():
    headers = {"X-MAL-CLIENT-ID": MAL_CLIENT_ID}
    params = {
        "ranking_type": "bypopularity",
        "limit": 25,
        "fields": MAL_FIELDS
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MAL_BASE_URL}/anime/ranking", headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None    