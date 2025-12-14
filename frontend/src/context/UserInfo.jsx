import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial user data structure
const initialUserData = {
  "user123": {
    "department": "Computer Science",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "password123",
    "skills": ["python", "django", "firebase"],
    "teams": ["team1", "team2"],
    "username": "johndoe",
    "verified": false,
    "year": 2
  }
};

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUserData);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('collabquest_current_user');
    const storedAuth = localStorage.getItem('collabquest_is_authenticated');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('collabquest_current_user');
        localStorage.removeItem('collabquest_is_authenticated');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (username, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users[username];
        
        if (user && user.password === password) {
          const userData = {
            id: username,
            ...user
          };
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
          
          // Store in localStorage
          localStorage.setItem('collabquest_current_user', JSON.stringify(userData));
          localStorage.setItem('collabquest_is_authenticated', 'true');
          
          resolve(userData);
        } else {
          reject(new Error('Invalid username or password'));
        }
        setLoading(false);
      }, 500); // Simulate API delay
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('collabquest_current_user');
    localStorage.removeItem('collabquest_is_authenticated');
  };

  // Register new user
  const register = (userData) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setTimeout(() => {
        const { username, email, password, name, department, year } = userData;
        
        // Check if user already exists
        if (users[username]) {
          reject(new Error('Username already exists'));
          return;
        }
        
        // Create new user
        const newUser = {
          department,
          email,
          name,
          password,
          skills: [],
          teams: [],
          username,
          verified: false,
          year: parseInt(year)
        };
        
        // Add to users
        setUsers(prev => ({
          ...prev,
          [username]: newUser
        }));
        
        // Auto-login after registration
        const completeUserData = {
          id: username,
          ...newUser
        };
        
        setCurrentUser(completeUserData);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('collabquest_current_user', JSON.stringify(completeUserData));
        localStorage.setItem('collabquest_is_authenticated', 'true');
        
        resolve(completeUserData);
        setLoading(false);
      }, 500);
    });
  };

  // Update user profile
  const updateProfile = (updates) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = {
          ...currentUser,
          ...updates
        };
        
        // Update in users state
        setUsers(prev => ({
          ...prev,
          [currentUser.username]: {
            ...prev[currentUser.username],
            ...updates
          }
        }));
        
        // Update current user
        setCurrentUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('collabquest_current_user', JSON.stringify(updatedUser));
        
        resolve(updatedUser);
        setLoading(false);
      }, 500);
    });
  };

  // Add skill to user
  const addSkill = (skill) => {
    if (!currentUser) return;
    
    if (!currentUser.skills.includes(skill)) {
      const updatedSkills = [...currentUser.skills, skill];
      updateProfile({ skills: updatedSkills });
    }
  };

  // Remove skill from user
  const removeSkill = (skill) => {
    if (!currentUser) return;
    
    const updatedSkills = currentUser.skills.filter(s => s !== skill);
    updateProfile({ skills: updatedSkills });
  };

  // Join team
  const joinTeam = (teamId) => {
    if (!currentUser) return;
    
    if (!currentUser.teams.includes(teamId)) {
      const updatedTeams = [...currentUser.teams, teamId];
      updateProfile({ teams: updatedTeams });
    }
  };

  // Leave team
  const leaveTeam = (teamId) => {
    if (!currentUser) return;
    
    const updatedTeams = currentUser.teams.filter(t => t !== teamId);
    updateProfile({ teams: updatedTeams });
  };

  // Verify user (admin function)
  const verifyUser = (username) => {
    setUsers(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        verified: true
      }
    }));
  };

  // Get user by username
  const getUser = (username) => {
    return users[username];
  };

  // Get all users
  const getAllUsers = () => {
    return Object.entries(users).map(([id, user]) => ({
      id,
      ...user
    }));
  };

  // Get users by skill
  const getUsersBySkill = (skill) => {
    return getAllUsers().filter(user => 
      user.skills.some(s => 
        s.toLowerCase().includes(skill.toLowerCase())
      )
    );
  };

  // Get users by department
  const getUsersByDepartment = (department) => {
    return getAllUsers().filter(user => 
      user.department.toLowerCase() === department.toLowerCase()
    );
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile,
    addSkill,
    removeSkill,
    joinTeam,
    leaveTeam,
    verifyUser,
    getUser,
    getAllUsers,
    getUsersBySkill,
    getUsersByDepartment
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

