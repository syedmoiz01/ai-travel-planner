import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_admin,
    get_current_user,
    hash_password,
    verify_password,
)
from app.auth_schemas import (
    AdminStats,
    AdminTripOut,
    AdminUserOut,
    SavedTripCreate,
    SavedTripOut,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)
from app.db import Base, engine, get_db
from app.db_models import SavedTrip, User
from app.deal_finder import get_deal_info
from app.destination_service import get_destination_info
from app.llm import chat_reply, generate_itinerary
from app.models import (
    ChatRequest,
    ChatResponse,
    DealInfo,
    Itinerary,
    MockDestinationInfo,
    TripRequest,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Travel Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/itinerary", response_model=Itinerary)
def create_itinerary(trip: TripRequest) -> Itinerary:
    try:
        return generate_itinerary(trip)
    except KeyError:
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY is not configured on the server.",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Itinerary generation failed: {exc}")


@app.get("/api/destinations/{name}", response_model=MockDestinationInfo)
def destination_info(name: str) -> MockDestinationInfo:
    return get_destination_info(name)


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        return ChatResponse(reply=chat_reply(payload.messages))
    except KeyError:
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY is not configured on the server.",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Chat reply failed: {exc}")


@app.get("/api/deals/{name}", response_model=DealInfo)
def deals(name: str) -> DealInfo:
    return get_deal_info(name)


@app.post("/api/auth/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    is_first_user = db.query(User).count() == 0
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_admin=is_first_user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=user.email)
    return Token(access_token=token, user=UserOut.model_validate(user, from_attributes=True))


@app.post("/api/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    invalid = HTTPException(status_code=401, detail="Invalid email or password")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise invalid
    token = create_access_token(subject=user.email)
    return Token(access_token=token, user=UserOut.model_validate(user, from_attributes=True))


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user, from_attributes=True)


@app.post("/api/trips", response_model=SavedTripOut)
def save_trip(
    payload: SavedTripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SavedTripOut:
    trip = SavedTrip(
        user_id=current_user.id,
        destination=payload.destination,
        itinerary=payload.itinerary.model_dump(),
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return SavedTripOut.model_validate(trip, from_attributes=True)


@app.get("/api/trips", response_model=list[SavedTripOut])
def list_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SavedTrip]:
    return (
        db.query(SavedTrip)
        .filter(SavedTrip.user_id == current_user.id)
        .order_by(SavedTrip.created_at.desc())
        .all()
    )


@app.delete("/api/trips/{trip_id}", status_code=204)
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    trip = (
        db.query(SavedTrip)
        .filter(SavedTrip.id == trip_id, SavedTrip.user_id == current_user.id)
        .first()
    )
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()


@app.get("/api/admin/stats", response_model=AdminStats)
def admin_stats(
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AdminStats:
    return AdminStats(
        total_users=db.query(User).count(),
        total_trips=db.query(SavedTrip).count(),
    )


@app.get("/api/admin/users", response_model=list[AdminUserOut])
def admin_list_users(
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[AdminUserOut]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        AdminUserOut(
            id=u.id,
            email=u.email,
            is_admin=u.is_admin,
            created_at=u.created_at,
            trip_count=len(u.trips),
        )
        for u in users
    ]


@app.delete("/api/admin/users/{user_id}", status_code=204)
def admin_delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@app.get("/api/admin/trips", response_model=list[AdminTripOut])
def admin_list_trips(
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[AdminTripOut]:
    trips = db.query(SavedTrip).order_by(SavedTrip.created_at.desc()).all()
    return [
        AdminTripOut(
            id=t.id,
            user_email=t.user.email,
            destination=t.destination,
            created_at=t.created_at,
        )
        for t in trips
    ]
