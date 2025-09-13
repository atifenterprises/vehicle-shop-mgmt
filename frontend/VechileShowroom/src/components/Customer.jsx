import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loanStatus, setLoanStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.loanNumber?.toLowerCase().includes(lowerSearch) ||
        c.mobile?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by loan status
    if (loanStatus !== 'All Status') {
      filtered = filtered.filter(c => c.loanStatus === loanStatus);
    }

    // Filter by date range (assuming customers have a 'date' field in yyyy-mm-dd)
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(c => {
        if (!c.date) return false;
        return c.date >= dateRange.from && c.date <= dateRange.to;
      });
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, loanStatus, dateRange, customers]);

  const clearFilters = () => {
    setSearchTerm('');
    setLoanStatus('All Status');
    setDateRange({ from: '', to: '' });
  };

  // Stats calculations
  const totalCustomers = customers.length;
  const activeLoans = customers.filter(c => c.loanStatus === 'Active').length;
  const overduePayments = customers.filter(c => c.loanStatus === 'Overdue').length;
  const closedLoans = customers.filter(c => c.loanStatus === 'Closed').length;
  const newThisMonth = customers.filter(c => {
    if (!c.date) return false;
    const date = new Date(c.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const handleRowClick = (customer) => {
    navigate(`/customers/${customer.id}`, { state: { customer } });
  };

  return (
    <div className="customer-container">
      <header className="customer-header">
        <>
          <h1><span className="customer-icon">🔒</span> Customer Management</h1>
          <button className="back-link" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>

      <section className="customer-database">
        <div className="customer-database-header">
          <h2>Customer Database</h2>
          <p>Manage all customer information and loan details</p>
          <div className="customer-actions">
            <button className="btn btn-primary" onClick={() => navigate('/add-sale')}>+ Add New Sale</button>
            <button className="btn btn-success">📊 Export Data</button>
          </div>
        </div>

        <div className="customer-filters">
          <input
            type="text"
            placeholder="Search by name, loan number, mobile..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-search"
          />
          <select
            value={loanStatus}
            onChange={e => setLoanStatus(e.target.value)}
            className="select-status"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Closed</option>
            <option>Overdue</option>
          </select>
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="input-date"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="input-date"
          />
          <button className="btn btn-clear" onClick={clearFilters}>Clear</button>
        </div>

        <div className="customer-stats">
          <div className="stat-card total-customers">
            <div className="stat-value">{totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card active-loans">
            <div className="stat-value">{activeLoans}</div>
            <div className="stat-label">Active Loans</div>
            <div className="stat-icon">✔️</div>
          </div>
          <div className="stat-card overdue-payments">
            <div className="stat-value">{overduePayments}</div>
            <div className="stat-label">Overdue Payments</div>
            <div className="stat-icon">❗</div>
          </div>
          <div className="stat-card closed-loans">
            <div className="stat-value">{closedLoans}</div>
            <div className="stat-label">Closed Loans</div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-card new-this-month">
            <div className="stat-value">{newThisMonth}</div>
            <div className="stat-label">New This Month</div>
            <div className="stat-icon">🆕</div>
          </div>
        </div>

        <table className="customer-table">
          <thead>
            <tr>
              <th>SL.NO</th>
              <th>LOAN NO</th>
              <th>CUSTOMER DETAILS</th>
              <th>CONTACT INFO</th>
              <th>LOAN DETAILS</th>
              <th>STATUS</th>
              <th>NEXT EMI DATE</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr key={customer.id || index} className="clickable-row" onClick={() => handleRowClick(customer)}>
                  <td>{index + 1}</td>
                  <td>{customer.loanNumber || '-'}</td>
                  <td>
                    <div>{customer.name}</div>
                    <div className="loan-details">{customer.loanDetails || ''}</div>
                  </td>
                  <td>
                    <div>{customer.mobile || '-'}</div>
                    <div>{customer.email || '-'}</div>
                  </td>
                  <td>{customer.loanDetails || '-'}</td>
                  <td>
                    <span className={`status-badge status-${customer.loanStatus?.toLowerCase() || 'unknown'}`}>
                      {customer.loanStatus || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {customer.nextEmiDate || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

    </div>
  );
};

export default Customer;
