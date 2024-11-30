import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA
import CipherDialog from '../CipherDialog/CipherDialog'; // Import CipherDialog
import './UserDashboard.css';

const UserDashboard = ({ onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasChangedPassword, setHasChangedPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null); // State to store reCAPTCHA token
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCipherDialog, setShowCipherDialog] = useState(false); // State to control CipherDialog
  const recaptchaRef = useRef(null); // Ref for resetting reCAPTCHA
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

        if (!response.data.hasSolvedCipher) {
          setShowCipherDialog(true);
        }
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

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    console.log("reCAPTCHA Token changed:", token);
  };

  const handleRecaptchaError = () => {
    setMessage('reCAPTCHA failed to load. Please try again.');
    console.error('reCAPTCHA failed to load.');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    if (!recaptchaToken) {
      setMessage('Please complete the reCAPTCHA verification.');
      return;
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/user/change-password', 
        { oldPassword, newPassword, recaptchaToken, isFirstLogin },
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
      setRecaptchaToken(null); // Clear reCAPTCHA token

      // Reset reCAPTCHA after successful submission
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        console.log("reCAPTCHA reset successfully");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleLogout(); // Log out on session expiration
      } else {
        setMessage(err.response?.data?.message || 'Error changing password');
        console.log("Error changing password:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCipherSuccess = () => {
    setShowCipherDialog(false);
  };

  const handleCipherClose = () => {
    setShowCipherDialog(false);
  };

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
        {/* reCAPTCHA Widget */}
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="" // Zamień na swój rzeczywisty Site Key
          onChange={handleRecaptchaChange}
          onErrored={handleRecaptchaError}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
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

      {/* Cipher Dialog */}
      {showCipherDialog && (
        <CipherDialog onClose={handleCipherClose} onSuccess={handleCipherSuccess} />
      )}

    </div>
  );
};

export default UserDashboard;
