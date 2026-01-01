import React, { useState, useEffect, useRef } from 'react';
import './Verification.css';
import Navbar from '../Navbar/Navbar';
import { useUser } from '../../context/Index';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function Verification() {
  const { currentUser } = useUser();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const startTest = async (skill) => {
    if (!currentUser) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/verification/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id, skill })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to start test');
      setSession(data);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(30);
    } catch (err) {
      console.error(err);
      alert('Error starting test: ' + err.message);
    }
    setLoading(false);
  };

  const submitTest = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verification/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id, answers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit');
      setResult(data);
      // refresh profile in localStorage; delay reload so user sees result
      try {
        const profile = await fetch(`${API_BASE}/users/${currentUser.user_id}`);
        const profileJson = await profile.json();
        window.localStorage.setItem('collabquest_current_user', JSON.stringify(profileJson));
        if (data.passed) {
          // delay reload so result is visible
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (e) {
        console.error('Error refreshing profile:', e);
      }
      setSession(null);
    } catch (err) {
      console.error(err);
      alert('Error submitting test: ' + err.message);
    }
    setLoading(false);
  };

  const handleOption = (qid, val) => {
    setAnswers(prev => ({ ...prev, [String(qid)]: val }));
  };

  const [showSolutions, setShowSolutions] = useState(false);

  const gotoNext = () => {
    if (!session) return;
    const total = session.questions.length;
    if (currentIndex + 1 >= total) {
      // last question finished -> auto-submit
      submitTest();
    } else {
      setCurrentIndex(i => i + 1);
      setTimeLeft(30);
    }
  };

  // Timer effect
  useEffect(() => {
    // clear existing
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!session) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // advance question
          gotoNext();
          return 30; // reset for next question (or will be ignored if submitted)
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentIndex]);

  return (
    <>
      <Navbar />
      <div className="verification-page">
        <header className="verification-hero">
          <h1>Skill Verification</h1>
          <p>Verify your skills by taking a short MCQ test generated for each skill.</p>
        </header>

        <section className="verification-list">
          {!currentUser && <div className="empty">Please sign in to verify your skills.</div>}
          {currentUser && (
            <div>
              <h3>Your skills</h3>
              <div className="skill-grid">
                {(currentUser.skills || []).map(s => {
                  const isVerified = currentUser.verified_skills && currentUser.verified_skills[s];
                  return (
                    <div key={s} className="skill-card">
                      <div className="skill-name">{s}</div>
                      <div className="skill-status">{isVerified ? 'Verified ✓' : 'Unverified'}</div>
                      {!isVerified && <button className="btn-primary small" onClick={() => startTest(s)} disabled={loading}>Take Test</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {session && (
          <section className="test-section">
            <h3>Question {currentIndex + 1} of {session.questions.length}</h3>
            <div className="timer">Time left: {timeLeft}s</div>
            {(() => {
              const q = session.questions[currentIndex];
              if (!q) return null;
              return (
                <div key={q.id} className="question">
                  <div className="qtext">{q.question}</div>
                  <div className="options">
                    {q.options.map(opt => (
                      <label key={opt}>
                        <input type="radio" name={String(q.id)} value={opt} checked={answers[String(q.id)] === opt} onChange={() => handleOption(q.id, opt)} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div className="test-actions">
              <button className="btn-primary" onClick={gotoNext} disabled={loading}>Next</button>
              <button className="btn-outline" onClick={() => { setSession(null); setResult(null); }}>Cancel</button>
            </div>
          </section>
        )}

        {result && (
          <section className="result">
            <h3>Result</h3>
            <div>Score: {result.correct} / {result.total} ({Math.round(result.score_percent)}%)</div>
            <div>{result.passed ? 'Passed — skill verified' : 'Failed — try again'}</div>
            <div style={{marginTop:8}}>
              <button className="btn-outline small" onClick={() => setShowSolutions(s => !s)}>{showSolutions ? 'Hide Solutions' : 'Show Solutions'}</button>
            </div>

            {showSolutions && result.solutions && (
              <div className="solutions">
                <h4>Solutions</h4>
                {result.solutions.map(s => (
                  <div key={s.id} className="solution-item">
                    <div className="qtext">{s.question}</div>
                    <div className="sol-answers">
                      <div><strong>Correct:</strong> {s.correct_answer}</div>
                      <div><strong>Your answer:</strong> {s.your_answer || '(no answer)'} {String(s.your_answer).trim().toLowerCase() === String(s.correct_answer).trim().toLowerCase() ? '✔' : '✖'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default Verification;
