import React, { useState } from 'react';
import './EditUserForm.css';
import axios from 'axios';

const EditUserForm = ({ user, onUpdate, onBack }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/modify-user/${user._id}`, {
        fullName,
        username,
        password, // Include password only if updating
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      onUpdate(); // Refresh user list
      onBack(); // Go back to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user');
    }
  };

  return (
    <div className="edit-user-container">
      <h2>Edit User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password (leave blank to keep unchanged):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Update User</button>
        <button type="button" onClick={onBack}>Back to Dashboard</button>
      </form>
    </div>
  );
};

export default EditUserForm;