import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Cashflow = () => {
    const [cashflows, setCashflows] = useState([]);
    const [filteredCashflows, setFilteredCashflows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const navigate = useNavigate();
    const fetchCashflows = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/customers');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCashflows(data);
            setFilteredCashflows(data);
        } catch (err) {
            console.error(err);
        }
    };

    // fetch the cashflows on component mount
    useEffect(() => {
        fetchCashflows();
    }, []);

    // filter cashflows based on search term, date range, and sale type
    useEffect(() => {
        let filtered = cashflows;

        // Filter by sale type - only show cash sales
        filtered = filtered.filter(c => c.saleType === 'cash');

        if (searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(lowerSearch) ||
                c.mobile?.toLowerCase().includes(lowerSearch) ||
                c.vehicleNumber?.toLowerCase().includes(lowerSearch) ||
                c.customerId?.toLowerCase().includes(lowerSearch)
            );
        }
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter(c => {
                if (!c.saleDate) return false;
                return c.saleDate >= dateRange.from && c.saleDate <= dateRange.to;
            });
        }
        setFilteredCashflows(filtered);
    }, [searchTerm, dateRange, cashflows]);

    const handleRowClick = (customer) => {
        navigate(`/customers/${customer.id}`, { state: { customer } });
    };
    return (
     <div className="customer-container">
        <header className="customer-header">
        <>
          <h1><span className="customer-icon">🏧</span> Cashflow Management</h1>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>

      <section className="metrics">
          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Cashflow</div>
              <div className="metric-value">₹ 10,50,000</div>
            </div>
            <div className="metric-icon blue">💵</div>
          </div>
          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Sale on Cash</div>
              <div className="metric-value">23</div>
            </div>
            <div className="metric-icon purple">💲</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Remaining Full Payment</div>
                <div className="metric-value">15</div>    
            </div>
            <div className="metric-icon blue">⌛</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Total Remaining Balance</div>
                <div className="metric-value">₹ 1,30,000</div>
            </div>
            <div className="metric-icon green">®️</div>
          </div>

          <div className="metric-card">
            <div className="metric-info">
              <div className="metric-label">Failed to Pay on time</div>
                <div className="metric-value">11</div>
            </div>
            <div className="metric-icon red">⚠️</div>
          </div>
        </section>
        <section className="customer-database">
            <div className="customer-database-header">
                <h2>Manage Cashflow</h2>
                <p>Manage all cashflow information</p>
                <div className="customer-actions">
                    <button className="btn btn-success">📊 Generte Report</button>
                </div>                                
            </div>
            <div className="customer-filters">
                <input
                    type="text"
                    placeholder="Search by Customer, Mobile Number, and Vehicle..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input-search"
                />
                <div className="date-filters">
                    <label>
                        From:
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                            className="input-date"
                        />
                    </label>
                    <label>
                        To:
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                            className="input-date"
                        />
                    </label>
                </div>
            </div>
            <table className="customer-table">
                <thead>
                    <tr>
                        <th>Sl. Number</th>
                        <th>Customer ID</th>
                        <th>Customer Name</th>
                        <th>Address</th>
                        <th>Mobile No.</th>
                        <th>Payment Mode</th>
                        <th>Sale Date</th>
                        <th>Total Amount (₹)</th>
                        <th>Paid Amount (₹)</th>
                        <th>Remainig Amount(₹)</th>
                        <th>Last Date of Payment</th>
                        <th>Status</th>

                    </tr>
                </thead>
                <tbody>
                    {filteredCashflows.length === 0 ? (
                        <tr>
                            <td colSpan="12" className="no-data">No cashflow customers found.</td>
                        </tr>
                    ) : (
                        filteredCashflows.map((customer, index) => (
                            <tr key={customer.id || index} className="clickable-row" onClick={() => handleRowClick(customer)}>
                                <td>{index + 1}</td>
                                <td>{customer.customerId || '-'}</td>
                                <td>{customer.name || '-'}</td>
                                <td>{customer.address || '-'}</td>
                                <td>{customer.mobile || '-'}</td>
                                <td>{customer.saleType || '-'}</td>
                                <td>{customer.saleDate || '-'}</td>
                                <td>{customer.totalAmount || '-'}</td>
                                <td>{customer.downPayment || '0'}</td>
                                <td>{customer.loanAmount ? customer.loanAmount - customer.downPayment : '-'}</td>
                                <td>{customer.firstEmiDate || '-'}</td>
                                <td>{customer.loanStatus || 'Completed'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            
        </section>
  

     </div>
    );
};
export default Cashflow;