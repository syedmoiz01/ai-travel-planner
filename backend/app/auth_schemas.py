from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models import Itinerary


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class SavedTripCreate(BaseModel):
    destination: str
    itinerary: Itinerary


class SavedTripOut(BaseModel):
    id: int
    destination: str
    itinerary: Itinerary
    created_at: datetime


class AdminUserOut(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    created_at: datetime
    trip_count: int


class AdminTripOut(BaseModel):
    id: int
    user_email: EmailStr
    destination: str
    created_at: datetime


class AdminStats(BaseModel):
    total_users: int
    total_trips: int
