from sqlalchemy.orm import Session
from . import models, schemas

def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(
        first_name=contact.first_name,
        last_name=contact.last_name,
        phone=contact.phone,
        email=contact.email
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_contacts(db: Session):
    return db.query(models.Contact).all()

def get_contacts_by_query(db: Session, query: str):
    """
    Fetch contacts Case-insensitive, partial match.
    """
    if not query:
        return []

    query = f"%{query}%"  # Enable SQL LIKE search for partial matches

    return db.query(models.Contact).filter(
        (models.Contact.first_name.ilike(query)) |
        (models.Contact.last_name.ilike(query)) |
        (models.Contact.phone.ilike(query)) |
        (models.Contact.email.ilike(query))
    ).all()


def update_contact(db: Session, contact_id: int, contact_update: dict):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        return None  # Contact not found

    for key, value in contact_update.items():
        if value is not None:
            setattr(db_contact, key, value)

    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact:
        db.delete(db_contact)
        db.commit()
        return True
    return False

def delete_all_contacts(db: Session):
    db.query(models.Contact).delete()
    db.commit()
    return {"message": "All contacts have been deleted!"}
