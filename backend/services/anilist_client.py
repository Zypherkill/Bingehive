import httpx

ANILIST_URL = "https://graphql.anilist.co"

STREAMING_QUERY = """
query ($title: String) {
    Media(search: $title, type: ANIME) {
        title {
            romaji
            english
        }
        externalLinks {
            site
            url
            type
        }
    }
}
"""

async def get_anime_streaming_links(title: str) -> dict | None:
    payload = {
        "query": STREAMING_QUERY,
        "variables": {"title": title}
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(ANILIST_URL, json=payload)
        if response.status_code == 200:
            data = response.json()
            links = data["data"]["Media"]["externalLinks"]
            return [link for link in links if link["type"] == "STREAMING"]
        else:
            return None