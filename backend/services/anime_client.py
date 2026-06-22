import httpx


async def search_anime(query:str, genres: str = None):
    url = "https://api.jikan.moe/v4/anime"
    params = {"q": query, "limit": 10}
    if genres:
        params["genres"] = genres

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None