from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import quiz
import problem
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)
app.include_router(quiz.router)
app.include_router(problem.router)

from database import database
class details(BaseModel):
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
        

@app.post("/signup")
def read_root(details: details):
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


class LoginRequest(BaseModel):
    username: str
    password: str

    
@app.post("/login")
def login_user(data: LoginRequest):
    print("LOGIN REQUEST:", data.username, data.password)

    user = database.get_user_by_username(data.username)
    print("USER FROM DB:", user)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Wrong password")

    return {
        "message": "Login successful",
        "user_id": user["user_id"],
        "username": user["username"]
    }