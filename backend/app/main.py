"""FastAPI application entrypoint.

On startup: create DB tables and pre-compile the LangGraph agent (built once, reused).
Swagger UI is available at /docs and ReDoc at /redoc for API reference.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.config import settings
from app.database import init_db
from app.graph.engine import get_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    get_graph()  # compile the agent graph once at startup
    yield


app = FastAPI(title="AI-First CRM — Log HCP Interaction", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict:
    return {"service": "AI-First CRM — Log HCP Interaction", "docs": "/docs"}
