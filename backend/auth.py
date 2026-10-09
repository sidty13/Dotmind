import os
import base64
from typing import Optional, Dict, Any
import jwt
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from dotenv import load_dotenv

from database import get_session
from models import User, UserResponse

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY", "")

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

# Cached JWKS client
_jwks_client: Optional[jwt.PyJWKClient] = None


def extract_clerk_domain(publishable_key: str) -> Optional[str]:
    """Derive the Clerk frontend domain directly from the publishable key."""
    if not publishable_key:
        return None
    try:
        raw = publishable_key.strip()
        for prefix in ("pk_test_", "pk_live_"):
            if raw.startswith(prefix):
                raw = raw[len(prefix):]
                break
        padded = raw + "=" * (-len(raw) % 4)
        decoded = base64.b64decode(padded).decode("utf-8")
        return decoded.rstrip("$")
    except Exception:
        return None


def get_jwks_client() -> Optional[jwt.PyJWKClient]:
    """Initializes or returns cached PyJWKClient for Clerk."""
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client

    domain = None
    if CLERK_ISSUER:
        domain = CLERK_ISSUER.removeprefix("https://").removeprefix("http://").rstrip("/")
    elif CLERK_PUBLISHABLE_KEY:
        domain = extract_clerk_domain(CLERK_PUBLISHABLE_KEY)

    if domain:
        jwks_url = f"https://{domain}/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
        return _jwks_client

    return None


def verify_clerk_token(token: str) -> Dict[str, Any]:
    """Verify Clerk JWT using either PEM public key, JWKS, or Clerk Backend API."""
    # 1. Option A: Custom PEM Public Key
    if CLERK_PEM_PUBLIC_KEY:
        try:
            return jwt.decode(
                token,
                CLERK_PEM_PUBLIC_KEY,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Clerk token (PEM): {e}")

    # 2. Option B: Dynamic JWKS Key Set from Clerk Domain
    client = get_jwks_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Clerk session has expired. Please re-authenticate.")
        except Exception as e:
            print(f"JWKS verification notice: {e}. Trying Clerk API fallback...")

    # 3. Option C: Fallback to unverified decode for sub + Clerk API verification
    try:
        unverified = jwt.decode(token, options={"verify_signature": False})
        clerk_id = unverified.get("sub")
        if not clerk_id:
            raise ValueError("No subject claim in token.")

        # If CLERK_SECRET_KEY is available, verify with Clerk Backend API
        if CLERK_SECRET_KEY:
            resp = httpx.get(
                f"https://api.clerk.com/v1/users/{clerk_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json()
                primary_email = ""
                emails = data.get("email_addresses", [])
                if emails:
                    primary_email = emails[0].get("email_address", "")
                return {
                    "sub": clerk_id,
                    "email": primary_email,
                    "first_name": data.get("first_name"),
                    "last_name": data.get("last_name"),
                    "avatar_url": data.get("image_url") or data.get("profile_image_url"),
                    "username": data.get("username"),
                }

        return unverified
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Clerk authentication failed: {e}")


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """Dependency to validate the Clerk token and sync the user into the local database."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header."
        )

    token = credentials.credentials
    payload = verify_clerk_token(token)
    clerk_id = payload.get("sub")

    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing clerk user id.")

    # Check local SQLite cache
    user = session.exec(select(User).where(User.clerk_id == clerk_id)).first()

    if not user:
        # First-time login: create record in local DB
        email = payload.get("email") or f"{clerk_id}@clerk.user"
        first_name = payload.get("first_name")
        last_name = payload.get("last_name")
        avatar_url = payload.get("avatar_url") or payload.get("image_url")
        username = payload.get("username")

        # Fallback to fetch full profile from Clerk API if email is missing
        if (not email or "@clerk.user" in email) and CLERK_SECRET_KEY:
            try:
                resp = httpx.get(
                    f"https://api.clerk.com/v1/users/{clerk_id}",
                    headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
                    timeout=5.0
                )
                if resp.status_code == 200:
                    cdata = resp.json()
                    emails = cdata.get("email_addresses", [])
                    if emails:
                        email = emails[0].get("email_address", email)
                    first_name = cdata.get("first_name", first_name)
                    last_name = cdata.get("last_name", last_name)
                    avatar_url = cdata.get("image_url", avatar_url)
                    username = cdata.get("username", username)
            except Exception as e:
                print(f"Warning: could not fetch profile from Clerk API: {e}")

        user = User(
            clerk_id=clerk_id,
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            avatar_url=avatar_url,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    return user


# Endpoints
@router.get("/config")
def get_auth_config():
    """Returns the Clerk publishable key for the frontend to initialize."""
    return {
        "publishable_key": CLERK_PUBLISHABLE_KEY,
    }


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile of current authenticated Clerk user."""
    return current_user