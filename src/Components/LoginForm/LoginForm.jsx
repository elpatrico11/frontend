// frontend/src/Components/LoginForm/LoginForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  
  // State variables for lockout
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Fetch CAPTCHA when the component mounts
    const fetchCaptcha = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/captcha');
        setCaptchaQuestion(response.data.question);
        setCaptchaToken(response.data.captchaToken);
      } catch (err) {
        console.error("Error fetching CAPTCHA:", err);
        setError("Failed to load CAPTCHA. Please try again.");
      }
    };

    fetchCaptcha();
  }, []);

  useEffect(() => {
    let timer;
    if (isLocked && lockoutEndTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((lockoutEndTime - now) / 1000); // in seconds
        if (remaining <= 0) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setRemainingTime(0);
          clearInterval(timer);
        } else {
          setRemainingTime(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutEndTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        username,
        password,
        captchaAnswer,
        captchaToken,
      };

      const response = await axios.post('http://localhost:5000/api/auth/login', payload);
      
      if (response.data.otpRequired) {
        setOtpRequired(true);
        setUserId(response.data.userId);
      } else {
        const { token, role } = response.data;
        localStorage.setItem('token', token);
        onLogin(role, token, false);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.lockout) {
          setIsLocked(true);
          setLockoutEndTime(Date.now() + error.response.data.remainingTime * 1000);
        }
        setError(error.response.data.message || 'Error during login');
      } else {
        setError('Error during login');
      }

      // Refresh CAPTCHA on failed login attempts
      try {
        const captchaResponse = await axios.get('http://localhost:5000/api/auth/captcha');
        setCaptchaQuestion(captchaResponse.data.question);
        setCaptchaToken(captchaResponse.data.captchaToken);
        setCaptchaAnswer(''); // Clear previous answer
      } catch (err) {
        console.error("Error refreshing CAPTCHA:", err);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        userId,
        otp,
      };
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', payload);
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      onLogin(role, token, false);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
      // Optionally, you can handle OTP retries or lockouts here
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
            disabled={otpRequired || isLocked} // Disable if OTP is required or locked
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
            disabled={otpRequired || isLocked} // Disable if OTP is required or locked
          />
          <FaLock className='icon' />
        </div>
        {/* CAPTCHA Section */}
        <div className="input-box">
          <label className="captcha-label">{captchaQuestion}</label>
          <input
            type="text"
            placeholder="Your Answer"
            required
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            disabled={otpRequired || isLocked}
          />
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
        {isLocked && (
          <div className="lockout-section">
            <p className="lockout-message">
              Account locked. Try again in {remainingTime} second{remainingTime !== 1 ? 's' : ''}.
            </p>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(remainingTime / 900) * 100}%` }} // Assuming 15 minutes (900 seconds)
              ></div>
            </div>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          className="login-btn" 
          type="submit" 
          disabled={isLocked} // Disable button if locked
        >
          {otpRequired ? 'Verify OTP' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
