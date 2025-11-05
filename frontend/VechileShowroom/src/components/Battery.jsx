import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Battery = () => {
  const [batteries, setBatteries] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredBatteries, setFilteredBatteries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingBattery, setEditingBattery] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    serialNumber: '',
    batteryName: '',
    batteryType: '',
    price: '',
    warrantyMonths: 12,
    status: 'In Stock',
    purchaseDate: '',
    saleDate: ''
  });
  const [errors, setErrors] = useState({});

  const fetchBatteries = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries`);
      if (!response.ok) {
        throw new Error('Failed to fetch batteries');
      }
      const data = await response.json();
      console.log('Fetched batteries:', data);
      setBatteries(data);
      setFilteredBatteries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/battery-sales`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      const data = await response.json();
      console.log('Fetched sales:', data);
      setSales(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBatteries();
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = batteries;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.serialNumber?.toLowerCase().includes(lowerSearch) ||
        b.batteryName?.toLowerCase().includes(lowerSearch) ||
        b.batteryType?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(b => {
        if (!b.purchaseDate) return false;
        return b.purchaseDate >= dateRange.from && b.purchaseDate <= dateRange.to;
      });
    }

    setFilteredBatteries(filtered);
  }, [searchTerm, statusFilter, dateRange, batteries]);

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
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.batteryName.trim()) newErrors.batteryName = 'Battery name is required';
    if (!formData.batteryType.trim()) newErrors.batteryType = 'Battery type is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const url = editingBattery
        ? `/api/batteries/${editingBattery.serialNumber}`
        : '/api/batteries';
      const method = editingBattery ? 'PUT' : 'POST';

      // For adding new battery, exclude id as it's auto-generated
      const dataToSend = editingBattery ? formData : { ...formData, id: undefined };

      const response = await fetch(`http://localhost:5000${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert(editingBattery ? 'Battery updated successfully!' : 'Battery added successfully!');
        setShowForm(false);
        setEditingBattery(null);
        setFormData({
          serialNumber: '',
          batteryName: '',
          batteryType: '',
          price: '',
          warrantyMonths: 12,
          status: 'In Stock',
          purchaseDate: '',
        });
        fetchBatteries();
      } else {
        // Parse error response and show in dialog
        response.json().then(errorData => {
          const errorMessage = errorData.error || 'An unknown error occurred';
          alert(`Error: ${errorMessage}`);
        }).catch(() => {
          alert(editingBattery ? 'Failed to update battery' : 'Failed to add battery');
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving battery');
    }
  };

  const handleEdit = (battery) => {
    setEditingBattery(battery);
    setFormData({
      serialNumber: battery.serialNumber || '',
      batteryName: battery.batteryName || '',
      batteryType: battery.batteryType || '',
      price: battery.price || '',
      warrantyMonths: battery.warrantyMonths || 12,
      status: battery.status || 'In Stock',
      purchaseDate: battery.purchaseDate || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (serialNumber) => {
    if (window.confirm('Are you sure you want to delete this battery?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/${serialNumber}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Battery deleted successfully!');
          fetchBatteries();
        } else {
          alert('Failed to delete battery');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting battery');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBattery(null);
    setFormData({
      serialNumber: '',
      batteryName: '',
      batteryType: '',
      price: '',
      warrantyMonths: 12,
      status: 'In Stock',
      purchaseDate: '',
    });
    setErrors({});
  };

  // Stats calculations based on sales data
  const totalAvailableBatteries = filteredBatteries.filter(b => b.status === 'In Stock').length;
  const yearlySales = sales.filter(s => {
    const date = new Date(s.saleDate);
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  }).length;
  const totalYearlySaleAmount = sales.filter(s => {
    const date = new Date(s.saleDate);
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  }).reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">🔋</span> Battery Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Available Batteries</div>
            <div className="metric-value">{totalAvailableBatteries}</div>
          </div>
          <div className="metric-icon blue">🔋</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Yearly Sales</div>
            <div className="metric-value">{yearlySales}</div>
          </div>
          <div className="metric-icon green">📈</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Yearly Sale Amount</div>
            <div className="metric-value">₹{totalYearlySaleAmount}</div>
          </div>
          <div className="metric-icon red">💰</div>
        </div>
      </section>

      <section className="customer-database">
        <div className="customer-database-header">
          <h2>Battery Database</h2>
          <p>Manage all batteries and their details</p>
          <div className="customer-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add New Battery
            </button>
            <button className="btn btn-success" onClick={() => navigate('/battery-sale')}>
              Sell Batteries
            </button>
          </div>
        </div>

        <div className="customer-filters">
          <input
            type="text"
            placeholder="Search by serial number, battery name, type..."
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
            <option>In Stock</option>
            <option>Sold</option>
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
              <th>Sl. No</th>
              <th>Serial Number</th>
              <th>Battery Name</th>
              <th>Battery Type</th>
              <th>Price</th>
              <th>Warranty Months</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatteries.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No batteries found.</td>
              </tr>
            ) : (
              filteredBatteries.map((battery, index) => (
                <tr key={battery.serialNumber || index}>
                  <td>{index + 1}</td>
                  <td>{battery.serialNumber || '-'}</td>
                  <td>{battery.batteryName || '-'}</td>
                  <td>{battery.batteryType || '-'}</td>
                  <td>₹{battery.price || '-'}</td>
                  <td>{battery.warrantyMonths || '-'}</td>
                  <td>
                    <span className={`status-badge ${battery.status?.toLowerCase().replace(' ', '-') || 'in-stock'}`}>
                      {battery.status || 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(battery)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(battery.serialNumber)}
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
              <h2>{editingBattery ? 'Edit Battery' : 'Add New Battery'}</h2>
            </div>

            <form className="enquiry-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Serial Number:</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="Enter serial number"
                  required
                />
                {errors.serialNumber && <span className="error">{errors.serialNumber}</span>}
              </div>

              <div className="form-row">
                <label>Battery Name:</label>
                <input
                  type="text"
                  name="batteryName"
                  value={formData.batteryName}
                  onChange={handleInputChange}
                  placeholder="Enter battery name"
                  required
                />
                {errors.batteryName && <span className="error">{errors.batteryName}</span>}
              </div>

              <div className="form-row">
                <label>Battery Type:</label>
                <select
                  name="batteryType"
                  value={formData.batteryType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select battery type</option>
                  <option value="Lithium">Lithium</option>
                  <option value="Lead Acid">Lead Acid</option>
                  <option value="Not Available">Not Available</option>
                </select>
                {errors.batteryType && <span className="error">{errors.batteryType}</span>}
              </div>



              <div className="form-row">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.price && <span className="error">{errors.price}</span>}
              </div>

              <div className="form-row">
                <label>Warranty Months:</label>
                <select
                  name="warrantyMonths"
                  value={formData.warrantyMonths}
                  onChange={handleInputChange}
                  required
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={36}>36</option>
                </select>
              </div>

              <div className="form-row">
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Sold">Sold</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="form-row">
                <label>Purchase Date:</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  required
                />
                {errors.purchaseDate && <span className="error">{errors.purchaseDate}</span>}
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingBattery ? 'Update Battery' : 'Add Battery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Battery;
