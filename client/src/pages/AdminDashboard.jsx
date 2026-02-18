import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalExpenses: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, { username: formData.username, email: formData.email });
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All their expenses will also be deleted.')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-chart-line me-2"></i>Admin Dashboard</h2>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setFormData({ username: '', email: '', password: '' }); setShowModal(true); }}>
          <i className="fas fa-plus me-1"></i> Add User
        </button>
      </div>

      <div className="summary-cards">
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <h3>${stats.totalExpenses.toFixed(2)}</h3>
          <p>Total Expenses</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-bullhorn me-2"></i>
          System Announcements
        </div>
        <div className="card-body">
          <ul className="list-unstyled mb-0">
            <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Admin panel is fully functional</li>
            <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>You can manage all registered users here</li>
            <li className="mb-0"><i className="fas fa-check-circle text-success me-2"></i>All expenses from all users are tracked</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header">User Management</div>
        <div className="card-body">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No users found</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="expense-actions">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(user)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user._id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingUser ? 'Edit User' : 'Create User'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingUser(null); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password {editingUser && '(leave blank to keep current)'}</label>
                    <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} minLength={6} required={!editingUser} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingUser(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
