# main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import quiz
from quiz import router as quiz_router
from database import database  # Assumes database.py exists

app = FastAPI()

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REGISTER QUIZ ROUTER ---
# This adds /verification/start and /verification/submit from quiz.py
app.include_router(quiz_router, prefix="/verification", tags=["Verification"])

# --- MODELS ---
class SignupDetails(BaseModel):
    userid: str
    username: str
    name: str
    college: str
    password: str
    department: str
    year: int
    email: str
    skills: list = None
    verified: bool = False
    teams: list = None
    linkdin_url: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- AUTH ENDPOINTS ---

@app.post("/signup")
def signup(details: SignupDetails):
    try:
        database.add_user(
            user_id=details.userid,
            college=details.college,
            linkdin_url=details.linkdin_url,
            name=details.name,
            password=details.password,
            department=details.department,
            year=details.year,
            username=details.username,
            email=details.email,
            skills=details.skills,
            verified=details.verified,
            teams=details.teams
        )
        return {"message": "User added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login_user(data: LoginRequest):
    print("LOGIN REQUEST:", data.username)
    user = database.get_user_by_username(data.username)
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Wrong password")

    return {
        "message": "Login successful",
        "user_id": user["user_id"],
        "username": user["username"]
    }

# --- COMPATIBILITY ENDPOINTS ---

@app.post("/compatibility-score")
def compatibility_score(username1: str, username2: str):
    # Accept either username or user_id for flexibility
    user1 = database.get_user_by_username(username1) or database.get_user(username1)
    user2 = database.get_user_by_username(username2) or database.get_user(username2)

    missing = []
    if not user1:
        missing.append(username1)
    if not user2:
        missing.append(username2)
    if missing:
        detail = f"Users not found: {', '.join(missing)}"
        print(f"compatibility_score: {detail}")
        raise HTTPException(status_code=404, detail=detail)

    from c_score import get_compatibility_score
    score, reason = get_compatibility_score(user1.get("skills", {}), user2.get("skills", {}))

    return {"score": score, "reason": reason}

@app.get("/compatibility/compare/{username1}/{username2}")
def get_compatibility(username1: str, username2: str):
    try:
        # Accept either username or user_id
        user1 = database.get_user_by_username(username1) or database.get_user(username1)
        user2 = database.get_user_by_username(username2) or database.get_user(username2)

        missing = []
        if not user1:
            missing.append(username1)
        if not user2:
            missing.append(username2)
        if missing:
            detail = f"Users not found: {', '.join(missing)}"
            print(f"get_compatibility: {detail}")
            raise HTTPException(status_code=404, detail=detail)

        from c_score import get_compatibility_score

        skills1 = user1.get("skills", []) if isinstance(user1, dict) else []
        skills2 = user2.get("skills", []) if isinstance(user2, dict) else []

        score, reason = get_compatibility_score(skills1, skills2)

        return {
            "score": score,
            "reason": reason,
            "user1": username1,
            "user2": username2
        }
    except Exception as e:
        print(f"Compatibility error: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating compatibility: {str(e)}")


class CompatibilityComputeRequest(BaseModel):
    user1: str
    user2: str


@app.post("/compatibility/compute")
def compute_compatibility(req: CompatibilityComputeRequest):
    """Compute compatibility given two identifiers (username or user_id)."""
    try:
        id1 = req.user1
        id2 = req.user2
        # resolve by username or id
        user1 = database.get_user_by_username(id1) or database.get_user(id1)
        user2 = database.get_user_by_username(id2) or database.get_user(id2)

        missing = []
        if not user1:
            missing.append(id1)
        if not user2:
            missing.append(id2)
        if missing:
            detail = f"Users not found: {', '.join(missing)}"
            print(f"compute_compatibility: {detail}")
            raise HTTPException(status_code=404, detail=detail)

        from c_score import get_compatibility_score
        skills1 = user1.get('skills') or []
        skills2 = user2.get('skills') or []
        score, reason = get_compatibility_score(skills1, skills2)
        return { 'score': score, 'reason': reason }
    except HTTPException:
        raise
    except Exception as e:
        print(f"compute_compatibility error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compatibility/ranked/{username}")
def rank_compatibility(username: str, limit: int = 20):
    """Return other users ranked by compatibility with the given username."""
    try:
        base_user = database.get_user_by_username(username)
        if not base_user:
            raise HTTPException(status_code=404, detail="User not found")

        all_users = database.users_ref.get() or {}
        print(f"rank_compatibility: base={base_user.get('user_id')} users_count={len(all_users)}")
        results = []
        from c_score import get_compatibility_score

        base_skills = base_user.get('skills') or []

        for uid, udata in all_users.items():
            # skip self
            if uid == base_user.get('user_id'):
                continue
            try:
                other_skills = udata.get('skills') or []
                score, reason = get_compatibility_score(base_skills, other_skills)
                results.append({
                    'user_id': uid,
                    'username': udata.get('username'),
                    'name': udata.get('name'),
                    'department': udata.get('department'),
                    'score': score,
                    'reason': reason
                })
            except Exception as e:
                print(f"Error scoring {uid}: {e}")

        # sort descending
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        print(f"rank_compatibility: results_count={len(results)}")
        return { 'user': base_user.get('user_id'), 'results': results[:limit] }
    except HTTPException:
        raise
    except Exception as e:
        print(f"rank_compatibility error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/partners/compatible/{username}")
def partners_compatible(username: str, limit: int = 50, department: str = None):
    """Return a dedicated partners view (ranked compatibility). Optional department filter."""
    try:
        base_user = database.get_user_by_username(username)
        if not base_user:
            raise HTTPException(status_code=404, detail="User not found")

        all_users = database.users_ref.get() or {}
        print(f"partners_compatible: base={base_user.get('user_id')} users_count={len(all_users)}")
        results = []
        from c_score import get_compatibility_score

        base_skills = base_user.get('skills') or []

        for uid, udata in all_users.items():
            if uid == base_user.get('user_id'):
                continue
            if department and udata.get('department', '').lower() != department.lower():
                continue
            try:
                other_skills = udata.get('skills') or []
                score, reason = get_compatibility_score(base_skills, other_skills)
                results.append({
                    'user_id': uid,
                    'username': udata.get('username'),
                    'name': udata.get('name'),
                    'department': udata.get('department'),
                    'score': score,
                    'reason': reason,
                    'verified_skills': udata.get('verified_skills', {})
                })
            except Exception as e:
                print(f"Error scoring {uid}: {e}")

        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        print(f"partners_compatible: results_count={len(results)}")
        return { 'user': base_user.get('user_id'), 'results': results[:limit] }
    except HTTPException:
        raise
    except Exception as e:
        print(f"partners_compatible error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- CHAT ENDPOINTS ---

@app.post("/conversations")
def create_conversation(user1_id: str = Query(...), user2_id: str = Query(...)):
    try:
        conv_id = database.create_conversation(user1_id, user2_id)
        conv = database.get_conversation(conv_id)
        
        if not conv:
            return {"conv_id": conv_id, "user1": user1_id, "user2": user2_id}
        
        return {"conv_id": conv_id, **conv}
    except Exception as e:
        print(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{user_id}")
def get_user_conversations(user_id: str):
    return database.get_user_conversations(user_id)

@app.post("/messages/{conv_id}")
def send_message(conv_id: str, sender_id: str, text: str):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    msg_id = database.add_message(conv_id, sender_id, text.strip())
    return {"msg_id": msg_id, "status": "sent"}

@app.get("/messages/{conv_id}")
def get_messages(conv_id: str):
    return database.get_messages(conv_id)

# --- USER MANAGEMENT ENDPOINTS ---

@app.get("/users")
def list_users():
    all_users = database.users_ref.get() or {}
    result = []
    for uid, data in all_users.items():
        item = {"user_id": uid}
        item.update(data)
        result.append(item)
    return result

@app.get("/users/{user_id}")
def get_user(user_id: str):
    user = database.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, **user}

@app.patch("/users/{user_id}")
def patch_user(user_id: str, updates: dict):
    existing = database.get_user(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    database.update_user(user_id, updates)
    updated = database.get_user(user_id)
    return {"user_id": user_id, **updated}

@app.get("/users/{user_id}/skills")
def get_user_skills(user_id: str):
    user = database.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skills = user.get("skills") or []
    verified = user.get("verified_skills") or {}
    return {"user_id": user_id, "skills": skills, "verified_skills": verified}

@app.get("/users/by-username/{username}")
def get_user_by_username(username: str):
    user = database.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- SKILL VERIFICATION (MANUAL) ---

@app.post("/users/{user_id}/skills/{skill_name}/verify")
def verify_user_skill(user_id: str, skill_name: str, verifier_id: str = Query(None)):
    user = database.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    success = database.verify_skill(user_id, skill_name, verifier_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify skill")
    return {"user_id": user_id, "skill": skill_name, "verified": True}

@app.post("/users/{user_id}/skills/{skill_name}/unverify")
def unverify_user_skill(user_id: str, skill_name: str):
    user = database.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    success = database.unverify_skill(user_id, skill_name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to unverify skill")
    return {"user_id": user_id, "skill": skill_name, "verified": False}