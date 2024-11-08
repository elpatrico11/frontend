import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import './UserDashboard.css';

const UserDashboard = ({ onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasChangedPassword, setHasChangedPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/status', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setIsFirstLogin(response.data.isFirstLogin);
        setHasChangedPassword(response.data.hasChangedPassword);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          handleLogout(); // Log out on session expiration
        } else {
          console.error('Error checking user status:', err);
        }
      }
    };

    checkUserStatus();
  }, [handleLogout]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/user/change-password', 
        { oldPassword, newPassword, isFirstLogin },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      if (isFirstLogin) {
        setIsFirstLogin(false);
        setHasChangedPassword(true);
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleLogout(); // Log out on session expiration
      } else {
        setMessage(err.response?.data?.message || 'Error changing password');
      }
    }
  };

  const handleBackToLogin = () => {
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

      {/* Show CountdownTimer only if password has been changed after first login */}
      {hasChangedPassword && (
        <CountdownTimer initialTime={1 * 60 * 1000} onTimeout={handleLogout} />
      )}
    </div>
  );
};

export default UserDashboard;
