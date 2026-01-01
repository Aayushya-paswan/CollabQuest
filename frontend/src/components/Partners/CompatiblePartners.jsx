import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompatiblePartners.css';
import { useUser } from '../../context/UserInfo';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function CompatiblePartners() {
  const { currentUser, createConversation } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const fetchPartners = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/partners/compatible/${encodeURIComponent(currentUser.username)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.detail || 'Failed to fetch partners');
        } else {
          setResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || 'Unknown error');
      }
      setLoading(false);
    };
    fetchPartners();
  }, [currentUser]);

  return (
    <div className="partners-page">
      <h2>Compatible Partners</h2>
      <p className="muted">People ranked by compatibility with you. Click View or start a chat.</p>
      {!currentUser && <div>Please sign in to see compatible partners.</div>}
      {loading && <div className="loading">Loading partners...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && results.length === 0 && (
        <div>No partners found yet. Try again later.</div>
      )}
      <div className="partners-grid">
        {results.map(p => (
          <div className="partner-card" key={p.user_id}>
            <div className="card-left">
              <div className="avatar">{(p.name||p.username||'U').charAt(0).toUpperCase()}</div>
              <div className="info">
                <div className="name">{p.name || p.username}</div>
                <div className="dept muted">{p.department || ''}</div>
                <div className="skills">
                  {p.verified_skills && Object.keys(p.verified_skills).length > 0 ? (
                    <div className="vs-list">Verified: {Object.keys(p.verified_skills).join(', ')}</div>
                  ) : <div className="no-vs muted">No verified skills yet</div>}
                </div>
              </div>
            </div>
            <div className="card-right">
              <div className="score">{Math.round(p.score)}%</div>
              <div className="actions">
                <Link to={`/users/${p.user_id}`} className="btn-outline">View</Link>
                <button className="btn-primary" onClick={async () => {
                  try {
                    const conv = await createConversation(p.user_id);
                    const convId = conv.conv_id || conv.convId || conv.conv_id;
                    navigate(`/chat/${convId}`);
                  } catch (e) { console.error(e); }
                }}>Chat</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
