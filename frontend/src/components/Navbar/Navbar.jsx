import React from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/Index';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // If logged in, show profile, problems and logout buttons
  if (isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <div className="nav-logo">Collab Quest</div>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="nav-btn-outline nav-home">Home</button>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to="/verification" style={{ textDecoration: 'none' }}>
            <button className="nav-btn-outline">Verification</button>
          </Link>
          <Link to="/users" style={{ textDecoration: 'none' }}>
            <button className="nav-btn-outline">Users</button>
          </Link>
          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <button className="nav-btn-outline">💬 Chat</button>
          </Link>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="profile-avatar">
              {(currentUser?.name || currentUser?.username)?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <button className="nav-btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <div className="nav-logo">Collab Quest</div>
        </Link>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="nav-btn-outline nav-home">Home</button>
        </Link>
      </div>
      <div className="nav-buttons">
        <Link to="/verification" style={{ textDecoration: 'none' }}>
          <button className="nav-btn-outline">Verification</button>
        </Link>
        <Link to="/users" style={{ textDecoration: 'none' }}>
          <button className="nav-btn-outline">Users</button>
        </Link>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="nav-btn-outline">Sign In</button>
        </Link>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="nav-btn-primary">Create Account</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;