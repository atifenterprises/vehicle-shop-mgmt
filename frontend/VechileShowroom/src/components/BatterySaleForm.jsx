import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BatterySaleForm = () => {
  const navigate = useNavigate();
  const [batteries, setBatteries] = useState([]);
  const [formData, setFormData] = useState({
    batteries: [],
    selectedBatterySerial: '',
    customerName: '',
    customerMobile: '',
    customerAddress: '',
    saleDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    paidAmount: '',
    remainingAmount: '',
    warrantyStartDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const fetchBatteries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/batteries');
      if (response.ok) {
        const data = await response.json();
        const inStockBatteries = data.filter(b => b.status === 'In Stock');
        setBatteries(inStockBatteries);
      }
    } catch (error) {
      console.error('Error fetching batteries:', error);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-calculate remaining amount
    if (['totalAmount', 'paidAmount'].includes(name)) {
      const total = parseFloat(formData.totalAmount) || 0;
      const paid = parseFloat(name === 'paidAmount' ? value : formData.paidAmount) || 0;
      const remaining = total - paid;
      setFormData(prev => ({ ...prev, remainingAmount: remaining.toString() }));
    }


  };

  const addBattery = () => {
    if (formData.selectedBatterySerial) {
      const battery = batteries.find(b => b.serialNumber === formData.selectedBatterySerial);
      if (battery && !formData.batteries.find(b => b.serialNumber === battery.serialNumber)) {
        setFormData(prev => ({
          ...prev,
          batteries: [...prev.batteries, battery],
          selectedBatterySerial: '',
          totalAmount: (parseFloat(prev.totalAmount || 0) + battery.price).toString()
        }));
      }
    }
  };

  const removeBattery = (id) => {
    setFormData(prev => {
      const battery = prev.batteries.find(b => b.id === id);
      const newBatteries = prev.batteries.filter(b => b.id !== id);
      const newTotal = parseFloat(prev.totalAmount) - battery.price;
      return {
        ...prev,
        batteries: newBatteries,
        totalAmount: newTotal.toString()
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.batteries.length === 0) newErrors.batteries = 'Please add at least one battery';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerMobile.trim()) newErrors.customerMobile = 'Mobile number is required';
    if (!formData.customerAddress.trim()) newErrors.customerAddress = 'Address is required';
    if (!formData.saleDate) newErrors.saleDate = 'Sale date is required';
    if (!formData.totalAmount || formData.totalAmount <= 0) newErrors.totalAmount = 'Total amount is required';
    if (!formData.paidAmount || formData.paidAmount < 0) newErrors.paidAmount = 'Paid amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data in the format expected by backend
      const saleData = {
        serialNumber: formData.batteries.map(b => b.serialNumber),
        batteries: formData.batteries,
        customerName: formData.customerName,
        customerMobile: formData.customerMobile,
        customerAddress: formData.customerAddress,
        saleDate: formData.saleDate,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        remainingAmount: parseFloat(formData.remainingAmount),
        warrantyStartDate: formData.warrantyStartDate
      };

      const response = await fetch('http://localhost:5000/api/battery-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        throw new Error('Failed to create sale');
      }

      const createdSale = await response.json();

      // Refresh batteries list after sale
      await fetchBatteries();

      alert('Batteries sold successfully! Invoice generated.');
      // Navigate to invoice
      navigate(`/battery-invoice/${createdSale.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating sale');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="form-header">
          <button className="cancel-btn" onClick={() => navigate('/batteries')}>×</button>
          <h2>Sell Battery</h2>
        </div>

        <form className="enquiry-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Battery Selection</h3>
          <div className="form-row">
            <label>Select Battery:</label>
            <select
              name="selectedBatterySerial"
              value={formData.selectedBatterySerial}
              onChange={handleChange}
            >
              <option value="">Select a battery to add</option>
              {batteries.map(battery => (
                <option key={battery.serialNumber} value={battery.serialNumber}>
                  {battery.serialNumber} - {battery.batteryType} - ₹{battery.price}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={addBattery} style={{marginLeft: '10px'}}>
              Add Battery
            </button>
          </div>
          {errors.batteries && <span className="error">{errors.batteries}</span>}

          {formData.batteries.length > 0 && (
            <div className="selected-batteries">
              <h4>Selected Batteries:</h4>
              <ul>
                {formData.batteries.map(battery => (
                  <li key={battery.serialNumber} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <div>
                      <strong>{battery.serialNumber}</strong> - {battery.batteryType} - ₹{battery.price}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeBattery(battery.id)}
                      style={{padding: '5px 10px'}}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Customer Details</h3>
          <div className="form-row">
            <label>Customer Name:</label>
            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
            {errors.customerName && <span className="error">{errors.customerName}</span>}
          </div>
          <div className="form-row">
            <label>Mobile Number:</label>
            <input type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleChange} required />
            {errors.customerMobile && <span className="error">{errors.customerMobile}</span>}
          </div>
          <div className="form-row">
            <label>Address:</label>
            <textarea name="customerAddress" value={formData.customerAddress} onChange={handleChange} required />
            {errors.customerAddress && <span className="error">{errors.customerAddress}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Sale Details</h3>
          <div className="form-row">
            <label>Sale Date:</label>
            <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required />
            {errors.saleDate && <span className="error">{errors.saleDate}</span>}
          </div>
          <div className="form-row">
            <label>Total Amount:</label>
            <input type="number" name="totalAmount" value={formData.totalAmount} readOnly />
            {errors.totalAmount && <span className="error">{errors.totalAmount}</span>}
          </div>
          <div className="form-row">
            <label>Paid Amount:</label>
            <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} min="0" required />
            {errors.paidAmount && <span className="error">{errors.paidAmount}</span>}
          </div>
          <div className="form-row">
            <label>Remaining Amount:</label>
            <input type="number" name="remainingAmount" value={formData.remainingAmount} readOnly />
          </div>

          <div className="form-row">
            <label>Warranty Start Date:</label>
            <input type="date" name="warrantyStartDate" value={formData.warrantyStartDate} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/batteries')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success">
            Complete Sale
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default BatterySaleForm;
