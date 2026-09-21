from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import annotations, auth, edges, nodes, projects, tasks
from app.seed import ensure_seed_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_seed_user(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Roadmap API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(nodes.router)
app.include_router(edges.router)
app.include_router(tasks.router)
app.include_router(annotations.router)


@app.get("/health")
def health():
    return {"status": "ok"}
