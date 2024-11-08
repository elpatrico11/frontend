import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginForm from "./Components/LoginForm/LoginForm";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import UserDashboard from "./Components/UserDashboard/UserDashboard";
import axios from "axios";

const App = () => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); // New state for blocked users

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/auth/verify",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.blocked) {
            setIsBlocked(true); // Set blocked state if user is blocked
            setRole(null); // Set role to null to prevent access
          } else {
            setRole(response.data.role);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const handleLogin = (userRole, token, blocked) => {
    if (blocked) {
      setIsBlocked(true); // Handle blocked user
      setRole(null); // Prevent blocked user from accessing
    } else {
      setRole(userRole);
      localStorage.setItem("token", token);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setIsBlocked(false); // Reset blocked state on logout
    localStorage.removeItem("token");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isBlocked) {
    return (
      <div>Your account is blocked, please contact the administrator.</div>
    ); // Display a blocked message
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            role ? (
              <Navigate to={role === "admin" ? "/admin" : "/user"} />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            role === "admin" ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user"
          element={
            role === "user" ? (
              <UserDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
