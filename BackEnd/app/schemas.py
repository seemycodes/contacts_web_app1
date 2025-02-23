from pydantic import BaseModel
from typing import Optional

class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str

class ContactResponse(ContactCreate):
    id: int

    class Config:
        from_attributes = True

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None