import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatus, setStockStatus] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const data = await response.json();
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(lowerSearch)) ||
        (v.engineNumber && v.engineNumber.toLowerCase().includes(lowerSearch)) ||
        (v.make && v.make.toLowerCase().includes(lowerSearch)) ||
        (v.model && v.model.toLowerCase().includes(lowerSearch)) ||
        (v.chassisNumber && v.chassisNumber.toLowerCase().includes(lowerSearch)) ||
        (v.batterySerialNumber && v.batterySerialNumber.toLowerCase().includes(lowerSearch)) ||
        (v.regnNumber && v.regnNumber.toLowerCase().includes(lowerSearch)) ||
        (v.color && v.color.toLowerCase().includes(lowerSearch)) ||
        (v.toolKit && v.toolKit.toLowerCase().includes(lowerSearch)) ||
        (v.batteryType && v.batteryType.toLowerCase().includes(lowerSearch)) ||
        (v.vehicleChargerName && v.vehicleChargerName.toLowerCase().includes(lowerSearch)) ||
        (v.purchaseDate && v.purchaseDate.toString().includes(lowerSearch)) ||
        (v.saleDate && v.saleDate.toString().includes(lowerSearch))
      );
    }

    if (stockStatus !== 'All') {
      if (stockStatus === 'In Stock') {
        filtered = filtered.filter(v => v.vehicleStatus === 'In Stock');
      } else if (stockStatus === 'Sold') {
        filtered = filtered.filter(v => v.vehicleStatus === 'Sold');
      }
      else if (stockStatus === 'Low Stock') {
        // For vehicles that are in stock but might be low (you can adjust this logic based on your business rules)
        filtered = filtered.filter(v => v.vehicleStatus === 'In Stock');
      }
    }

    // Filter by date range (consistent with Customer.jsx pattern)
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(v => {
        if (!v.purchaseDate) return false;
        return v.purchaseDate >= dateRange.from && v.purchaseDate <= dateRange.to;
      });
    }

    setFilteredVehicles(filtered);
  }, [searchTerm, stockStatus, dateRange, vehicles]);

  const clearFilters = () => {
    setSearchTerm('');
    setStockStatus('All');
    setDateRange({ from: '', to: '' });
  };

  // Stats calculations (calculated locally from vehicles data - consistent with Customer.jsx)
  const totalAvailableStocks = vehicles.length;

  // Calculate monthly sales from vehicle data (vehicles with saleDate in current month)
  const soldThisMonth = vehicles.filter(vehicle => {
    if (!vehicle.saleDate) return false;
    const saleDate = new Date(vehicle.saleDate);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear();
  }).length;

  const lowStockCount = vehicles.filter(v => v.vehicleStatus === 'In Stock').length;
  const outOfStockCount = vehicles.filter(v => v.vehicleStatus === 'Sold').length;

  const handleRowClick = (vehicle) => {
    console.log(vehicle);
    navigate(`/vehicles/${vehicle.vehicleNumber}`, { state: { vehicle } });
  };

  const generateReportHTML = (vehicles) => {
    const reportDate = new Date().toLocaleDateString();
    return `
      <html>
      <head>
        <title>Vehicle Management Report</title>
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
        <h1>Vehicle Management Report</h1>
        <div class="report-info">
          <p>Report Generated on: ${reportDate}</p>
          <p>Total Records: ${vehicles.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sl. Number</th>
              <th>Purchase Date</th>
              <th>Vehicle Number</th>
              <th>Model</th>
              <th>Color</th>
              <th>Chassis Number</th>
              <th>Ex-Showroom Price</th>
              <th>Status</th>
              <th>Sold Date</th>
            </tr>
          </thead>
          <tbody>
            ${vehicles.map((vehicle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : '-'}</td>
                <td>${vehicle.vehicleNumber || '-'}</td>
                <td>${vehicle.model || '-'}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${vehicle.chassisNumber || '-'}</td>
                <td>₹${vehicle.exShowroomPrice ? vehicle.exShowroomPrice.toLocaleString() : '0'}</td>
                <td>${vehicle.vehicleStatus || '-'}</td>
                <td>${vehicle.saleDate ? new Date(vehicle.saleDate).toLocaleDateString() : '-'}</td>
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
    const reportHTML = generateReportHTML(filteredVehicles);
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
          <h1><span className="customer-icon">🚙</span> Vehicle Management</h1>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Available Vehicle</div>
            <div className="metric-value">{totalAvailableStocks}</div>
          </div>
          <div className="metric-icon blue">🚙</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Monthly Sale</div>
            <div className="metric-value">{soldThisMonth}</div>
          </div>
          <div className="metric-icon green">💹</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Low Stocks</div>
            <div className="metric-value">{lowStockCount}</div>
          </div>
          <div className="metric-icon purple">⚠️</div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <div className="metric-label">Out of Stocks</div>
            <div className="metric-value">{outOfStockCount}</div>
          </div>
          <div className="metric-icon red">‼️</div>
        </div>
      </section>

      <section className="customer-database">
        <div className="customer-database-header">
          <h2>Manage Vehicles</h2>
          <p>Manage all vehicles and stocks information</p>
          <div className="customer-actions">
            <button className="btn btn-primary" onClick={() => navigate('/add-vehicle')}>+ Add New Vehicle</button>
            <button className="btn btn-success" onClick={handleGenerateReport}>📊 Generate Report</button>
          </div>
        </div>

        <div className="customer-filters">
          <input
            type="text"
            placeholder="Search by Vehicle No, Engine No, Make, Model, Chassis No..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-search"
          />
          <select
            value={stockStatus}
            onChange={e => setStockStatus(e.target.value)}
            className="select-status"
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
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

        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Sl. Number</th>
                <th>Purchase Date</th>
                <th>Vehicle Number</th>
                <th>Engine Number</th>
                <th>Make</th>
                <th>Model</th>
                <th>Color</th>
                <th>Chassis Number</th>
                <th>Regn Number</th>
                <th>Tool Kit</th>
                <th>Battery Serial</th>
                <th>Battery Count</th>
                <th>Battery Type</th>
                <th>Charger Type</th>
                <th>Ex-Showroom Price</th>
                <th>Status</th>
                <th>Sold Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: 'center', padding: '20px' }}>
                    No vehicles found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <tr key={vehicle.vehicleNumber} onClick={() => handleRowClick(vehicle)} className="clickable-row">
                    <td>{index + 1}</td>
                    <td>{vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : '-'}</td>
                    <td>{vehicle.vehicleNumber || '-'}</td>
                    <td>{vehicle.engineNumber || '-'}</td>
                    <td>{vehicle.make || '-'}</td>
                    <td>{vehicle.model || '-'}</td>
                    <td>{vehicle.color || '-'}</td>
                    <td>{vehicle.chassisNumber || '-'}</td>
                    <td>{vehicle.regnNumber || '-'}</td>
                    <td>{vehicle.toolKit || '-'}</td>
                    <td>{vehicle.batterySerialNumber || '-'}</td>
                    <td>{vehicle.batteryCount || '-'}</td>
                    <td>{vehicle.batteryType || '-'}</td>
                    <td>{vehicle.vehicleChargerName || '-'}</td>
                    <td>₹{vehicle.exShowroomPrice ? parseFloat(vehicle.exShowroomPrice).toLocaleString() : '0'}</td>
                    <td>{vehicle.vehicleStatus || '-'}</td>
                    <td>{vehicle.saleDate ? new Date(vehicle.saleDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Vehicle;
