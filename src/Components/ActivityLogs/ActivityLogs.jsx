// src/components/ActivityLogs/ActivityLogs.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './ActivityLogs.css';

const ActivityLogs = ({ onBack }) => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActivityLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivityLogs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Unable to fetch activity logs: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  if (isLoading) return <div>Loading activity logs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="activity-logs">
      <h2>User Activity Logs</h2>
      <button className="small-button" onClick={onBack}>Back to Dashboard</button>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activityLogs.map((log, index) => (
            <tr key={index}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.description}</td>
              <td>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogs;
