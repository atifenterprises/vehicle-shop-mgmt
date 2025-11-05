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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      console.log('Fetched customers:', data);

      // Handle both flat and nested data formats
      const customers = data.map(item => {
        if (item.customer) {
          // Nested format: { customer, vehicle, sales, summary }
          return {
            ...item.customer,
            loanNumber: item.sales?.loanNumber || '',
            loanStatus: item.summary?.loanStatus || '',
            // Add other fields from nested structure if needed
          };
        } else {
          // Flat format: direct customer object
          return item;
        }
      });

      setCustomers(customers);
      setFilteredCustomers(customers);
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
  const closedLoans = customers.filter(c => c.loanStatus === 'Closed').length;
  const newThisMonth = customers.filter(c => {
    if (!c.date) return false;
    const date = new Date(c.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const handleRowClick = (customer) => {
    navigate(`/customers/${customer.customerId}`, { state: { customer, from: 'customers' } });
  };

  const generateReportHTML = (customers) => {
    const reportDate = new Date().toLocaleDateString();
    return `
      <html>
      <head>
        <title>Customer Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          .report-info { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          @media print {
            body { margin: 10px; }
            th, td { padding: 5px; font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>Customer Management Report</h1>
        <div class="report-info">
          <p>Report Generated on: ${reportDate}</p>
          <p>Total Records: ${customers.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sl. Number</th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Parents Name</th>
              <th>Customer Details</th>
              <th>Contact Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((customer, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${customer.customerId || '-'}</td>
                <td>${customer.name || '-'}</td>
                <td>${customer.fatherName || '-'}</td>
                <td>${customer.address || '-'}</td>
                <td>${customer.mobileNo || '-'}</td>
                <td>${customer.loanStatus || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const handleGenerateReport = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this website to print.');
      return;
    }
    const reportHTML = generateReportHTML(filteredCustomers);
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  return (
    <div className="customer-container">
      <header className="customer-header">
        <>
          <h1><span className="customer-icon">👥</span> Customer Management</h1>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>
      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Customers</div>
            <div className="metric-value">{totalCustomers}</div>
          </div>
          <div className="metric-icon blue">👥</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Active Customers</div>
            <div className="metric-value">{activeLoans}</div>
          </div>
          <div className="metric-icon green">🟢</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Monthly Closed</div>
            <div className="metric-value">{closedLoans}</div>
          </div>
          <div className="metric-icon purple">✅</div>
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
          <h2>Customer Database</h2>
          <p>Manage all customer information and loan details</p>
          <div className="customer-actions">
            <button className="btn btn-primary" onClick={() => navigate('/add-sale')}>+ Add New Sale</button>
            <button className="btn btn-success" onClick={handleGenerateReport}>📊 Generate Report</button>
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
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Parents Name</th>
              <th>Customer Address</th>
              <th>Contact Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr key={customer.customerId || index} className="clickable-row" onClick={() => handleRowClick(customer)}>
                  <td>{index + 1}</td>
                  <td>{customer.customerId || '-'}</td>
                  <td>
                    <div>{customer.name}</div>
                  </td>
                  <td>
                    <div>{customer.fatherName || '-'}</div>
                  </td>
                  <td>
                    <div>{customer.address || '-'}</div>
                  </td>
                  <td>
                    <div>{customer.mobileNo || '-'}</div>
                  </td>
                  <td>
                    <div className={`status-badge ${customer.loanStatus === 'Active' ? 'status-active' : customer.loanStatus === 'Closed' ? 'status-closed' : ''}`}>
                      {customer.loanStatus || 'N/A'}
                    </div>
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
