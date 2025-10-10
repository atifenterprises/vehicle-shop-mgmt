import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddVehicleForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_id: '',
    purchaseDate: '',
    vehicle_number: '',
    engineNumber: '',
    chasis_number: '',
    make: '',
    model: '',
    color: '',
    regnNumber: '',
    tool_kit: '',
    battery_number: '',
    ex_showroom: '',
    sold_date: '',
    status: 'Available',
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
    //if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.vehicle_number) newErrors.vehicle_number = 'Vehicle number is required';
    //if (!formData.engineNumber) newErrors.engineNumber = 'Engine number is required';
    if (!formData.chasis_number) newErrors.chasis_number = 'Chassis number is required';
    if (!formData.year) newErrors.year = 'Make year is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.color) newErrors.color = 'Color is required';
    //if (!formData.regnNumber) newErrors.regnNumber = 'Registration number is required';
    if (!formData.ex_showroom) newErrors.ex_showroom = 'Ex-showroom price is required';

    // Numeric field validation
    if (formData.ex_showroom && isNaN(formData.ex_showroom)) {
      newErrors.ex_showroom = 'Ex-showroom price must be a number';
    }

    if (formData.year && (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear())) {
      newErrors.year = 'Please enter a valid year';
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
      // Send the vehicle data to backend API for adding new vehicle
      const response = await fetch('http://localhost:5000/api/insertVehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

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
              name="vehicle_number"
              value={formData.vehicle_number}
              onChange={handleChange}
              placeholder="Enter vehicle number"
              required
            />
            {errors.vehicle_number && <span className="error">{errors.vehicle_number}</span>}
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
              name="chasis_number"
              value={formData.chasis_number}
              onChange={handleChange}
              placeholder="Enter chassis number"
              required
            />
            {errors.chasis_number && <span className="error">{errors.chasis_number}</span>}
          </div>

          <div className="form-row">
            <label>Make Year:</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Enter make year"
              min="1900"
              max={new Date().getFullYear()}
              required
            />
            {errors.makeYear && <span className="error">{errors.year}</span>}
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
              name="tool_kit"
              value={formData.tool_kit}
              onChange={handleChange}
            >
              <option value="">Select tool kit status</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div className="form-row">
            <label>Battery Number:</label>
            <input
              type="text"
              name="battery_number"
              value={formData.battery_number}
              onChange={handleChange}
              placeholder="Enter battery number"
            />
          </div>

          <div className="form-row">
            <label>Ex-Showroom Price:</label>
            <input
              type="number"
              name="ex_showroom"
              value={formData.ex_showroom}
              onChange={handleChange}
              placeholder="Enter ex-showroom price"
              step="0.01"
              min="0"
              required
            />
            {errors.ex_showroom && <span className="error">{errors.ex_showroom}</span>}
          </div>

          <div className="form-row">
            <label>Sale Date:</label>
            <input
              type="date"
              name="sold_date"
              value={formData.sold_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Vehicle Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Reserved">Reserved</option>
              <option value="In-Transit">In-Transit</option>
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
