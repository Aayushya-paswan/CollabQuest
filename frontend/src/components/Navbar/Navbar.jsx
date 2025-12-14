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
  
  // If logged in, show profile and logout buttons
  if (isAuthenticated) {
    return (
      <nav className="navbar">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <div className="nav-logo">Collab Quest</div>
        </Link>
        <div className="nav-buttons">
          <span style={{ marginRight: '15px', color: 'white' }}>
            {currentUser?.name || currentUser?.username}
          </span>
          <button className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <div className="nav-logo">Collab Quest</div>
      </Link>
      <div className="nav-buttons">
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-outline">
            Sign In
          </button>
        </Link>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">
            Create Account
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;