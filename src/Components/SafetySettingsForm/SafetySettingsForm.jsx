import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SafetySettingsForm.css';

const SafetySettingsForm = ({ user, onBack, fetchUsers }) => {
  const [requireUpperCase, setRequireUpperCase] = useState(false);
  const [requireLowerCase, setRequireLowerCase] = useState(false);
  const [requireSpecialChar, setRequireSpecialChar] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setRequireUpperCase(user.requireUpperCase);
      setRequireLowerCase(user.requireLowerCase);
      setRequireSpecialChar(user.requireSpecialChar);
      
      if (user.passwordExpiry) {
        const expiryDate = new Date(user.passwordExpiry);
        const today = new Date();
        const remainingDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        setExpiryDays(Math.max(remainingDays, 1));
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user?._id) {
      setError('User ID not found. Please try again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/admin/safety-settings/${user._id}`,
        {
          requireUpperCase,
          requireLowerCase,
          requireSpecialChar,
          expiryDays
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Password requirements and expiry updated successfully');
      await fetchUsers();
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password requirements');
    }
  };

  const handleExpiryChange = (e) => {
    const value = parseInt(e.target.value) || 1; // Default to 1 to avoid zero or negative values
    setExpiryDays(Math.max(1, value));
  };

  return (
    <div className="safety-settings-container">
      <h2>Password Requirements for {user?.fullName || 'User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="requirements-group">
          <label>
            <input
              type="checkbox"
              checked={requireUpperCase}
              onChange={(e) => setRequireUpperCase(e.target.checked)}
            />
            Uppercase Letters (A-Z)
          </label>

          <label>
            <input
              type="checkbox"
              checked={requireLowerCase}
              onChange={(e) => setRequireLowerCase(e.target.checked)}
            />
            Lowercase Letters (a-z)
          </label>

          <label>
            <input
              type="checkbox"
              checked={requireSpecialChar}
              onChange={(e) => setRequireSpecialChar(e.target.checked)}
            />
            Special Characters (!@#$%^&*)
          </label>

          <div className="expiry-input-container">
            <label>Password Expiry (days):</label>
            <input
              type="number"
              min="1"
              value={expiryDays}
              onChange={handleExpiryChange}
              className="expiry-days-input"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="submit">Update Requirements</button>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default SafetySettingsForm;
