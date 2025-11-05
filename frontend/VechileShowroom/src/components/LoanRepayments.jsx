import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanRepayments = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loanStatus, setLoanStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const navigate = useNavigate();

  // Fetch only Finance sales (keep raw nested data)
  const fetchCustomers = async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/sales-details?saleType=Finance`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched finance sales (nested):', data);

      setCustomers(data); // Store raw nested data
    } catch (err) {
      console.error('Failed to fetch finance sales:', err);
      alert('Failed to load data. Check console.');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Flatten + Filter whenever rawData or filters change
  useEffect(() => {
    // Flatten: one row per sale
    const flatSales = customers
      .filter(c => c.sales && c.sales.length > 0)
      .flatMap(c =>
        c.sales.map(sale => {
          const vehicle = sale.vehicle || {};
          // Calculate loanStatus based on EMI statuses
          let loanStatus = 'Closed';
          if (sale.emiSchedule && sale.emiSchedule.length > 0) {
            const allPaid = sale.emiSchedule.every(emi => emi.status === 'Paid');
            if (allPaid) {
              loanStatus = 'Closed';
            } else {
              const hasOverdue = sale.emiSchedule.some(emi => emi.status === 'Overdue');
              if (hasOverdue) {
                loanStatus = 'Overdue';
              } else {
                loanStatus = 'Active';
              }
            }
          }
          // Calculate bucket: number of overdue EMIs
          const bucket = sale.emiSchedule ? sale.emiSchedule.filter(emi => emi.status === 'Overdue').length : 0;
          // Calculate overdueCharges: sum of overdue charges
          const overdueCharges = sale.emiSchedule ? sale.emiSchedule.reduce((sum, emi) => sum + (emi.status === 'Overdue' ? (emi.overdueCharges || 0) : 0), 0) : 0;
          return {
            customer: c.customer,
            sale,
            vehicle,
            // Derived fields
            monthlyEMI: sale.EMIAmount ?? 0,
            nextEmiDate: sale.firstEMIDate ?? null,
            loanStatus,
            bucket,
            overdueCharges,
            payableAmount: sale.remainingAmount ?? 0,
          };
        })
      );

    // Apply filters
    let filtered = [...flatSales];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.customer.name?.toLowerCase().includes(term) ||
        s.customer.mobileNo?.toLowerCase().includes(term) ||
        s.sale.loanNumber?.toLowerCase().includes(term) ||
        s.vehicle.chassisNumber?.toLowerCase().includes(term) ||
        s.vehicle.vehicleNumber?.toLowerCase().includes(term)
      );
    }

    // Loan Status
    if (loanStatus !== 'All Status') {
      filtered = filtered.filter(s => s.loanStatus === loanStatus);
    }

    // Date Range (on saleDate)
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(s => {
        if (!s.sale.saleDate) return false;
        return s.sale.saleDate >= dateRange.from && s.sale.saleDate <= dateRange.to;
      });
    }

    setFilteredCustomers(filtered);
    console.log('filtered loan repayments :: ', filtered)
  }, [customers, searchTerm, loanStatus, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setLoanStatus('All Status');
    setDateRange({ from: '', to: '' });
  };

  // Helper to check if date is in current month
  const isCurrentMonth = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Stats calculations from filteredCustomers
  const totalLoansAmount = filteredCustomers
    .filter(item => item.loanStatus !== 'Closed')
    .reduce((sum, item) => sum + (item.sale.loanAmount || 0), 0);

  const totalReceivedAmount = filteredCustomers
    .filter(item => item.loanStatus !== 'Closed')
    .flatMap(item => item.sale.emiSchedule || [])
    .filter(emi => emi.status === 'Paid' && isCurrentMonth(emi.date))
    .reduce((sum, emi) => sum + (emi.amount || 0), 0);

  const totalRemainingAmount = totalLoansAmount - totalReceivedAmount;

  const totalCustomers = new Set(
    filteredCustomers
      .filter(item => item.loanStatus === 'Active')
      .map(item => item.customer.customerId)
  ).size;
  const activeLoans = filteredCustomers.filter(item => item.loanStatus === 'Active').length;
  const overduePayments = filteredCustomers.filter(item => item.loanStatus === 'Overdue').length;
  const closedLoans = filteredCustomers.filter(item => item.loanStatus === 'Closed').length;
  const newThisMonth = filteredCustomers.filter(item => {
    if (!item.sale.saleDate) return false;
    const date = new Date(item.sale.saleDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const handleRowClick = (customer) => {
    console.log('Handlerroclick : ', customer);
    navigate(`/customers/${customer.customerId}`, { state: { customer, from: 'loan-repayments' } });
  };

  const generateReportHTML = (customers) => {
    const reportDate = new Date().toLocaleDateString();
    return `
      <html>
      <head>
        <title>Loan Repayments Report</title>
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
        <h1>Loan Repayments Report</h1>
        <div class="report-info">
          <p>Report Generated on: ${reportDate}</p>
          <p>Total Records: ${customers.length}</p>
        </div>
        <table>
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
            ${customers.map((item, index) => {
              const paidEmisCount = item.sale.emiSchedule
                ? item.sale.emiSchedule.filter(emi => emi.status === 'Paid').length
                : 0;
              const currentEmiNumber = item.loanStatus === 'Closed' ? (item.sale.emiNumber ?? 0) : paidEmisCount + 1;
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.sale.loanNumber ?? '-'}</td>
                  <td>${item.customer.name ?? '-'}</td>
                  <td>${item.customer.mobileNo ?? '-'}</td>
                  <td>${item.sale.loanAmount ?? 0}</td>
                  <td>${currentEmiNumber}</td>
                  <td>${item.monthlyEMI}</td>
                  <td>${item.bucket}</td>
                  <td>${item.overdueCharges}</td>
                  <td>${item.payableAmount}</td>
                  <td>${(item.sale.loanAmount ?? 0) - (item.sale.remainingAmount ?? 0)}</td>
                  <td>${item.sale.remainingAmount ?? 0}</td>
                  <td>${item.loanStatus}</td>
                  <td>${item.nextEmiDate ?? '-'}</td>
                </tr>
              `;
            }).join('')}
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
          <h1><span className="customer-icon">💵</span> Loan Repayments</h1>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Loans Amount</div>
            <div className="metric-value">₹{totalLoansAmount.toLocaleString()}</div>
          </div>
          <div className="metric-icon blue">💰</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Montly Collections</div>
            <div className="metric-value">₹{totalReceivedAmount.toLocaleString()}</div>
          </div>
          <div className="metric-icon blue">🪙</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Remaining Amount</div>
            <div className="metric-value">₹{totalRemainingAmount.toLocaleString()}</div>
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
            <button className="btn btn-success" onClick={handleGenerateReport}>📊 Generate Report</button>
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
              filteredCustomers.map((item, index) => {
                const totalPaid = item.sale.emiSchedule
                  ? item.sale.emiSchedule.filter(emi => emi.status === 'Paid').reduce((sum, emi) => sum + (emi.amount || 0), 0)
                  : 0;
                const totalRemaining = (item.sale.loanAmount || 0) - totalPaid;
                const paidEmisCount = item.sale.emiSchedule
                  ? item.sale.emiSchedule.filter(emi => emi.status === 'Paid').length
                  : 0;
                const remainingEmis = Math.max(0, (item.sale.emiNumber ?? 0) - paidEmisCount);
                return (
                  <tr key={item.sale.id ?? index} onClick={() => handleRowClick(item.customer)} style={{ cursor: 'pointer' }}>
                    <td>{index + 1}</td>
                    <td>{item.sale.loanNumber ?? '-'}</td>
                    <td>{item.customer.name ?? '-'}</td>
                    <td>{item.customer.mobileNo ?? '-'}</td>
                    <td>{item.sale.loanAmount ?? 0}</td>
                    <td>{item.loanStatus === 'Closed' ? (item.sale.emiNumber ?? 0) : paidEmisCount + 1}</td>
                    <td>{item.monthlyEMI}</td>
                    <td>{item.bucket}</td>
                    <td>{item.overdueCharges}</td>
                    <td>{item.payableAmount}</td>
                    <td>{totalPaid}</td>
                    <td>{totalRemaining}</td>
                    <td><span className={`status-badge ${item.loanStatus === 'Active' ? 'status-active' : item.loanStatus === 'Closed' ? 'status-closed' : item.loanStatus === 'Overdue' ? 'status-overdue' : ''}`}>{item.loanStatus}</span></td>
                    <td>{item.nextEmiDate ?? '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LoanRepayments;
