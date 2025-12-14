import React, { useState } from 'react';
import './Register.css';
import { FaUpload } from 'react-icons/fa';
const ProfilePage = () => {
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleSave = (fieldName) => {
    alert(`Saved ${fieldName}!`);
  };

  return (
    <div className="page-wrapper">
      <div className="profile-card">
        <h1 className="title">Welcome to the Profile Page</h1>
        {/* Profile Image - Full Width */}
        <div className="profile-upload">
          <label htmlFor="profileInput">
            <img 
              src={imagePreview} 
              className="profile-img" 
              alt="Profile preview" 
            />
          </label>
          <input 
            type="file" 
            id="profileInput" 
            accept="image/*" 
            hidden 
            onChange={handleImageChange}
          />
          <p className="hint-text">Click on the image to upload your profile picture</p>
        </div>

        {/* GRID LAYOUT START */}
        <div className="form-content-grid">
          
          {/* LEFT COLUMN */}
          <div className="grid-column-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Basic Info Section */}
            <section className="section">
              <h2 className="section-title">Basic Information</h2>

              <div className="form-row">
                <label>Full Name</label>
                <div className="input-row">
                  <input className="c" type="text" placeholder="Enter your name" />
                  <button onClick={() => handleSave("Name")}>Save</button>
                </div>
              </div>

              <div className="form-row">
                <label>College Name</label>
                <div className="input-row">
                  <input className="a" type="text" placeholder="Enter your college" />
                  <button onClick={() => handleSave("College")}>Save</button>
                </div>
              </div>

              <div className="form-row">
                <label>Current Year</label>
                <div className="input-row">
                  <input className="y" type="number" placeholder="Enter your year (e.g. 2)" />
                  <button onClick={() => handleSave("Year")}>Save</button>
                </div>
              </div>
            </section>

            {/* Team Info Section */}
            <section className="section">
              <h2 className="section-title">Team Requirements</h2>

              <div className="form-row">
                <label>Team members required</label>
                <div className="input-row">
                  <input type="number" placeholder="Enter number of members needed" />
                  <button onClick={() => handleSave("Team Req")}>Save</button>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="grid-column-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Skills & Project Section */}
            <section className="section">
              <h2 className="section-title">Skills & Project</h2>

              <div className="form-row">
                <label>Skills</label>
                <div className="input-row">
                  <input type="text" placeholder="e.g. React, Node.js, DSA" />
                  <button onClick={() => handleSave("Skills")}>Save</button>
                </div>
              </div>

              <div className="form-row">
                <label>Project Name</label>
                <div className="input-row">
                  <input type="text" placeholder="Enter name of the project" />
                  <button onClick={() => handleSave("Project")}>Save</button>
                </div>
              </div>
            </section>

            {/* Links Section */}
            <section className="section">
              <h2 className="section-title">Profiles & Links</h2>

              <div className="form-row">
                <label>GitHub Profile</label>
                <div className="input-row">
                  <input type="text" placeholder="Paste your GitHub profile link" />
                  <button onClick={() => handleSave("GitHub")}>Save</button>
                </div>
              </div>

              <div className="form-row">
                <label>LinkedIn Profile</label>
                <div className="input-row">
                  <input type="text" placeholder="Paste your LinkedIn profile link" />
                  <button onClick={() => handleSave("LinkedIn")}>Save</button>
                </div>
              </div>
            </section>
          </div>

        </div> 
        {/* GRID LAYOUT END */}

        <div className="footer">
          Made by QuadraTechs
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;