import React, { useState } from 'react';
import './AddUserForm.css';
import axios from 'axios';

const AddUserForm = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/add-user',
        { username, fullName, password },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding user');
      console.error('Error details:', err.response?.data);
    }
  };

const handleGenerateOtp = async () => {

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/admin/generate-otp',
      { username }, // Ensure username is correctly passed here
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    setOtp(response.data.otp); // Set OTP from response
  } catch (error) {
    console.error("Error generating OTP:", error);
    setMessage('Error generating OTP');
  }
};



  return (
    <div className="add-user-wrapper">
      <h1>Add New User</h1>
      <form onSubmit={handleAddUser}>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add User</button>
        <button type="button" onClick={handleGenerateOtp}>Generate OTP</button> {/* OTP button */}
      </form>
      {message && <p className="error">{message}</p>}
      {otp && <p>Generated OTP: {otp}</p>} {/* Display OTP */}
    </div>
  );
};

export default AddUserForm;
