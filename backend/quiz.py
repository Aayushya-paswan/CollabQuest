
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
import json
import cleanjson 
import os
from dotenv import load_dotenv
load_dotenv()

# Setup AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

router = APIRouter()

class QuizRequest(BaseModel):
    skill: str          

@router.post("/generate-quiz")
def generate_quiz(request: QuizRequest):
    try:
        prompt = f"""
        Generate 5 multiple-choice questions (MCQ) for: {request.skill}.
        Format: JSON Array of objects with keys: id, question, options, correct_answer.
        """
        response = model.generate_content(prompt)
        clean_text = cleanjson.clean_ai_json(response.text)
        return {"questions": json.loads(clean_text)}
    except Exception as e:
        return {"error": str(e)}