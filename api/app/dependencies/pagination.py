from fastapi import Query


def pagination_params(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=50),
) -> dict:
    return {"page": page, "limit": limit}