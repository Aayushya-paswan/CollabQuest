import React, { createContext, useContext, useState, useEffect } from 'react';

// API base from Vite env or fallback
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

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
  const [users, setUsers] = useState({});
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

  // helper to fetch JSON
  const fetchJson = async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    try {
      const resp = await fetchJson(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const userId = resp.user_id;
      // fetch full profile
      const profile = await fetchJson(`${API_BASE}/users/${userId}`);

      setCurrentUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem('collabquest_current_user', JSON.stringify(profile));
      localStorage.setItem('collabquest_is_authenticated', 'true');
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('collabquest_current_user');
    localStorage.removeItem('collabquest_is_authenticated');
  };

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    try {
      // create simple unique id
      const userId = Date.now().toString();
      const payload = {
        userid: userId,
        username: userData.username,
        name: userData.name,
        college: userData.college || '',
        password: userData.password,
        department: userData.department || '',
        year: parseInt(userData.year || 0),
        email: userData.email || '',
        skills: userData.skills || [],
        verified: false,
        teams: userData.teams || [],
        linkdin_url: userData.linkdin_url || ''
      };

      await fetchJson(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // fetch created profile
      const profile = await fetchJson(`${API_BASE}/users/${userId}`);
      setCurrentUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem('collabquest_current_user', JSON.stringify(profile));
      localStorage.setItem('collabquest_is_authenticated', 'true');
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!currentUser) throw new Error('No user logged in');
    setLoading(true);
    try {
      const userId = currentUser.user_id || currentUser.userId || currentUser.id;
      const updated = await fetchJson(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      setCurrentUser(updated);
      // update local users map
      setUsers(prev => ({ ...prev, [updated.user_id]: updated }));
      localStorage.setItem('collabquest_current_user', JSON.stringify(updated));
      setLoading(false);
      return updated;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Add skill to user
  const addSkill = (skill) => {
    if (!currentUser) return;
    if (!currentUser.skills || !Array.isArray(currentUser.skills)) currentUser.skills = [];
    if (!currentUser.skills.includes(skill)) {
      const updatedSkills = [...currentUser.skills, skill];
      updateProfile({ skills: updatedSkills });
    }
  };

  // Remove skill from user
  const removeSkill = (skill) => {
    if (!currentUser) return;
    const updatedSkills = (currentUser.skills || []).filter(s => s !== skill);
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
  const getUser = async (userIdOrUsername) => {
    // try id first
    try {
      const byId = await fetchJson(`${API_BASE}/users/${userIdOrUsername}`);
      return byId;
    } catch (e) {
      try {
        const byName = await fetchJson(`${API_BASE}/users/by-username/${userIdOrUsername}`);
        return byName;
      } catch (err) {
        return null;
      }
    }
  };

  // Verify a user's specific skill
  const verifySkill = async (userId, skill) => {
    try {
      await fetchJson(`${API_BASE}/users/${userId}/skills/${encodeURIComponent(skill)}/verify?verifier_id=${currentUser ? currentUser.user_id : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      // refresh profile if it's the current user
      if (currentUser && (currentUser.user_id === userId || currentUser.userId === userId)) {
        const refreshed = await fetchJson(`${API_BASE}/users/${userId}`);
        setCurrentUser(refreshed);
        localStorage.setItem('collabquest_current_user', JSON.stringify(refreshed));
      }
    } catch (err) {
      console.error('Verify skill error:', err);
      throw err;
    }
  };

  const unverifySkill = async (userId, skill) => {
    try {
      await fetchJson(`${API_BASE}/users/${userId}/skills/${encodeURIComponent(skill)}/unverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (currentUser && (currentUser.user_id === userId || currentUser.userId === userId)) {
        const refreshed = await fetchJson(`${API_BASE}/users/${userId}`);
        setCurrentUser(refreshed);
        localStorage.setItem('collabquest_current_user', JSON.stringify(refreshed));
      }
    } catch (err) {
      console.error('Unverify skill error:', err);
      throw err;
    }
  };

  // Get all users
  const getAllUsers = async () => {
    try {
      const list = await fetchJson(`${API_BASE}/users`);
      // normalize map
      const map = {};
      list.forEach(u => { map[u.user_id] = u; });
      setUsers(map);
      return list;
    } catch (err) {
      return Object.entries(users).map(([id, user]) => ({ id, ...user }));
    }
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

  const getCompatibility = async (username1, username2) => {
    try {
      // Prefer POST compute endpoint which accepts either username or user_id
      const payload = { user1: username1, user2: username2 };
      const result = await fetchJson(`${API_BASE}/compatibility/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return result;
    } catch (err) {
      console.error('Compatibility error:', err);
      // fallback to legacy GET endpoint
      try {
        const result = await fetchJson(`${API_BASE}/compatibility/compare/${username1}/${username2}`);
        return result;
      } catch (e) {
        throw err;
      }
    }
  };

  const getConversations = async () => {
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const convs = await fetchJson(`${API_BASE}/conversations/${currentUser.user_id}`);
      return convs;
    } catch (err) {
      console.error('Get conversations error:', err);
      return [];
    }
  };

  const createConversation = async (otherUserId) => {
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const result = await fetchJson(`${API_BASE}/conversations?user1_id=${currentUser.user_id}&user2_id=${otherUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1_id: currentUser.user_id, user2_id: otherUserId })
      });
      return result;
    } catch (err) {
      console.error('Create conversation error:', err);
      throw err;
    }
  };

  const sendMessage = async (convId, text) => {
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const result = await fetchJson(`${API_BASE}/messages/${convId}?sender_id=${currentUser.user_id}&text=${encodeURIComponent(text)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: currentUser.user_id, text })
      });
      return result;
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  const getMessages = async (convId) => {
    try {
      const msgs = await fetchJson(`${API_BASE}/messages/${convId}`);
      return msgs;
    } catch (err) {
      console.error('Get messages error:', err);
      return [];
    }
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
    verifySkill,
    unverifySkill,
    getUser,
    getAllUsers,
    getUsersBySkill,
    getUsersByDepartment,
    getCompatibility,
    getConversations,
    createConversation,
    sendMessage,
    getMessages
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

