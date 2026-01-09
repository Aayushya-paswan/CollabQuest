 CollabQuest – Full Stack App

CollabQuest is a platform to discover coding problems, explore developers, and collaborate via skills, built using React for frontend and FastAPI for backend.

✨ Features

1) Home with featured problems
2) Problems browsing & search
3) Users directory with skill-based discovery
4) Profile management (edit skills & info)
5) Login / Signup with backend
6) Fully responsive UI

--> Tech Stack

Frontend: React + Vite
Backend: FastAPI
State: Context API
Database: FIREBASE
Compatibility score: hugging face transformers model(AI)
questions for skill verification : Gemini API
Styling: CSS (Poppins, gradients)

⚙️ How to Run Locally

1️⃣ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs at  http://localhost:8000

If requirements.txt not present:
pip install fastapi uvicorn pydantic

2️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at http://localhost:5173

📦 Important Dependencies
Backend

fastapi
uvicorn
pydantic

Frontend
react
react-dom
axios
react-router-dom
(all installed automatically via npm install)




