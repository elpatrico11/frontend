import React, { useState, useRef } from 'react';
import './ChangeAdminPassword.css';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

const ChangePasswordForm = ({ onPasswordChange, onSuccess, onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef(null); // For resetting reCAPTCHA

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    console.log("reCAPTCHA Token changed:", token);
  };

  const handleRecaptchaError = () => {
    setError('reCAPTCHA failed to load. Please try again.');
    console.error('reCAPTCHA failed to load.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log("Form submission started");

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      console.log("Password mismatch");
      return;
    }

    if (!recaptchaToken) {
      setError('Please verify that you are not a robot.');
      console.log("reCAPTCHA token missing");
      return;
    }

    console.log("reCAPTCHA Token:", recaptchaToken); // Confirm token is captured

    setIsSubmitting(true);
    console.log("Submitting form with token");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        console.log("JWT token missing");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put('http://localhost:5000/api/admin/change-password', {
        currentPassword,
        newPassword,
        recaptchaToken
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds
      });

      console.log("Password change successful:", response.data);

      // Reset reCAPTCHA before triggering callbacks
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        console.log("reCAPTCHA reset");
      }

      // Now trigger callbacks that might unmount the component
      onSuccess(); 
      onPasswordChange(); // Optional: Callback to refresh any necessary state

    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
        console.log("Axios request timed out");
      } else if (err.response) {
        setError(err.response.data.message || 'Error changing password');
        console.log("Error changing password:", err.response.data);
      } else {
        setError('Error changing password');
        console.log("Error changing password:", err);
      }
    } finally {
      setIsSubmitting(false);
      setRecaptchaToken(null);
      // Removed reCAPTCHA reset from here to prevent conflicts
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
      {/* Google reCAPTCHA */}
      <div className="recaptcha-container">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LdgvYMqAAAAACyk1kT0FuE6ApzrV0DdxAd1DfWP" // Replace with your actual Site Key
          onChange={handleRecaptchaChange}
          onErrored={handleRecaptchaError}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Changing Password...' : 'Change Password'}
      </button>
      <button type="button" onClick={onBack} className="back-button">Back to Dashboard</button>
    </form>
  );
};

export default ChangePasswordForm;
