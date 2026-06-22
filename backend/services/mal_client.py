import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def search_anime(query:str):
    MAL_CLIENT_ID = os.getenv("MAL_CLIENT_ID")
    url = "https://api.myanimelist.net/v2/anime"
    headers = {"X-MAL-CLIENT-ID": MAL_CLIENT_ID}
    params = {"q": query, "limit": 10, "fields": "id,title,main_picture,synopsis,num_episodes,mean"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None