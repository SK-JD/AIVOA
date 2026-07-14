"""HTTP API — app endpoints (chat, HCP search, health) + admin settings endpoints."""
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.config import settings as env_settings
from app.database import get_db
from app.models.models import HCP
from app.schemas import (
    ChatRequest,
    ChatResponse,
    FormState,
    HCPCreate,
    HCPOut,
    InteractionOut,
    SettingsIn,
    SettingsOut,
    TestConnectionIn,
    TestConnectionResult,
)
from app.services import chat_service, interaction_service, llm, settings_service, voice
from app.services.form_logic import missing_required

router = APIRouter(prefix="/api")


# ── App ───────────────────────────────────────────────────────────────────────
@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Run one chat turn through the LangGraph agent and return the reply + form patch."""
    try:
        return chat_service.run_chat(req)
    except llm.GroqNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)) -> dict:
    """Speech-to-text (Groq Whisper). The frontend feeds the transcript back into /api/chat,
    so the voice note runs through the same extraction/clarify/validate agent workflow."""
    audio = await file.read()
    if not audio:
        raise HTTPException(status_code=400, detail="Empty audio upload.")
    try:
        transcript = await run_in_threadpool(voice.transcribe, audio, file.filename or "audio.webm")
    except llm.GroqNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"transcript": transcript}


@router.get("/hcps", response_model=list[HCPOut])
def list_hcps(q: str = "", db: Session = Depends(get_db)) -> list[HCP]:
    """Search the HCP directory (used by the HCP Name field autocomplete + directory page)."""
    query = db.query(HCP)
    if q.strip():
        query = query.filter(HCP.name.ilike(f"%{q.strip()}%"))
    return query.order_by(HCP.name).limit(200).all()


@router.post("/hcps", response_model=HCPOut)
def create_hcp(body: HCPCreate, db: Session = Depends(get_db)) -> HCP:
    """Add an HCP to the directory (from the HCP Directory page)."""
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="HCP name is required.")
    existing = db.query(HCP).filter(HCP.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"'{name}' already exists in the directory.")
    hcp = HCP(name=name, specialty=body.specialty.strip(), organization=body.organization.strip())
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return hcp


@router.post("/interactions")
def create_interaction(form: FormState) -> dict:
    """Save the current form directly (the 'Save Interaction' button). Validates required fields."""
    data = form.model_dump()
    missing = missing_required(data)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required fields: {', '.join(missing)}")
    saved_id = interaction_service.save_interaction(data)
    return {"saved_id": saved_id}


@router.get("/interactions", response_model=list[InteractionOut])
def list_interactions() -> list[dict]:
    """All saved interactions (newest first) — the records / pipeline table."""
    return interaction_service.list_interactions()


# ── Admin ─────────────────────────────────────────────────────────────────────
def _require_admin(x_admin_token: str = Header(default="")) -> None:
    if x_admin_token != env_settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid or missing admin token.")


@router.get("/admin/settings", response_model=SettingsOut, dependencies=[Depends(_require_admin)])
def get_settings() -> SettingsOut:
    key = settings_service.get_groq_api_key()
    return SettingsOut(
        groq_api_key_masked=settings_service.mask_key(key),
        groq_model=settings_service.get_groq_model(),
        has_key=bool(key),
    )


@router.put("/admin/settings", response_model=SettingsOut, dependencies=[Depends(_require_admin)])
def update_settings(body: SettingsIn) -> SettingsOut:
    settings_service.save_settings(groq_api_key=body.groq_api_key, groq_model=body.groq_model)
    key = settings_service.get_groq_api_key()
    return SettingsOut(
        groq_api_key_masked=settings_service.mask_key(key),
        groq_model=settings_service.get_groq_model(),
        has_key=bool(key),
    )


@router.post(
    "/admin/test-connection",
    response_model=TestConnectionResult,
    dependencies=[Depends(_require_admin)],
)
def test_connection(body: TestConnectionIn) -> TestConnectionResult:
    """Validate a Groq key/model against the API before saving. Omit fields to test saved values."""
    model = body.groq_model or settings_service.get_groq_model()
    ok, error = llm.test_connection(api_key=body.groq_api_key, model=body.groq_model)
    return TestConnectionResult(ok=ok, model=model, error=error or None)
