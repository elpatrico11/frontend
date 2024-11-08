import React, { useState } from 'react';
import './ChangeAdminPassword.css';
import axios from 'axios';

const ChangePasswordForm = ({ onPasswordChange, onSuccess, onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/admin/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Call the success handler to show the alert and navigate
      onSuccess(); 
      onPasswordChange(); // Optional: Callback to refresh any necessary state
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-wrapper">
      <h2>Change Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Change Password</button>
      <button type="button" onClick={onBack} className="back-button">Back to Dashboard</button>
    </form>
  );
};

export default ChangePasswordForm;
