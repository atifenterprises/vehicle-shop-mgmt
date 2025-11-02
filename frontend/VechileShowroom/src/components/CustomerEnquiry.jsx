import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const CustomerEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    mobile: '',
    interestedVehicle: '',
    estimateDate: '',
    status: 'New'
  });
  const [errors, setErrors] = useState({});

  const fetchEnquiries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customer-enquiries');
      if (!response.ok) {
        throw new Error('Failed to fetch customer enquiries');
      }
      const data = await response.json();
      console.log('Fetched enquiries:', data);
      setEnquiries(data);
      setFilteredEnquiries(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    let filtered = enquiries;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.customerName?.toLowerCase().includes(lowerSearch) ||
        e.mobile?.toLowerCase().includes(lowerSearch) ||
        e.interestedVehicle?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(e => {
        if (!e.estimateDate) return false;
        return e.estimateDate >= dateRange.from && e.estimateDate <= dateRange.to;
      });
    }

    setFilteredEnquiries(filtered);
  }, [searchTerm, statusFilter, dateRange, enquiries]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setDateRange({ from: '', to: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.interestedVehicle.trim()) newErrors.interestedVehicle = 'Interested vehicle is required';

    // Mobile number validation
    if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const url = editingEnquiry
        ? `/api/customer-enquiries/${editingEnquiry.id}`
        : '/api/customer-enquiries';
      const method = editingEnquiry ? 'PUT' : 'POST';

      const response = await fetch(`http://localhost:5000${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingEnquiry ? 'Enquiry updated successfully!' : 'Enquiry added successfully!');
        setShowForm(false);
        setEditingEnquiry(null);
        setFormData({
          customerName: '',
          customerAddress: '',
          mobile: '',
          interestedVehicle: '',
          estimateDate: '',
          status: 'New'
        });
        fetchEnquiries();
      } else {
        alert(editingEnquiry ? 'Failed to update enquiry' : 'Failed to add enquiry');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving enquiry');
    }
  };

  const handleEdit = (enquiry) => {
    setEditingEnquiry(enquiry);
    setFormData({
      customerName: enquiry.customerName || '',
      customerAddress: enquiry.customerAddress || '',
      mobile: enquiry.mobile || '',
      interestedVehicle: enquiry.interestedVehicle || '',
      estimateDate: enquiry.estimateDate || '',
      status: enquiry.status || 'New'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/customer-enquiries/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Enquiry deleted successfully!');
          fetchEnquiries();
        } else {
          alert('Failed to delete enquiry');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting enquiry');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEnquiry(null);
    setFormData({
      customerName: '',
      customerAddress: '',
      mobile: '',
      interestedVehicle: '',
      estimateDate: '',
      status: 'New'
    });
    setErrors({});
  };

  const generateReportHTML = (enquiries) => {
    const reportDate = new Date().toLocaleDateString();
    return `
      <html>
      <head>
        <title>Customer Enquiry Report</title>
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
        <h1>Customer Enquiry Report</h1>
        <div class="report-info">
          <p>Report Generated on: ${reportDate}</p>
          <p>Total Records: ${enquiries.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sl. Number</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Mobile</th>
              <th>Interested Vehicle</th>
              <th>Estimate Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${enquiries.map((enquiry, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${enquiry.customerName || '-'}</td>
                <td>${enquiry.customerAddress || '-'}</td>
                <td>${enquiry.mobile || '-'}</td>
                <td>${enquiry.interestedVehicle || '-'}</td>
                <td>${enquiry.estimateDate || '-'}</td>
                <td>${enquiry.status || 'New'}</td>
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
    const reportHTML = generateReportHTML(filteredEnquiries);
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  // Stats calculations
  const totalEnquiries = filteredEnquiries.length;
  const newEnquiries = filteredEnquiries.filter(e => e.status === 'New').length;
  const contacted = filteredEnquiries.filter(e => e.status === 'Contacted').length;
  const completed = filteredEnquiries.filter(e => e.status === 'Completed').length;
  const thisMonthEnquiries = filteredEnquiries.filter(e => {
    if (!e.createdAt) return false;
    const date = new Date(e.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">📋</span> Customer Enquiry Mgmt</h1>
        <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Enquiries</div>
            <div className="metric-value">{totalEnquiries}</div>
          </div>
          <div className="metric-icon blue">📋</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">New Enquiries</div>
            <div className="metric-value">{newEnquiries}</div>
          </div>
          <div className="metric-icon green">🆕</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Contacted</div>
            <div className="metric-value">{contacted}</div>
          </div>
          <div className="metric-icon orange">⏳</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Completed</div>
            <div className="metric-value">{completed}</div>
          </div>
          <div className="metric-icon purple">✅</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">This Month</div>
            <div className="metric-value">{thisMonthEnquiries}</div>
          </div>
          <div className="metric-icon green">📅</div>
        </div>
      </section>

      <section className="customer-database">
        <div className="customer-database-header">
          <h2>Customer Enquiry Database</h2>
          <p>Manage all customer enquiries and follow-ups</p>
          <div className="customer-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add New Enquiry
            </button>
            <button className="btn btn-success" onClick={handleGenerateReport}>📊 Generate Report</button>
          </div>
        </div>

        <div className="customer-filters">
          <input
            type="text"
            placeholder="Search by name, mobile, vehicle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-search"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select-status"
          >
            <option>All Status</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Completed</option>
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
              <th>Customer Name</th>
              <th>Address</th>
              <th>Mobile</th>
              <th>Interested Vehicle</th>
              <th>Estimate Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No enquiries found.</td>
              </tr>
            ) : (
              filteredEnquiries.map((enquiry, index) => (
                <tr key={enquiry.id || index}>
                  <td>{index + 1}</td>
                  <td>{enquiry.customerName || '-'}</td>
                  <td>
                    <div className="address-cell">
                      {enquiry.customerAddress || '-'}
                    </div>
                  </td>
                  <td>{enquiry.mobile || '-'}</td>
                  <td>{enquiry.interestedVehicle || '-'}</td>
                  <td>{enquiry.estimateDate || '-'}</td>
                  <td>
                    <span className={`status-badge ${enquiry.status?.toLowerCase().replace(' ', '-') || 'new'}`}>
                      {enquiry.status || 'New'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(enquiry)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(enquiry.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="form-header">
              <button className="cancel-btn" onClick={handleCancel}>×</button>
              <h2>{editingEnquiry ? 'Edit Enquiry' : 'Add New Customer Enquiry'}</h2>
            </div>

            <form className="enquiry-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                />
                {errors.customerName && <span className="error">{errors.customerName}</span>}
              </div>

              <div className="form-row">
                <label>Customer Address:</label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  placeholder="Enter customer address"
                  rows="3"
                />
                {errors.customerAddress && <span className="error">{errors.customerAddress}</span>}
              </div>

              <div className="form-row">
                <label>Mobile Number:</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  required
                />
                {errors.mobile && <span className="error">{errors.mobile}</span>}
              </div>

              <div className="form-row">
                <label>Interested Vehicle:</label>
                <input
                  type="text"
                  name="interestedVehicle"
                  value={formData.interestedVehicle}
                  onChange={handleInputChange}
                  placeholder="Enter interested vehicle details"
                  required
                />
                {errors.interestedVehicle && <span className="error">{errors.interestedVehicle}</span>}
              </div>

              <div className="form-row">
                <label>Estimate Date:</label>
                <input
                  type="date"
                  name="estimateDate"
                  value={formData.estimateDate}
                  onChange={handleInputChange}
                />
                {errors.estimateDate && <span className="error">{errors.estimateDate}</span>}
              </div>

              <div className="form-row">
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingEnquiry ? 'Update Enquiry' : 'Add Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiry;
