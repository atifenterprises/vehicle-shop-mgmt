import React, { useEffect, useState } from "react";
import Sidebar from './Sidebar.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext.jsx'; // adjust path if needed

const Dashboard = ({ openEMIDialog }) => {
  const [metrics, setMetrics] = useState(null);
  const [monthlyCollection, setMonthlyCollection] = useState(null);
  const [loanStatus, setLoanStatus] = useState(null);
  const [salesByType, setSalesByType] = useState(null);
  const [recentPayments, setRecentPayments] = useState(null);
  const [duePayments, setDuePayments] = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

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

    fetch("http://localhost:5000/api/dashboard/sales-by-type")
      .then((res) => res.json())
      .then((data) => setSalesByType(data));

    fetch("http://localhost:5000/api/dashboard/recent-payments")
      .then((res) => res.json())
      .then((data) => setRecentPayments(data));

    fetch("http://localhost:5000/api/dashboard/due-payments")
      .then((res) => res.json())
      .then((data) => setDuePayments(data));

    fetch("http://localhost:5000/api/dashboard/upcoming-payments")
      .then((res) => res.json())
      .then((data) => setUpcomingPayments(data));

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.user-menu')) {
        setShowSignupDropdown(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);


  if (!metrics || !monthlyCollection || !loanStatus || !salesByType) {
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
            {/* <div className="user-avatar">IS</div> */}
            <div className="user-menu">
              <div
                className="user-avatar"
                onClick={() => setShowSignupDropdown(prev => !prev)}
              >
                IS
              </div>

              {showSignupDropdown && (
                <div className="signup-dropdown">
                  <Link
                    to="/signup"
                    className="signup-link"
                    onClick={() => setShowSignupDropdown(false)}
                  >
                    Sign up
                  </Link>

                  {/* NEW: Sign out link */}
                  <button
                    className="dropdown-item signout-btn"
                    onClick={() => {
                      logout();                    // Call logout from AuthContext
                      setShowSignupDropdown(false);
                      navigate('/login');          // Redirect to login
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="metrics">
          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Sales</div>
              <div className="metric-value">{metrics.totalSales}</div>
              <div className="metric-change green">{metrics.totalLoansChange} from last month</div>
            </div>
            <div className="metric-icon blue">💲</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Cash Sales Count</div>
              <div className="metric-value">{metrics.cashSalesCount}</div>
              <div className="metric-change green">₹{metrics.cashSalesAmount.toLocaleString('en-IN')} total</div>
            </div>
            <div className="metric-icon green">✔️</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Battery Sales Count</div>
              <div className="metric-value">{metrics.batterySalesCount}</div>
              <div className="metric-change green">₹{metrics.batterySalesAmount.toLocaleString('en-IN')} total</div>
            </div>
            <div className="metric-icon red">🔋</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
              <div className="metric-change green">{metrics.totalCollectionChange} from last month</div>
            </div>
            <div className="metric-icon purple">📋</div>
          </div>
        </section>

        <section className="charts">
          <div className="chart-card">
            <h2>Monthly Collection Trend</h2>
            {monthlyCollection && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyCollection.months.map((month, idx) => ({
                  month,
                  collection: monthlyCollection.collection[idx]
                }))}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ backgroundColor: '#ffffff', border: 'none', color: 'black', fontWeight: 'bold' }} />
                  <Bar dataKey="collection" fill="#034295ff" activeBar={{ fill: "#082e5c", stroke: "#b6e606ff", strokeWidth: 4, radius: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>Sales by Type</h2>
            {salesByType && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByType.types.map((type, idx) => ({
                      name: type,
                      value: salesByType.amounts[idx],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    activeShape={false}
                  >
                    {salesByType.types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="recent-payments-section">
          <div className="recent-payments-header">
            <h2>Recent Payments</h2>
            <Link to="/loan-repayments" className="view-all-link">View All</Link>
          </div>
          <div className="scrollable-table-container">
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
                {recentPayments && recentPayments.map((payment, idx) => (
                  <tr key={idx}>
                    <td>{payment.customer}</td>
                    <td>{payment.loanNo}</td>
                    <td>₹{parseFloat(payment.amount).toLocaleString('en-IN')}</td>
                    <td>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                    <td><span className="status-paid">{payment.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="upcoming-payments-alert">
          <div className="alert-header">
            <span className="alert-icon">⏰</span>
            <h3>Upcoming Payments</h3>
          </div>
          {upcomingPayments && upcomingPayments.map((upcoming, idx) => (
            <div key={idx} className="upcoming-payment-item">
              <div className="upcoming-payment-info">
                <strong>{upcoming.customer} - {upcoming.loanNo}</strong>
                <div className="upcoming-due-date">Due: {new Date(upcoming.dueDate).toLocaleDateString('en-IN')}</div>
                <div className="upcoming-type">EMI</div>
              </div>
              <div className="upcoming-amount">₹{parseFloat(upcoming.amount).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </section>

        <section className="due-payments-alert">
          <div className="alert-header">
            <span className="alert-icon">❗</span>
            <h3>Due Payments Alert</h3>
          </div>
          {duePayments && duePayments.map((due, idx) => (
            <div key={idx} className="due-payment-item">
              <div className="due-payment-info">
                <strong>{due.customer} - {due.loanNo}</strong>
                <div className="due-date">Due: {new Date(due.dueDate).toLocaleDateString('en-IN')}</div>
                <div className="due-type">{due.type}</div>
                <div className="bucket-info">Bucket: {due.bucketCount} EMIs (₹{parseFloat(due.bucketAmount).toLocaleString('en-IN')})</div>
              </div>
              <div className="due-amount">₹{parseFloat(due.amount).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
