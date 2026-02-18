import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-wallet me-2"></i>
          Expense Tracker
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user?.role === 'admin' ? (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  <i className="fas fa-chart-line me-1"></i> Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/home">
                    <i className="fas fa-home me-1"></i> Home
                  </Link>
                </li>
              </>
            )}
            
            <li className="nav-item ms-3">
              <span className="nav-link">
                <i className="fas fa-user-circle me-1"></i>
                Welcome, {user?.username}
              </span>
            </li>
            
            <li className="nav-item ms-3">
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              </button>
            </li>
            
            <li className="nav-item ms-3">
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-1"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
