import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Cashflow = () => {
    const [cashflows, setCashflows] = useState([]);
    const [filteredCashflows, setFilteredCashflows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedShopNumber, setSelectedShopNumber] = useState('All');
    const navigate = useNavigate();

    const fetchCashflows = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/sales-details?saleType=Cash`;
            console.log('Fetching from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched Cash sales (nested):', data);

            setCashflows(data); // Store raw nested data
        } catch (err) {
            console.error('Failed to fetch cash sales:', err);
            alert('Failed to load data. Check console.');
        }

    };

    // fetch the cashflows on component mount
    useEffect(() => {
        fetchCashflows();
    }, []);

    // filter cashflows based on search term, date range, sale type, and status
    // useEffect(() => {
    //     let filtered = cashflows;

    //     // Filter by sale type - only show cash sales
    //     filtered = filtered.filter(c => c.saleType === 'Cash');

    //     if (searchTerm.trim() !== '') {
    //         const lowerSearch = searchTerm.toLowerCase();
    //         filtered = filtered.filter(c =>
    //             c.name?.toLowerCase().includes(lowerSearch) ||
    //             c.mobile?.toLowerCase().includes(lowerSearch) ||
    //             c.vehicleNumber?.toLowerCase().includes(lowerSearch) ||
    //             c.customerId?.toLowerCase().includes(lowerSearch)
    //         );
    //     }
    //     if (dateRange.from && dateRange.to) {
    //         filtered = filtered.filter(c => {
    //             if (!c.saleDate) return false;
    //             return c.saleDate >= dateRange.from && c.saleDate <= dateRange.to;
    //         });
    //     }
    //     if (selectedStatus !== 'All') {
    //         filtered = filtered.filter(c => (c.loanStatus || 'Completed') === selectedStatus);
    //     }
    //     if (selectedShopNumber !== 'All') {
    //         filtered = filtered.filter(c => c.shopNumber === selectedShopNumber);
    //     }
    //     setFilteredCashflows(filtered);
    // }, [searchTerm, dateRange, selectedStatus, selectedShopNumber, cashflows]);


    // Flatten + Filter whenever rawData or filters change
    useEffect(() => {
        // Flatten: one row per sale
        const flatSales = cashflows
            .filter(c => c.sales && c.sales.length > 0)
            .flatMap(c =>
                c.sales.map(sale => {
                    const vehicle = sale.vehicle || {};
                    return {
                        customer: c.customer,
                        sale,
                        vehicle,
                        // Derived fields
                        monthlyEMI: sale.EMIAmount ?? 0,
                        nextEmiDate: sale.firstEMIDate ?? null,
                        loanStatus: (sale.remainingAmount ?? 0) > 0 ? 'Active' : 'Closed',
                        bucket: 0,
                        overdueCharges: 0,
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
         if (selectedStatus !== 'All') {
            filtered = filtered.filter(c => (c.loanStatus || 'Completed') === selectedStatus);
        }
        if (selectedShopNumber !== 'All') {
            filtered = filtered.filter(c => c.sale.shopNumber?.toString() === selectedShopNumber);
        }

        // Date Range (on saleDate)
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter(s => {
                if (!s.sale.saleDate) return false;
                return s.sale.saleDate >= dateRange.from && s.sale.saleDate <= dateRange.to;
            });
        }

        setFilteredCashflows(filtered);
        console.log('filtered cash flow:: ', filtered)
    }, [searchTerm, dateRange, selectedStatus, selectedShopNumber, cashflows]);

    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('All');
        setSelectedShopNumber('All');
        setDateRange({ from: '', to: '' });
    };

    const handleRowClick = (customer) => {
        const encodedId = encodeURIComponent(customer.customer.customerId);
        navigate(`/customers/${encodedId}`, { state: { customer, from: 'cashflow' } });
    };

    // Calculate metrics from filteredCashflows
    const totalSaleOnCash = filteredCashflows.reduce((sum, item) => sum + (item.sale.totalAmount || 0), 0);
    const receivedAmount = filteredCashflows.reduce((sum, item) => sum + (item.sale.paidAmount || 0), 0);
    const remainingAmount = filteredCashflows.reduce((sum, item) => sum + (item.sale.remainingAmount || 0), 0);
    const activeCount = filteredCashflows.filter(item => item.loanStatus === 'Active').length;
    const closedCount = filteredCashflows.filter(item => item.loanStatus === 'Closed').length;
    const failedCount = filteredCashflows.filter(item => item.loanStatus === 'Overdue').length; // Assuming overdue as failed

    const generateReportHTML = (customers) => {
        const reportDate = new Date().toLocaleDateString();
        return `
          <html>
          <head>
            <title>Sales on Cash Report</title>
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
            <h1>Sales on Cash Report</h1>
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
                        <th>Address</th>
                        <th>Mobile No.</th>
                        <th>Payment Mode</th>
                        <th>Sale Date</th>
                        <th>Shop Number</th>
                        <th>Total Amount (₹)</th>
                        <th>Paid Amount (₹)</th>
                        <th>Remainig Amount(₹)</th>
                        <th>Last Date of Payment</th>
                        <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map((customer, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${customer.customer.customerId || '-'}</td>
                    <td>${customer.customer.name || '-'}</td>
                    <td>${customer.customer.address || '-'}</td>
                    <td>${customer.customer.mobileNo || '-'}</td>
                    <td>Cash</td>
                    <td>${customer.sale.saleDate || '-'}</td>
                    <td>${customer.sale.shopNumber || '-'}</td>
                    <td>${customer.sale.totalAmount || '-'}</td>
                    <td>${customer.sale.paidAmount || '0'}</td>
                    <td>${customer.sale.remainingAmount || '-'}</td>
                    <td>${customer.sale.lastpaymentDate || '-'}</td>
                    <td>${customer.loanStatus || 'Completed'}</td>
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
        const reportHTML = generateReportHTML(filteredCashflows);
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
                    <h1><span className="customer-icon">🏧</span>Sale on Cash</h1>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
                </>
            </header>

            <section className="metrics">
                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Total Sale on Cash</div>
                        <div className="metric-value">₹{totalSaleOnCash.toLocaleString()}</div>
                    </div>
                    <div className="metric-icon blue">💵</div>
                </div>
                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Received Amount</div>
                        <div className="metric-value">₹{receivedAmount.toLocaleString()}</div>
                    </div>
                    <div className="metric-icon purple">💲</div>
                </div>
                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Remaining Amount</div>
                        <div className="metric-value">₹{remainingAmount.toLocaleString()}</div>
                    </div>
                    <div className="metric-icon green">⌛</div>
                </div>

                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Active</div>
                        <div className="metric-value">{activeCount}</div>
                    </div>
                    <div className="metric-icon blue">✅</div>
                </div>
                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Closed</div>
                        <div className="metric-value">{closedCount}</div>
                    </div>
                    <div className="metric-icon blue">✅</div>
                </div>
                <div className="metric-card">
                    <div className="metric-info">
                        <div className="metric-label">Failed to Pay on time</div>
                        <div className="metric-value">{failedCount}</div>
                    </div>
                    <div className="metric-icon red">⚠️</div>
                </div>
            </section>
            <section className="customer-database">
                <div className="customer-database-header">
                    <h2>Manage Sales on cash</h2>
                    <p>Manage all Sales on Cash information</p>
                    <div className="customer-actions">
                        <button className="btn btn-success" onClick={handleGenerateReport}>📊 Generate Report</button>
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
                    <select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        className="input-select"
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        value={selectedShopNumber}
                        onChange={e => setSelectedShopNumber(e.target.value)}
                        className="input-select"
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="All">All Shops</option>
                        <option value="1">Shop 1</option>
                        <option value="2">Shop 2</option>
                        <option value="3">Shop 3</option>
                        <option value="4">Shop 4</option>
                        <option value="5">Shop 5</option>
                    </select>
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
                    <button className="btn btn-clear" onClick={clearFilters}>Clear</button>
                </div>
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>Sl. Number</th>
                            <th>Customer ID</th>
                            <th>Customer Name</th>
                            <th>Address</th>
                            <th>Mobile No.</th>
                            <th>Sale Date</th>
                            <th>Shop Number</th>
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
                                <td colSpan="13" className="no-data">No cashflow customers found.</td>
                            </tr>
                        ) : (
                            filteredCashflows.map((customer, index) => (
                                <tr key={customer.id || index} className="clickable-row" onClick={() => handleRowClick(customer)}>
                                    <td>{index + 1}</td>
                                    <td>{customer.customer.customerId || '-'}</td>
                                    <td>{customer.customer.name || '-'}</td>
                                    <td>{customer.customer.address || '-'}</td>
                                    <td>{customer.customer.mobileNo || '-'}</td>
                                    {/* <td>{customer.saleType || '-'}</td> */}
                                    <td>{customer.sale.saleDate || '-'}</td>
                                    <td>{customer.sale.shopNumber || '-'}</td>
                                    <td>{customer.sale.totalAmount || '-'}</td>
                                    <td>{customer.sale.paidAmount || '0'}</td>
                                    {/* <td>{customer.loanAmount ? customer.loanAmount - customer.downPayment : '-'}</td> */}
                                    <td>{customer.sale.remainingAmount || '-'}</td>
                                    <td>{customer.sale.lastpaymentDate || '-'}</td>
                                    <td><span className={`status-badge ${customer.loanStatus === 'Active' ? 'status-active' : customer.loanStatus === 'Closed' ? 'status-closed' : customer.loanStatus === 'Overdue' ? 'status-overdue' : ''}`}>{customer.loanStatus ?? customer.status ?? '-'}</span></td>
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