import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("C:\\Users\\Lenovo\\Documents\\GitHub\\CollabQuest\\backend\\database\\collabquest-587d6-firebase-adminsdk-fbsvc-57fcaf722b.json")

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

def authorize_user(username: str, password: str) -> bool:
    user_data = get_user_by_username(username)
    if not user_data:
        return False

    user = get_user(user_data["user_id"])
    if user and user.get("password") == password:
        return True
    return False

#add_user("123456", "mukund", "password123","Computer Science", 2, "johndoe", "example", ["python", "django", "firebase"], False, ["team1", "team2"])