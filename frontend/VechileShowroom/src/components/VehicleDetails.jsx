import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../index.css';

const VehicleDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const vehicleFromState = location.state?.vehicle;

  const [vehicle, setVehicle] = useState({
    id: '',
    purchaseDate: '',
    vehicleNumber: '',
    engineNumber: '',
    chassisNumber: '',
    makeYear: '',
    model: '',
    color: '',
    regnNumber: '',
    toolKit: '',
    batterySerialNumber: '',
    batteryType: '',
    vehicleChargerType: '',

    exShowroomPrice: '',
    saleDate: '',
    vehicleStatus: 'In Stock',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vehicle data from backend using ID
  const fetchVehicleData = async (vehicleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle data');
      }
      const data = await response.json();
      setVehicle(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If vehicle data is passed from state (from Vehicle.jsx), use it
    if (vehicleFromState) {
      setVehicle(vehicleFromState);
    }
    // Otherwise, fetch from backend using ID from URL
    else if (id) {
      fetchVehicleData(id);
    }
  }, [vehicleFromState, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    alert('Edit functionality not implemented yet.');
  };

  const handleDelete = () => {
    alert('Delete functionality not implemented yet.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🚙</span> Vehicle Details</h1>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            ← Back to Vehicles
          </button>
        </header>
        <div className="loading-container">
          <p>Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🚙</span> Vehicle Details</h1>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            ← Back to Vehicles
          </button>
        </header>
        <div className="error-container">
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!vehicle.id && !loading) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🚙</span> Vehicle Details</h1>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            ← Back to Vehicles
          </button>
        </header>
        <div className="no-data-container">
          <p>No vehicle data available.</p>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">🚙</span> Vehicle Details</h1>
        <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
          ← Back to Vehicles
        </button>
      </header>

      <form className="customer-detail customer-detail-form">
        <label>
          Vehicle ID:
          <input type="text" name="id" value={vehicle.id} onChange={handleChange} />
        </label>
        <label>
          Purchase Date:
          <input type="date" name="purchaseDate" value={vehicle.purchaseDate} onChange={handleChange} />
        </label>
        <label>
          Vehicle Number:
          <input type="text" name="vehicleNumber" value={vehicle.vehicleNumber} onChange={handleChange} />
        </label>
        <label>
          Engine Number:
          <input type="text" name="engineNumber" value={vehicle.engineNumber} onChange={handleChange} />
        </label>
        <label>
          Chassis Number:
          <input type="text" name="chassisNumber" value={vehicle.chassisNumber} onChange={handleChange} />
        </label>
        <label>
          Make Year:
          <input type="number" name="makeYear" value={vehicle.makeYear} onChange={handleChange} />
        </label>
        <label>
          Model:
          <input type="text" name="model" value={vehicle.model} onChange={handleChange} />
        </label>
        <label>
          Color:
          <input type="text" name="color" value={vehicle.color} onChange={handleChange} />
        </label>
        <label>
          Registration Number:
          <input type="text" name="regnNumber" value={vehicle.regnNumber} onChange={handleChange} />
        </label>
        <label>
          Tool Kit:
          <select name="toolKit" value={vehicle.toolKit} onChange={handleChange}>
            <option value="">Select tool kit status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </label>
        <label>
          Battery Serial Number:
          <input type="text" name="batterySerialNumber" value={vehicle.batterySerialNumber} onChange={handleChange} />
        </label>
        <label>
          Battery Type:
          <select name="batteryType" value={vehicle.batteryType} onChange={handleChange}>
            <option value="">Select battery type</option>
            <option value="Lithium">Lithium</option>
            <option value="Lead Acid">Lead Acid</option>
            <option value="Not Available">Not Available</option>
          </select>
        </label>
        <label>
          Vehicle Charger Name:
          <input type="text" name="vehicleChargerType" value={vehicle.vehicleChargerType} onChange={handleChange} />
        </label>

        <label>
          Ex-Showroom Price:
          <input type="number" name="exShowroomPrice" value={vehicle.exShowroomPrice} onChange={handleChange} />
        </label>
        <label>
          Sale Date:
          <input type="date" name="saleDate" value={vehicle.saleDate} onChange={handleChange} />
        </label>
        <label>
          Vehicle Status:
          <select name="vehicleStatus" value={vehicle.vehicleStatus} onChange={handleChange}>
            <option value="In Stock">In Stock</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
          </select>
        </label>
      </form>

      <div className="customer-detail-actions">
        <button className="btn btn-primary" onClick={handleEdit}>Edit</button>
        <button className="btn btn-delete" onClick={handleDelete}>Delete</button>
        <button className="btn btn-secondary" onClick={handlePrint}>Print Details</button>
      </div>
    </div>
  );
};

export default VehicleDetails;
