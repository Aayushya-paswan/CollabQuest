import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import uuid
from database import database

# --- 1. SETUP ROUTER ---
router = APIRouter() 

# --- 2. CONFIG & STATE ---
GOOGLE_API_KEY = "" 
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

# Store sessions here since the routes are here
verification_sessions = {}

# --- 3. MODELS ---
class VerificationStartRequest(BaseModel):
    user_id: str
    skill: str

class VerificationSubmitRequest(BaseModel):
    session_id: str
    answers: dict

# --- 4. HELPER FUNCTIONS ---
def clean_ai_json(text):
    text = text.replace("```json", "").replace("```", "")
    start = text.find('[')
    end = text.rfind(']') + 1
    if start != -1 and end != 0:
        text = text[start:end]
    return text.strip()

def generate_quiz_ai(skill):
    # (Same AI generation logic as before)
    prompt = f"""
    Generate 10 MCQ questions for {skill}.
    Format: JSON Array with keys: id, question, options, correct_answer.
    """
    try:
        response = model.generate_content(prompt)
        clean_text = clean_ai_json(response.text)
        return json.loads(clean_text)
    except Exception:
        return None

# --- 5. ROUTES (Notice we use @router, not @app) ---

@router.post("/start")  # This becomes /verification/start in main.py
def start_verification(req: VerificationStartRequest):
    questions = generate_quiz_ai(req.skill)
    
    if not questions:
        raise HTTPException(status_code=500, detail="AI failed")

    # Separate answers for security
    answers_map = {}
    safe_questions = []
    
    for q in questions:
        qid = str(q.get('id'))
        answers_map[qid] = q.get('correct_answer')
        q_copy = {k: v for k, v in q.items() if k != 'correct_answer'}
        safe_questions.append(q_copy)

    session_id = uuid.uuid4().hex
    verification_sessions[session_id] = {
        'user_id': req.user_id,
        'skill': req.skill,
        'answers': answers_map,
        'questions_full': {str(q.get('id')): q for q in questions}
    }

    return {'session_id': session_id, 'questions': safe_questions}


@router.post("/submit") # This becomes /verification/submit
def submit_verification(req: VerificationSubmitRequest):
    session = verification_sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    correct_map = session['answers']
    correct = 0
    for qid, correct_ans in correct_map.items():
        user_ans = req.answers.get(qid)
        if user_ans and str(user_ans).strip().lower() == str(correct_ans).strip().lower():
            correct += 1

    total = len(correct_map)
    score_percent = (correct / total) * 100 if total > 0 else 0
    passed = score_percent >= 60.0

    # build solutions with question text, options, correct_answer, your_answer
    qfull = session.get('questions_full', {}) or {}
    solutions = []
    for qid, correct_ans in correct_map.items():
        qobj = qfull.get(qid, {})
        solutions.append({
            'id': qid,
            'question': qobj.get('question'),
            'options': qobj.get('options'),
            'correct_answer': correct_ans,
            'your_answer': req.answers.get(qid)
        })

    # mark verified if passed
    if passed:
        try:
            database.verify_skill(session['user_id'], session['skill'])
        except Exception as e:
            print(f"Error marking verified: {e}")

    # Cleanup
    del verification_sessions[req.session_id]

    return {
        'user_id': session['user_id'],
        'skill': session['skill'],
        'total': total,
        'correct': correct,
        'score_percent': score_percent,
        'passed': passed,
        'solutions': solutions
    }