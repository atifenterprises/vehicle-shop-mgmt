import React from 'react';

const Sidebar = ({ openEMIDialog = () => { } }) => {
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
        <a href="/" className="nav-link">
          <span className="icon">🏠</span> Dashboard
        </a>
        <a href="customers" className="nav-link">
          <span className="icon">👥</span> Customers/Sales
        </a>
        <a href="sales-finance" className="nav-link">
          <span className="icon">💱</span> Sale on Finance
        </a>
        <a href="cashflows" className="nav-link">
          <span className="icon">💲</span> Sale on Cash
        </a>
        <a href="loan-repayments" className="nav-link">
          <span className="icon">💳</span> Payments/Loans
        </a>
        <a href="vehicles" className="nav-link">
          <span className="icon">🚙</span> Vehicle(Stocks)
        </a>
        <a href="batteries" className="nav-link">
          <span className="icon">🔋</span> Batteries
        </a>
        <a href="customerEnquiry" className="nav-link">
          <span className="icon">📝</span> Customer Enquiry
        </a>
        <button className="nav-link button-link button-link-no-padding" onClick={openEMIDialog}>
          <span className="icon">📅</span> EMI Calculator
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
