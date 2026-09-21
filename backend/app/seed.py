import os

from sqlalchemy.orm import Session

from app.models import User
from app.security import hash_password


def ensure_seed_user(db: Session) -> None:
    """Create the single user account from env vars if no user exists yet."""
    if db.query(User).first() is not None:
        return

    username = os.environ.get("ROADMAP_USERNAME")
    password = os.environ.get("ROADMAP_PASSWORD")
    if not username or not password:
        return

    db.add(User(username=username, hashed_password=hash_password(password)))
    db.commit()
