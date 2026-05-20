"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router
from src.config import APIConfig
from src.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Chiller Load Forecast API",
    description="Multi-site chiller cooling load prediction platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_cfg = APIConfig()
app.include_router(router, prefix=_cfg.api_prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host=_cfg.host, port=_cfg.port, reload=True)
