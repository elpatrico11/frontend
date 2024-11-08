// src/components/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserList from "../UserList/UserList";
import AddUserForm from "../AddUserForm/AddUserForm";
import ChangePasswordForm from "../ChangeAdminPassword/ChangeAdminPassword";
import SafetySettingsForm from "../SafetySettingsForm/SafetySettingsForm"; 
import EditUserForm from "../EditUser/EditUserForm";
import ActivityLogs from "../ActivityLogs/ActivityLogs"; // Import ActivityLogs component

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [safetySettingsUser, setSafetySettingsUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(true); // State to manage visibility
  const [showActivityLogs, setShowActivityLogs] = useState(false); // New state to toggle ActivityLogs view

  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
      setError('Unable to fetch users: ' + (err.response?.data?.message || err.message));
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleChangePasswordForm = useCallback(() => {
    setShowAdminDashboard((prev) => !prev); // Toggle visibility of the admin dashboard
  }, []);

  const handleSafetySettings = useCallback((user) => {
    setSafetySettingsUser(user);
  }, []);

  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
  }, []);

  const handleUpdateUser = useCallback(() => {
    fetchUsers();
    setEditingUser(null);
  }, [fetchUsers]);

  const handleBackToDashboard = useCallback(() => {
    setSafetySettingsUser(null);
    setEditingUser(null);
    setShowAdminDashboard(true); // Show admin dashboard
    setShowActivityLogs(false); // Hide activity logs view
  }, []);

  const handleShowActivityLogs = useCallback(() => {
    setShowActivityLogs(true); // Show activity logs view
    setShowAdminDashboard(false); // Hide admin dashboard view
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wrapper">
      <h1 className="admin">Admin Dashboard</h1>
      {error && <p className="error">{error}</p>}

      {showAdminDashboard ? ( // Check if the main dashboard should be shown
        <>
          {safetySettingsUser ? (
            <SafetySettingsForm 
              user={safetySettingsUser} 
              onBack={handleBackToDashboard} 
              fetchUsers={fetchUsers}
            />
          ) : editingUser ? (
            <EditUserForm 
              user={editingUser} 
              onUpdate={handleUpdateUser} 
              onBack={handleBackToDashboard} 
            />
          ) : (
            <>
              <AddUserForm onUserAdded={handleAddUser} />
              <button className="small-button" onClick={fetchUsers}>Refresh User List</button>
              <UserList 
                users={users} 
                onSafetySettings={handleSafetySettings} 
                onEditUser={handleEditUser}
                fetchUsers={fetchUsers}
              />
              <button className="small-button" onClick={handleToggleChangePasswordForm}>
                Change Admin Password
              </button>
              <button className="small-button" onClick={handleShowActivityLogs}>View Activity Logs</button>
              <button className="small-button" onClick={handleLogout}>Logout</button>
            </>
          )}
        </>
      ) : showActivityLogs ? (
        <ActivityLogs onBack={handleBackToDashboard} /> // Render ActivityLogs when showActivityLogs is true
      ) : (
        <ChangePasswordForm 
          onPasswordChange={fetchUsers} 
          onSuccess={handleBackToDashboard} // Pass back navigation
          onBack={handleBackToDashboard} // Pass back function
        />
      )}
    </div>
  );
};

export default AdminDashboard;
