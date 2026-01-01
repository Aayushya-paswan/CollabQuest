import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../Navbar/Navbar';
import { useUser } from '../../context/Index';
import { Link } from 'react-router-dom';

function Profile() {
  const { currentUser, updateProfile } = useUser();
  const [form, setForm] = useState({ name: '', email: '', department: '', year: '', college: '', linkdin_url: '', skills: [] });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        year: currentUser.year || '',
        college: currentUser.college || '',
        linkdin_url: currentUser.linkdin_url || '',
        skills: currentUser.skills || []
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="profile-empty">Please sign in to view your profile.</div>
      </>
    );
  }

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ 
        name: form.name, 
        email: form.email, 
        department: form.department, 
        year: parseInt(form.year) || 0,
        college: form.college,
        linkdin_url: form.linkdin_url,
        skills: form.skills
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error saving profile: ' + err.message);
      console.error(err);
    }
    setSaving(false);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || form.skills.includes(newSkill.trim())) return;
    setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (s) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(sk => sk !== s) }));
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Your Profile</h2>
            <div className="username">@{currentUser.username}</div>
          </div>
          
          {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="row">
              <div className="field small">
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" />
              </div>
              <div className="field small">
                <label>Year</label>
                <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2" />
              </div>
            </div>
            <div className="field">
              <label>College</label>
              <input name="college" value={form.college} onChange={handleChange} placeholder="Your college name" />
            </div>
            <div className="field">
              <label>LinkedIn Profile</label>
              <input name="linkdin_url" value={form.linkdin_url} onChange={handleChange} placeholder="https://linkedin.com/..." />
            </div>
          </div>

          <div className="form-section">
            <h3>Skills</h3>
            <div className="skill-list">
              {form.skills.map(s => {
                const isVerified = currentUser && currentUser.verified_skills && currentUser.verified_skills[s];
                return (
                  <div className="skill-badge" key={s}>
                    <span className="skill-name">{s}</span>
                    {isVerified ? (
                      <span className="verified-label">✓ Verified</span>
                    ) : (
                      <span className="unverified-label">Unverified</span>
                    )}
                    <button className="remove-btn" onClick={() => handleRemoveSkill(s)}>×</button>
                    {!isVerified && (
                      <Link to="/verification" className="btn-secondary small verify-btn" state={{ skill: s }}>
                        Verify
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="skill-progress">
              <strong>Verification progress:</strong>
              {(() => {
                const total = (form.skills || []).length;
                const verifiedCount = (currentUser && currentUser.verified_skills) ? Object.keys(currentUser.verified_skills).filter(k => (form.skills || []).includes(k)).length : 0;
                const pct = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;
                return (
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{width: `${pct}%`}} />
                    <div className="progress-text">{verifiedCount} / {total} verified ({pct}%)</div>
                  </div>
                );
              })()}
            </div>
            <div className="add-skill">
              <input 
                placeholder="Enter a skill..." 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
              />
              <button className="btn-primary small" onClick={handleAddSkill}>Add</button>
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
