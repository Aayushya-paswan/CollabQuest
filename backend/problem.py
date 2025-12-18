
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
import json
import cleanjson 

# Setup AI 
GOOGLE_API_KEY = "AIzaSyAkbUUiflQbYMQ_KTp7V_YfAhbkWwj241Y" 
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

router = APIRouter()

# Models specific to coding problems
class QuizRequest(BaseModel):
    skill: str          

class CodeSubmission(BaseModel):
    skill: str
    problem_title: str
    user_code: str

@router.post("/generate-problem")
def generate_problem(request: QuizRequest):
    try:
        prompt = f"""
        Create a coding problem for: {request.skill}.
        Format: JSON Object with title, description, requirements, starter_code.
        """
        response = model.generate_content(prompt)
        clean_text = cleanjson.clean_ai_json(response.text)
        return json.loads(clean_text)
    except Exception as e:
        return {"error": str(e)}

@router.post("/submit-solution")
def submit_solution(request: CodeSubmission):
    try:
        prompt = f"""
        Judge this code for {request.skill}. Problem: {request.problem_title}.
        Code: {request.user_code}
        Return JSON: score, status, feedback.
        """
        response = model.generate_content(prompt)
        clean_text = cleanjson.clean_ai_json(response.text)
        return json.loads(clean_text)
    except Exception as e:
        return {"error": str(e)}