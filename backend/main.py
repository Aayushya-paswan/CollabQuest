from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
        
app = FastAPI()

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


@app.get("/login")
def say_hello(username: str, password: str):
    user = database.get_user_by_username(username)
    if user and user["password"] == password:
        return {"message": "Login successful", "user_id": user["user_id"]}
    else:
        return {"message": "Invalid username or password"}


