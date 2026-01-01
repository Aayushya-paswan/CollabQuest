import React, { useEffect, useState } from 'react';
import './UserDetail.css';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
import { useUser } from '../../context/Index';
import { useNavigate } from 'react-router-dom';

function UserDetail(){
  const { id } = useParams();
  const { getUser, currentUser, getCompatibility, createConversation } = useUser();
    const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [showCompat, setShowCompat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try{
        const u = await getUser(id);
        setUser(u);
      }catch(e){
        console.error(e);
      }
      setLoading(false);
    })();
  },[id]);

  const handleCalculateCompatibility = async () => {
    if (!currentUser || !user) return;
    setCalcLoading(true);
    try {
      const result = await getCompatibility(currentUser.username, user.username);
      setCompatibility(result);
      setShowCompat(true);
    } catch (err) {
      console.error('Error calculating compatibility:', err);
      alert('Could not calculate compatibility. Try again.');
    }
    setCalcLoading(false);
  };

  const handleStartChat = async () => {
    if (!currentUser || !user) return;
    setChatLoading(true);
    try {
      const conv = await createConversation(user.user_id);
      navigate(`/chat/${conv.conv_id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      alert('Could not start chat. Try again.');
    }
    setChatLoading(false);
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Low Match';
  };

  return (
    <>
      <Navbar />
      <div className="userdetail-page">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : !user ? (
          <div className="empty">User not found</div>
        ) : (
          <div className="detail-card">
            <div className="top">
              <h2>{user.name || user.username}</h2>
              <div className="username">@{user.username}</div>
            </div>
            <div className="meta">
              <div><strong>Department:</strong> {user.department}</div>
              <div><strong>Year:</strong> {user.year}</div>
              <div><strong>College:</strong> {user.college}</div>
              <div><strong>LinkedIn:</strong> {user.linkdin_url}</div>
            </div>
            <div className="skills">
              <h4>Skills</h4>
              <div className="skill-list">
                {(user.skills||[]).map(s=> {
                  const isVerified = user && user.verified_skills && user.verified_skills[s];
                  return (
                    <span key={s} className={`tag ${isVerified ? 'verified' : 'unverified'}`}>
                      {s}{isVerified ? <span className="vs-mark"> ✓</span> : null}
                    </span>
                  );
                })}
              </div>
              <div className="skills-meta muted">{user.verified_skills ? Object.keys(user.verified_skills).length : 0} verified</div>
            </div>

            {currentUser && currentUser.username !== user.username && (
              <div className="compatibility-section">
                {!showCompat ? (
                  <button 
                    className="btn-compat" 
                    onClick={handleCalculateCompatibility}
                    disabled={calcLoading}
                  >
                    {calcLoading ? 'Calculating...' : '🎯 Calculate Compatibility'}
                  </button>
                ) : compatibility ? (
                  <div className="compat-result">
                    <div className="compat-header">
                      <h4>Skill Compatibility Match</h4>
                    </div>
                    <div className="compat-card">
                      <div className="score-circle" style={{ borderColor: getCompatibilityColor(compatibility.score) }}>
                        <div className="score-value">{compatibility.score}%</div>
                        <div className="score-label">{getCompatibilityLabel(compatibility.score)}</div>
                      </div>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ 
                            width: `${compatibility.score}%`,
                            backgroundColor: getCompatibilityColor(compatibility.score)
                          }}
                        />
                      </div>
                      <div className="reason">
                        <strong>Analysis:</strong> {compatibility.reason}
                      </div>
                    </div>
                    <button className="btn-recalc" onClick={() => setShowCompat(false)}>
                      Recalculate
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {currentUser && currentUser.username !== user.username && (
              <div className="chat-section">
                <button 
                  className="btn-chat" 
                  onClick={handleStartChat}
                  disabled={chatLoading}
                >
                  {chatLoading ? 'Starting...' : '💬 Start Chat'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default UserDetail;
