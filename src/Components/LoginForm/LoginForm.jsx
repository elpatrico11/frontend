import { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      
      if (response.data.otpRequired) {
        setOtpRequired(true);
        setUserId(response.data.userId);
      } else {
        const { token, role } = response.data;
        localStorage.setItem('token', token);
        onLogin(role, token, false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error during login');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { userId, otp });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      onLogin(role, token, false);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={otpRequired ? handleVerifyOTP : handleSubmit}>
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={otpRequired} // Disable username if OTP is required
          />
          <FaUser className='icon' />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={otpRequired} // Disable password if OTP is required
          />
          <FaLock className='icon' />
        </div>
        {otpRequired && (
          <div className="input-box">
            <input
              type="text"
              placeholder="One-Time Password (OTP)"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button className="login-btn" type="submit">{otpRequired ? 'Verify OTP' : 'Login'}</button>
      </form>
    </div>
  );
};

export default LoginForm;
