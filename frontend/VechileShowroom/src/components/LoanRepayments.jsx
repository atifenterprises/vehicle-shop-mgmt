import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanRepayments = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loanStatus, setLoanStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      console.log('Fetched customers:', data);
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

    // Filter by sale type - only show finance sales
    filtered = filtered.filter(c => c.saleType === 'finance');

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
    navigate(`/customers/${customer.id}`, { state: { customer, from: 'sales-finance' } });
  };

  return (
    <div className="customer-container">
      <header className="customer-header">
        <>
          <h1><span className="customer-icon">💵</span> Loan Repayments</h1>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Loans Amount</div>
            <div className="metric-value">₹37,000,236</div>
          </div>
          <div className="metric-icon blue">💰</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Received Amount</div>
            <div className="metric-value">₹17,000,236</div>
          </div>
          <div className="metric-icon blue">🪙</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Remaining Amount</div>
            <div className="metric-value">₹12,000,236</div>
          </div>
          <div className="metric-icon green">⌛</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Loans</div>
            <div className="metric-value">{totalCustomers}</div>
          </div>
          <div className="metric-icon red">👁️‍🗨️</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Active Loans</div>
            <div className="metric-value">{activeLoans}</div>
          </div>
          <div className="metric-icon green">✅</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Closed Loans</div>
            <div className="metric-value">{closedLoans}</div>
          </div>
          <div className="metric-icon blue">🆑</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Overdues</div>
            <div className="metric-value">{overduePayments}</div>
          </div>
          <div className="metric-icon blue">⚠️</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Newly Added in this month</div>
            <div className="metric-value">{newThisMonth}</div>
          </div>
          <div className="metric-icon green">🆕</div>
        </div>
      </section>

      <section className="customer-database">
        <div className="customer-database-header">
          <h2>Manage Sales on Finance</h2>
          <p>Manage all sales on finance</p>
          <div className="customer-actions">
            <button className="btn btn-success">📊 Generte Report</button>
          </div>
        </div>

        <div className="customer-filters">
          <input
            type="text"
            placeholder="Search by name, Model No, Chesis No..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-search"
          />
          <select
            value={loanStatus}
            onChange={e => setLoanStatus(e.target.value)}
            className="select-status"
          >
            <option>All</option>
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
        <table className="customer-table">
          <thead>
            <tr>
              <th>Sl. Number</th>
              <th>Loan Number</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Loan Amount</th>
              <th>EMI Number</th>
              <th>Montly EMI(₹)</th>
              <th>Bucket(No. of Overdues)</th>
              <th>Overdues Charges</th>
              <th>Payable Amount</th>
              <th>Total Paid Amount</th>
              <th>Total Remaining Amount</th>
              <th>Status</th>
              <th>Next EMI Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="14" className="no-data">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr key={customer.id ?? index} onClick={() => handleRowClick(customer)} style={{ cursor: 'pointer' }}>
                  <td>{index + 1}</td>
                  <td>{customer.loanNumber ?? customer.loan_no ?? '-'}</td>
                  <td>{customer.name ?? '-'}</td>
                  <td>{customer.mobile ?? customer.phone ?? '-'}</td>
                  <td>{customer.loanAmount ?? customer.loan_amount}</td>
                  <td>{customer.emiNumber ?? customer.emi_no ?? '-'}</td>
                  <td>{customer.monthlyEMI ?? customer.monthly_emi ?? customer.emi}</td>
                  <td>{customer.bucket ?? customer.overdueCount ?? 0}</td>
                  <td>{customer.overdueCharges ?? customer.overdue_charges}</td>
                  <td>{customer.payableAmount ?? customer.payable_amount}</td>
                  <td>{customer.totalPaidAmount ?? customer.total_paid_amount}</td>
                  <td>{customer.totalRemainingAmount ?? customer.total_remaining_amount}</td>
                  <td>{customer.loanStatus ?? customer.status ?? '-'}</td>
                  <td>{customer.nextEmiDate ?? customer.next_emi_date ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LoanRepayments;
