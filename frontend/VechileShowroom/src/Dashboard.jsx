import React, { useEffect, useState } from "react";
import Sidebar from './Sidebar.jsx';

const Dashboard = () => {
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
      <Sidebar />

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
              {loanStatus.statuses.map((status, idx) => (
                <div key={status} className="pie-segment" style={{ flex: loanStatus.counts[idx] }}>
                  {status} ({loanStatus.counts[idx]})
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
