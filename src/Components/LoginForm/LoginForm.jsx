import { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      
      // Check if the user is blocked
      if (response.data.blocked) {
        setError('Your account is blocked. Please contact the administrator.');
        onLogin(null, null, true); // Pass blocked status to parent
        return;
      }

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      onLogin(role, token, false);
    } catch (error) {
      // Handle different error responses
      if (error.response) {
        switch (error.response.status) {
          case 403:
            setError('Your account is blocked. Please contact the administrator.');
            break;
          case 401:
            setError('Invalid username or password');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          />
          <FaLock className='icon' />
        </div>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button className="login-btn" type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;