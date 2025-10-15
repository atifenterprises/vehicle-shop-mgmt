import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

const BatteryInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateWarrantyEndDate = (startDate, months) => {
    if (!startDate || !months) return 'N/A';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/battery-sales/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sale details');
        }
        const data = await response.json();
        setSale(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-container">
        <div className="loading">Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-container">
        <div className="error">Error: {error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/batteries')}>
          Back to Batteries
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="invoice-container">
        <div className="error">Sale not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/batteries')}>
          Back to Batteries
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <button className="btn btn-secondary" onClick={() => navigate('/batteries')}>
          ← Back to Batteries
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          Print Invoice
        </button>
      </div>

      <div className="invoice-content">
        <div className="invoice-title">
          <h1>Battery Sale Invoice</h1>
          <p>Invoice ID: #{sale.id}</p>
        </div>

        <div className="invoice-details">
          <div className="invoice-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {sale.customerName}</p>
            <p><strong>Mobile:</strong> {sale.customerMobile}</p>
            <p><strong>Address:</strong> {sale.customerAddress}</p>
          </div>

          <div className="invoice-section">
            <h3>Sale Details</h3>
            <p><strong>Sale Date:</strong> {new Date(sale.saleDate).toLocaleDateString()}</p>
            <p><strong>Invoice Date:</strong> {new Date(sale.createdAt).toLocaleDateString()}</p>
            <p><strong>Warranty Months:</strong> {sale.warrantyMonths || 'N/A'}</p>
            <p><strong>Warranty Start Date:</strong> {sale.warrantyStartDate ? new Date(sale.warrantyStartDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Warranty End Date:</strong> {calculateWarrantyEndDate(sale.warrantyStartDate, sale.warrantyMonths)}</p>
          </div>
        </div>

        <div className="invoice-table">
          <h3>Batteries Sold</h3>
          <table>
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Serial Number</th>
                <th>Battery Name</th>
                <th>Battery Type</th>
                <th>Warranty (Months)</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {sale.batteries.map((battery, index) => (
                <tr key={battery.id}>
                  <td>{index + 1}</td>
                  <td>{battery.serialNumber}</td>
                  <td>{battery.batteryName}</td>
                  <td>{battery.batteryType}</td>
                  <td>{battery.warrantyMonths}</td>
                  <td>₹{battery.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Total Amount:</span>
            <span>₹{sale.totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Paid Amount:</span>
            <span>₹{sale.paidAmount}</span>
          </div>
          <div className="summary-row">
            <span>Remaining Amount:</span>
            <span>₹{sale.remainingAmount}</span>
          </div>
        </div>

        {sale.notes && (
          <div className="invoice-notes">
            <h3>Notes</h3>
            <p>{sale.notes}</p>
          </div>
        )}

        <div className="invoice-footer">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default BatteryInvoice;
