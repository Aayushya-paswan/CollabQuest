import React, { useState } from 'react';
import { FaUsers, FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaGoogle, FaGithub } from 'react-icons/fa';
import './Login.css';
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserInfo.jsx';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    await login(formData.username, formData.password);
    navigate("/");
  } catch (err) {
    setError(err.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // Implement social login logic here
    alert(`Would authenticate with ${provider}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        
        {/* Brand Header */}
        <div className="brand-header">
          <div className="logo-circle">
            <FaUsers />
          </div>
          <h1 className="brand">Collab Quest</h1>
          <p className="tagline">Find your perfect team</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link" onClick={(e) => {
              e.preventDefault();
              alert('Password reset would be initiated');
            }}>
              Forgot password?
            </a>
          </div>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              marginBottom: '15px',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FaArrowRight />
              </>
            )}
          </button>

          <p className="footer-text">
            New here? 
            <Link to="/register" className="create-account-link"  >
               Create an account
            </Link>
          </p>
        </form>
      </div>

      {/* Background decorative elements */}
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
      <div className="bg-circle circle-3"></div>
    </div>
  );
};

export default Login;