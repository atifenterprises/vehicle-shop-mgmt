import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">↔️</div>
        <div className="logo-text">
          <strong>Premium Auto</strong>
          <br />
          Finance
        </div>
      </div>
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🏠</span> Dashboard
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">👥</span> Customers
        </NavLink>
        <a href="#">
          <span className="icon">💰</span> Loans
        </a>
        <a href="#">
          <span className="icon">💳</span> Payments
        </a>
        <a href="#">
          <span className="icon">📊</span> Reports
        </a>
        <a href="#">
          <span className="icon">📅</span> EMI Calculator
        </a>
        <a href="#">
          <span className="icon">📋</span> Amortization
        </a>
        <a href="#">
          <span className="icon">📦</span> Stocks
        </a>
        <a href="#">
          <span className="icon">🛒</span> Sales
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
