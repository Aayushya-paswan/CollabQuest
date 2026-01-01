import React, { useState } from 'react'
import './Home.css'
import { Link } from 'react-router-dom';
import { useUser } from '../../context/Index';
import { useNavigate } from 'react-router-dom';

// New Stats Component (Replaces the 87% meter)
function HeroStats(){
  return (
    <div className="hero-stats-badge">
      <div className="stat-group">
        <div className="stat-value">500+</div>
        <div className="stat-label">Students</div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-group">
        <div className="stat-value">Active</div>
        <div className="stat-label">
           <span className="pulse-dot"></span> AI Matcher
        </div>
      </div>
    </div>
  )
}

function Home() {
  const { createConversation } = useUser();
  const navigate = useNavigate();
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatResults, setCompatResults] = useState([]); 
  const [compatError, setCompatError] = useState('');

  const features = [
    { id:1, title: 'Swipe Matching', desc: 'Browse potential teammates quickly.' },
    { id:2, title: 'AI Compatibility', desc: 'Skill & schedule balancing engine.' },
    { id:3, title: 'Verified Skills', desc: 'Showcase expertise with verified badges.' },
  ];

  return (
    <>
      {/* NO NAVBAR HERE - Fixes the double header issue */}
      
      <main className='home'>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-inner">
            <h1 className="animate-fade-up">CollabQuest <br/> <span className="subtitle-gradient">Smart Team Finder</span></h1>
            <p className="animate-fade-up delay-1">
              Stop scrolling endlessly. Find teammates who complement your skills, 
              match your energy, and fit your schedule.
            </p>

            <div className="hero-ctas animate-fade-up delay-2">
              <Link to="/users" className="btn-primary">Find Teammates</Link>
              <Link to="/partners" className="btn-outline">Auto Match</Link>
            </div>
            
            <div className="hero-meta animate-fade-up delay-3">
              <HeroStats />
              <div className="meta-features">
                <div className="meta-item">🔥 Verify Your Skills</div>
                <div className="meta-item">👥Find Your Teammates</div>
              </div>
            </div>
          </div>

          <aside className="hero-visual animate-slide-in">
            <div className="glass-card">
              <h4>Why Students Love Us</h4>
              <p className="muted">
                Spend less time searching for groups and more time building amazing projects.
              </p>
              <div className="features-grid">
                {features.map(f => (
                  <div className="feature" key={f.id}>
                    <strong>{f.title}</strong>
                    <div className="feat-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* COMPATIBILITY RESULTS */}
        <section className="compat-results">
          {compatLoading && <div className="loading-inline">Searching...</div>}
          {compatError && <div className="error-message">{compatError}</div>}
          
          {compatResults.length > 0 && (
            <div className="fade-in-results">
              <h3>Top AI Matches</h3>
              <div className="matches">
                {compatResults.map(r => (
                  <div className="match-card" key={r.user_id}>
                    <div className="match-left">
                      <div className="avatar">{(r.name||r.username||'U').charAt(0).toUpperCase()}</div>
                      <div className="meta">
                        <div className="name">{r.name || r.username}</div>
                        <div className="dept muted">{r.department || 'Student'}</div>
                      </div>
                    </div>
                    <div className="match-right">
                      <div className="score">{Math.round(r.score)}%</div>
                      <button className="btn-primary small" onClick={async () => {
                        try {
                          const conv = await createConversation(r.user_id);
                          const convId = conv.conv_id || conv.convId;
                          navigate(`/chat/${convId}`);
                        } catch (e) { console.error(e); }
                      }}>Chat</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* HOW IT WORKS - With Pop Up Animations */}
        <section className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps-container">
            <div className="step-card pop-up delay-1">
              <div className="step-number">1</div>
              <h4>Create Profile</h4>
              <p>List your skills, verify them via quizzes, and set your availability.</p>
            </div>
            <div className="step-card pop-up delay-2">
              <div className="step-number">2</div>
              <h4>Get Matched</h4>
              <p>Our algorithm suggests partners who complement your weak spots.</p>
            </div>
            <div className="step-card pop-up delay-3">
              <div className="step-number">3</div>
              <h4>Build Together</h4>
              <p>Launch a project board, chat in real-time, and ship your project.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Home