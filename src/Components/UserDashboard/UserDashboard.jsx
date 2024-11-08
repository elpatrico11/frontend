import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css'; // Import the CSS file

const UserDashboard = ({ onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setIsFirstLogin(response.data.isFirstLogin);
      } catch (err) {
        console.error('Error checking user status:', err);
      }
    };

    checkUserStatus();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/user/change-password', 
        {
          oldPassword,
          newPassword,
          isFirstLogin,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      if (isFirstLogin) {
        setIsFirstLogin(false);
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error changing password');
    }
  };

  const handleBackToLogin = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  if (isFirstLogin) {
    return (
      <div className="user-dashboard-container">
        <h1>Password Change Required</h1>
        <p className="user-dashboard-instructions">
          Please change your password before accessing the system.
        </p>
        <form onSubmit={handleChangePassword} className="mb-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500">
            Change Password
          </button>
          <button type="button" onClick={handleBackToLogin} className="bg-gray-500">
            Back to Login
          </button>
        </form>
        {message && (
          <p className="user-dashboard-message">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <h1>User Dashboard</h1>
      <form onSubmit={handleChangePassword} className="mb-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">
          Change Password
        </button>
      </form>
      {message && (
        <p className="user-dashboard-message">{message}</p>
      )}
      <button onClick={handleLogout} className="bg-red-500">
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
