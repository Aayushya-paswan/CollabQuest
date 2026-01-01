import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime

cred = credentials.Certificate("D:\\CollabQuest-main\\backend\\database\\collabquest-587d6-firebase-adminsdk-fbsvc-57fcaf722b.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://collabquest-587d6-default-rtdb.firebaseio.com/'
})

users_ref = db.reference("users")
def add_user(user_id: str, college:str, linkdin_url: str, name: str, password: str,department: str, year: int,  username: str, email: str, skills: list = None, verified: bool = False, teams: list = None):
    """Add a new user to the database."""
    users_ref.child(user_id).set({
        "username": username,
        "name": name,
        "college": college,
        "password": password,
        "department": department,
        "year": year,
        "email": email,
        "skills": skills or [],
        "verified": verified,
        "verified_skills": {},
        "teams": teams or [],
        "linkdin_url": linkdin_url
    }) 

def get_user(user_id: int):
    """Retrieve a user from the database."""
    return users_ref.child(user_id).get()

def update_user(user_id: int, data: dict):
    """Update user information in the database."""
    users_ref.child(user_id).update(data)

def delete_user(user_id: int):
    """Delete a user from the database."""
    users_ref.child(user_id).delete()

teams_ref = db.reference("teams")
def add_team(team_id: int, name: str, members: list = None, projects: list = None):
    """Add a new team to the database."""
    teams_ref.child(team_id).set({
        "name": name,
        "members": members or [],
        "projects": projects or []
    })

def get_team(team_id: int):
    """Retrieve a team from the database."""
    return teams_ref.child(team_id).get()

def update_team(team_id: int, data: dict):
    """Update team information in the database."""
    teams_ref.child(team_id).update(data)

def delete_team(team_id: int):
    """Delete a team from the database."""
    teams_ref.child(team_id).delete()


def get_user_by_username(username: str):
    """Retrieve a user from the database by username."""
    all_users = users_ref.get()
    for user_id, user_data in all_users.items():
        if user_data.get("username") == username:
            return {**user_data, "user_id": user_id}
    return None


def verify_skill(user_id: str, skill_name: str, verifier_id: str = None):
    """Mark a user's skill as verified. Optionally record verifier id."""
    try:
        user = users_ref.child(user_id).get() or {}
        verified = user.get('verified_skills') or {}
        verified[skill_name] = True
        # optionally store who verified it under a separate map
        users_ref.child(user_id).update({"verified_skills": verified})
        return True
    except Exception as e:
        print(f"Error verifying skill: {e}")
        return False


def unverify_skill(user_id: str, skill_name: str):
    """Remove verification for a user's skill."""
    try:
        user = users_ref.child(user_id).get() or {}
        verified = user.get('verified_skills') or {}
        if skill_name in verified:
            verified.pop(skill_name, None)
            users_ref.child(user_id).update({"verified_skills": verified})
        return True
    except Exception as e:
        print(f"Error unverifying skill: {e}")
        return False

def authorize_user(username: str, password: str) -> bool:
    user_data = get_user_by_username(username)
    if not user_data:
        return False

    user = get_user(user_data["user_id"])
    if user and user.get("password") == password:
        return True
    return False

# Conversations and Messages
conversations_ref = db.reference("conversations")
messages_ref = db.reference("messages")

def create_conversation(user1_id: str, user2_id: str):
    """Create or get a conversation between two users."""
    try:
        conv_id = f"{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"
        existing = conversations_ref.child(conv_id).get()
        
        if not existing or (hasattr(existing, 'val') and not existing.val()):
            now = datetime.now().isoformat()
            conversations_ref.child(conv_id).set({
                "user1": user1_id,
                "user2": user2_id,
                "created_at": now,
                "last_message_at": now
            })
        return conv_id
    except Exception as e:
        print(f"Error creating conversation: {e}")
        raise

def get_conversation(conv_id: str):
    """Get conversation details."""
    try:
        data = conversations_ref.child(conv_id).get()
        if data and hasattr(data, 'val'):
            return data.val() or {}
        return data if isinstance(data, dict) else {}
    except Exception as e:
        print(f"Error getting conversation: {e}")
        return {}

def get_user_conversations(user_id: str):
    """Get all conversations for a user."""
    all_convs = conversations_ref.get() or {}
    user_convs = []
    for conv_id, conv_data in all_convs.items():
        if user_id == conv_data.get("user1") or user_id == conv_data.get("user2"):
            user_convs.append({"conv_id": conv_id, **conv_data})
    return user_convs

def add_message(conv_id: str, sender_id: str, text: str):
    """Add a message to a conversation."""
    msg_id = messages_ref.child(conv_id).push().key
    now = datetime.now().isoformat()
    messages_ref.child(conv_id).child(msg_id).set({
        "sender_id": sender_id,
        "text": text,
        "timestamp": now
    })
    # Update conversation last_message_at
    conversations_ref.child(conv_id).update({"last_message_at": now})
    return msg_id

def get_messages(conv_id: str):
    """Get all messages in a conversation."""
    msgs = messages_ref.child(conv_id).get() or {}
    result = []
    for msg_id, msg_data in msgs.items():
        result.append({"msg_id": msg_id, **msg_data})
    # Sort by timestamp
    result.sort(key=lambda x: x.get("timestamp", 0))
    return result
#add_user("123456", "mukund", "password123","Computer Science", 2, "johndoe", "example", ["python", "django", "firebase"], False, ["team1", "team2"])