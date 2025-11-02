import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddVehicleForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    purchaseDate: '',
    vehicleNumber: '',
    engineNumber: '',
    chassisNumber: '',
    make: '',
    model: '',
    color: '',
    regnNumber: '',
    toolKit: '',
    batterySerialNumber: '',
    batteryCount: '',
    batteryType: '',
    vehicleChargerName: '',
    exShowroomPrice: '',
    saleDate: '',
    vehicleStatus: 'In Stock',
  });



  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.engineNumber) newErrors.engineNumber = 'Engine number is required';
    if (!formData.chassisNumber) newErrors.chassisNumber = 'Chassis number is required';
    if (!formData.make) newErrors.make = 'Make year is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.color) newErrors.color = 'Color is required';
    if (!formData.regnNumber) newErrors.regnNumber = 'Registration number is required';
    if (!formData.exShowroomPrice) newErrors.exShowroomPrice = 'Ex-showroom price is required';
    // Numeric field validation
    if (formData.exShowroomPrice && isNaN(formData.exShowroomPrice)) {
      newErrors.exShowroomPrice = 'Ex-showroom price must be a number';
    }
    if (formData.make && (isNaN(formData.make) || formData.make < 1900 || formData.make > new Date().getFullYear())) {
      newErrors.make = 'Please enter a valid year';
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
      console.log('formData', { formData })
      const insertVehicle = {
        purchaseDate: formData.purchaseDate,
        vehicleNumber: formData.vehicleNumber,
        engineNumber: formData.engineNumber,
        chassisNumber: formData.chassisNumber,
        make: formData.make,
        model: formData.model,
        color: formData.color,
        regnNumber: formData.regnNumber,
        toolKit: formData.toolKit,
        batterySerialNumber: formData.batterySerialNumber,
        batteryCount: formData.batteryCount ? parseInt(formData.batteryCount, 10) : null,
        batteryType: formData.batteryType,
        vehicleChargerName: formData.vehicleChargerName,
        exShowroomPrice: formData.exShowroomPrice ? parseFloat(formData.exShowroomPrice) : null,
        saleDate: formData.saleDate || null,
        vehicleStatus: formData.vehicleStatus,
      };

      // Send the vehicle data to backend API for adding new vehicle      
      const response = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertVehicle)
      });
      if (!response.ok) {
        const errorData = await response.json(); // Get detailed error from backend
        console.log('errorData:', { errorData });
        throw new Error('Failed to insert vehicle');
      }
      if (response.ok) {
        alert('Vehicle added successfully!');
        navigate('/vehicles');
      } else {
        alert('Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding vehicle');
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  return (
    <div className="multi-step-form-container">
      <div className="form-header">
        <button className="cancel-btn" onClick={handleCancel}>×</button>
        <h2>Add New Vehicle</h2>
      </div>

      <form className="multi-step-form" onSubmit={handleSubmit}>
        <div className="form-step">
          <h3>Vehicle Information</h3>
          <div className="form-row">
            <label>Purchase Date:</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
            />
            {errors.purchaseDate && <span className="error">{errors.purchaseDate}</span>}
          </div>

          <div className="form-row">
            <label>Vehicle Number:</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="Enter vehicle number"
              required
            />
            {errors.vehicleNumber && <span className="error">{errors.vehicleNumber}</span>}
          </div>

          <div className="form-row">
            <label>Engine Number:</label>
            <input
              type="text"
              name="engineNumber"
              value={formData.engineNumber}
              onChange={handleChange}
              placeholder="Enter engine number"
              required
            />
            {errors.engineNumber && <span className="error">{errors.engineNumber}</span>}
          </div>

          <div className="form-row">
            <label>Chassis Number:</label>
            <input
              type="text"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              placeholder="Enter chassis number"
              required
            />
            {errors.chassisNumber && <span className="error">{errors.chassisNumber}</span>}
          </div>

          <div className="form-row">
            <label>Make Year:</label>
            <input
              type="number"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="Enter make year"
              min="1900"
              max={new Date().getFullYear()}
              required
            />
            {errors.make && <span className="error">{errors.make}</span>}
          </div>

          <div className="form-row">
            <label>Model:</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Enter vehicle model"
              required
            />
            {errors.model && <span className="error">{errors.model}</span>}
          </div>

          <div className="form-row">
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Enter vehicle color"
              required
            />
            {errors.color && <span className="error">{errors.color}</span>}
          </div>

          <div className="form-row">
            <label>Registration Number:</label>
            <input
              type="text"
              name="regnNumber"
              value={formData.regnNumber}
              onChange={handleChange}
              placeholder="Enter registration number"
              required
            />
            {errors.regnNumber && <span className="error">{errors.regnNumber}</span>}
          </div>

          <div className="form-row">
            <label>Tool Kit:</label>
            <select
              name="toolKit"
              value={formData.toolKit}
              onChange={handleChange}
            >
              <option value="">Select tool kit status</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div className="form-row">
            <label>Battery Serial Number:</label>
            <input
              type="text"
              name="batterySerialNumber"
              value={formData.batterySerialNumber}
              onChange={handleChange}
              placeholder="Enter battery serial number"
            />
          </div>

          <div className="form-row">
            <label>Battery Count:</label>
            <input
              type="number"
              name="batteryCount"
              value={formData.batteryCount}
              onChange={handleChange}
              placeholder="Enter battery count"
              min="0"
            />
          </div>

          <div className="form-row">
            <label>Battery Type:</label>
            <select
              name="batteryType"
              value={formData.batteryType}
              onChange={handleChange}
            >
              <option value="">Select battery type</option>
              <option value="Lithium">Lithium</option>
              <option value="Lead Acid">Lead Acid</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div className="form-row">
            <label>Vehicle Charger Name:</label>
            <input
              type="text"
              name="vehicleChargerName"
              value={formData.vehicleChargerName}
              onChange={handleChange}
              placeholder="Enter vehicle charger name"
            />
          </div>
          <div className="form-row">
            <label>Ex-Showroom Price:</label>
            <input
              type="number"
              name="exShowroomPrice"
              value={formData.exShowroomPrice}
              onChange={handleChange}
              placeholder="Enter ex-showroom price"
              step="0.01"
              min="0"
              required
            />
            {errors.exShowroomPrice && <span className="error">{errors.exShowroomPrice}</span>}
          </div>
          <div className="form-row">
            <label>Sale Date:</label>
            <input
              type="date"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Vehicle Status:</label>
            <select
              name="vehicleStatus"
              value={formData.vehicleStatus}
              onChange={handleChange}
            >
              <option value="In Stock">In Stock</option>
              <option value="Sold">Sold</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success">
            Add Vehicle
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicleForm;
