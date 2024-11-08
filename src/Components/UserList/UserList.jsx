import React from 'react';
import './UserList.css';
import axios from 'axios';

const UserList = ({ users, onSafetySettings, onEditUser, fetchUsers }) => {
  const handleBlockToggle = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const action = user.blocked ? 'unblock' : 'block'; // Determine the action

      const response = await axios.put(
        `http://localhost:5000/api/admin/${action}-user/${user._id}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        alert(`User ${user.blocked ? 'unblocked' : 'blocked'}`);
        fetchUsers(); // Ensure this refetches the user list correctly
      } else {
        alert('Error: Failed to update user status');
      }
    } catch (err) {
      console.error('Error in block/unblock:', err);
      alert(`Error ${user.blocked ? 'unblocking' : 'blocking'} user`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/delete-user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('User deleted');
      fetchUsers();
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="user-list-wrapper">
      <h2>User List</h2>
      <ul>
        {/* Check if users is an array before mapping */}
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <li key={user._id}>
              {user.fullName} ({user.username}) - {user.blocked ? 'Blocked' : 'Active'}
              <div className="button-container">
                <button onClick={() => onSafetySettings(user)}>Safety Settings</button>
                <button onClick={() => onEditUser(user)}>Edit</button>
                <button onClick={() => handleBlockToggle(user)}>
                  {user.blocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </div>
            </li>
          ))
        ) : (
          <li>No users found.</li> // Message for empty or invalid user list
        )}
      </ul>
    </div>
  );
};

export default UserList;
