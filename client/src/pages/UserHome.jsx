import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../utils/constants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const UserHome = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({ amount: '', category: 'Food', note: '', date: '' });
  const [filters, setFilters] = useState({ category: '', startDate: '', endDate: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categoryStats, setCategoryStats] = useState({ stats: [], total: 0 });
  const [chartType, setChartType] = useState('pie');

  useEffect(() => {
    fetchExpenses();
    fetchCategoryStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/expenses?${params}`);
      setExpenses(response.data.expenses);
      setTotal(response.data.total);
      setPagination(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });
      
      const response = await api.get(`/expenses/category?${params}`);
      setCategoryStats(response.data);
    } catch (error) {
      console.error('Failed to fetch category stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', formData);
        toast.success('Expense added successfully');
      }
      setShowModal(false);
      setEditingExpense(null);
      setFormData({ amount: '', category: 'Food', note: '', date: '' });
      fetchExpenses();
      fetchCategoryStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      note: expense.note || '',
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted successfully');
      fetchExpenses();
      fetchCategoryStats();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/expenses/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', startDate: '', endDate: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const pieData = {
    labels: categoryStats.stats.map(s => s._id),
    datasets: [{
      data: categoryStats.stats.map(s => s.total),
      backgroundColor: categoryStats.stats.map(s => CATEGORY_COLORS[s._id] || '#f1f5f9'),
      borderColor: categoryStats.stats.map(s => CATEGORY_TEXT_COLORS[s._id] || '#475569'),
      borderWidth: 1
    }]
  };

  const barData = {
    labels: categoryStats.stats.map(s => s._id),
    datasets: [{
      label: 'Expenses',
      data: categoryStats.stats.map(s => s.total),
      backgroundColor: categoryStats.stats.map(s => CATEGORY_COLORS[s._id] || '#f1f5f9'),
      borderColor: categoryStats.stats.map(s => CATEGORY_TEXT_COLORS[s._id] || '#475569'),
      borderWidth: 1
    }]
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-list-alt me-2"></i>My Expenses</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={handleExport}>
            <i className="fas fa-download me-1"></i> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setFormData({ amount: '', category: 'Food', note: '', date: '' }); setShowModal(true); }}>
            <i className="fas fa-plus me-1"></i> Add Expense
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3>${total.toFixed(2)}</h3>
          <p>Total Expenses</p>
        </div>
        <div className="card stat-card">
          <h3>{expenses.length}</h3>
          <p>Current Page</p>
        </div>
        <div className="card stat-card">
          <h3>{pagination.total}</h3>
          <p>Total Records</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Expense Filters</span>
              <div>
                <button className={`btn btn-sm ${chartType === 'pie' ? 'btn-primary' : 'btn-outline-primary'} me-1`} onClick={() => setChartType('pie')}>Pie</button>
                <button className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setChartType('bar')}>Bar</button>
              </div>
            </div>
            <div className="card-body">
              <div className="filter-bar">
                <input type="text" className="form-control" placeholder="Search notes..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                <select className="form-select" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="date" className="form-control" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
                <input type="date" className="form-control" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
                <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear</button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Category Breakdown</div>
            <div className="card-body chart-container">
              {categoryStats.stats.length > 0 ? (
                chartType === 'pie' ? <Pie data={pieData} /> : <Bar data={barData} />
              ) : (
                <p className="text-center text-muted">No data to display</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Expense List</div>
        <div className="card-body">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-muted">No expenses found</td></tr>
                    ) : (
                      expenses.map(expense => (
                        <tr key={expense._id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>
                            <span className="category-badge" style={{ backgroundColor: CATEGORY_COLORS[expense.category], color: CATEGORY_TEXT_COLORS[expense.category] }}>
                              {expense.category}
                            </span>
                          </td>
                          <td>${expense.amount.toFixed(2)}</td>
                          <td>{expense.note || '-'}</td>
                          <td>
                            <div className="expense-actions">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(expense)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(expense._id)}>
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
              
              {pagination.totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>Previous</button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>Next</button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingExpense(null); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} step="0.01" min="0" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <textarea className="form-control" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows="2"></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingExpense(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingExpense ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
