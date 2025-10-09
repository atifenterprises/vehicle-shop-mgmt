import React, { useEffect, useState } from "react";
import Sidebar from './Sidebar.jsx';

const Dashboard = ({ openEMIDialog }) => {
  const [metrics, setMetrics] = useState(null);
  const [monthlyCollection, setMonthlyCollection] = useState(null);
  const [loanStatus, setLoanStatus] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    fetch("http://localhost:5000/api/dashboard/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data));

    fetch("http://localhost:5000/api/dashboard/monthly-collection")
      .then((res) => res.json())
      .then((data) => setMonthlyCollection(data));

    fetch("http://localhost:5000/api/dashboard/loan-status")
      .then((res) => res.json())
      .then((data) => setLoanStatus(data));

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!metrics || !monthlyCollection || !loanStatus) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`dashboard-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar openEMIDialog={openEMIDialog} />

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Comprehensive vehicle loan management system</p>
          </div>
          <div className="header-right">
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '☰' : '✕'}
            </button>
            <div className="notification">
              🔔<span className="badge">9</span>
            </div>
            <div className="user-avatar">IS</div>
          </div>
        </header>

        <section className="metrics">
          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Loans</div>
              <div className="metric-value">{metrics.totalLoans}</div>
              <div className="metric-change green">{metrics.totalLoansChange} from last month</div>
            </div>
            <div className="metric-icon blue">💲</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Active Loans</div>
              <div className="metric-value">{metrics.activeLoans}</div>
              <div className="metric-change green">{metrics.activeLoansRate} active rate</div>
            </div>
            <div className="metric-icon green">✔️</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Overdue Payments</div>
              <div className="metric-value">{metrics.overduePayments}</div>
              <div className="metric-change red">{metrics.overduePaymentsNote}</div>
            </div>
            <div className="metric-icon red">❗</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Collection</div>
              <div className="metric-value">{metrics.totalCollectionFormatted}</div>
              <div className="metric-change green">{metrics.totalCollectionChange} from last month</div>
            </div>
            <div className="metric-icon purple">📋</div>
          </div>
        </section>

        <section className="charts">
          <div className="chart-card">
            <h2>Monthly Collection Trend</h2>
            {/* Placeholder for chart */}
            <div className="chart-placeholder">
              {monthlyCollection.months.map((month, idx) => (
                <div key={month} className="bar" style={{ height: monthlyCollection.collection[idx] / 1000 + "rem" }}>
                  <span className="bar-label">{month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h2>Loan Status Distribution</h2>
            {/* Placeholder for pie chart */}
            <div className="pie-chart-placeholder">
              {loanStatus.statuses.map((status, idx) => {
                const statusClass = status.toLowerCase().replace(' ', '-');
                const icon = status === 'Active' ? '✔️' : status === 'Closed' ? '✅' : '❗';
                return (
                  <div key={status} className={`pie-segment ${statusClass}`}>
                    <div className="segment-icon">{icon}</div>
                    <div className="segment-content">
                      <div className="segment-label">{status}</div>
                      <div className="segment-count">({loanStatus.counts[idx]})</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="recent-payments-section">
          <div className="recent-payments-header">
            <h2>Recent Payments</h2>
            <a href="/loan-repayments" className="view-all-link">View All</a>
          </div>
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Loan No</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rajesh Kumar</td>
                <td>LN-2024-001</td>
                <td>₹12,500</td>
                <td>Dec 15, 2024</td>
                <td><span className="status-paid">Paid</span></td>
              </tr>
              <tr>
                <td>Priya Sharma</td>
                <td>LN-2024-008</td>
                <td>₹15,200</td>
                <td>Dec 14, 2024</td>
                <td><span className="status-paid">Paid</span></td>
              </tr>
              <tr>
                <td>Amit Patel</td>
                <td>LN-2024-015</td>
                <td>₹9,800</td>
                <td>Dec 14, 2024</td>
                <td><span className="status-due">Due</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="due-payments-alert">
          <div className="alert-header">
            <span className="alert-icon">❗</span>
            <h3>Due Payments Alert</h3>
          </div>
          <div className="due-payment-item">
            <div className="due-payment-info">
              <strong>Suresh Reddy - LN-2024-003</strong>
              <div className="due-date">Due: Today</div>
            </div>
            <div className="due-amount">₹11,200</div>
          </div>
          <div className="due-payment-item">
            <div className="due-payment-info">
              <strong>Neha Gupta - LN-2024-007</strong>
              <div className="due-date">Due: Yesterday</div>
            </div>
            <div className="due-amount">₹13,800</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
