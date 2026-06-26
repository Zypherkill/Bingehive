import httpx


async def search_anime(query: str = None, genres: str = None):
    url = "https://api.jikan.moe/v4/anime"
    params = {}
    if query:
        params["q"] = query
    if genres:
        params["genres"] = genres

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None
        
async def get_anime_details(mal_id: int):
    url = f"https://api.jikan.moe/v4/anime/{mal_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            return None        