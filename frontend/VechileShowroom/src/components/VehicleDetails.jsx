import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../index.css';

const VehicleDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const vehicleFromState = location.state?.vehicle;

  const [vehicle, setVehicle] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch vehicle data from backend using ID
  const fetchVehicleData = async (vehicleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/getVehicle/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle data');
      }
      const data = await response.json();
      setVehicle(data);

      setVehicle({
        vehicle_id: data.vehicle_id || '',
        vehicle_number: data.vehicle_number || '',
        chasis_number: data.chasis_number || '',
        make: data.year || '',
        model: data.model || '',
        color: data.color != null ? data.color.toString() : '',
        tool_kit: data.tool_kit || '',
        battery_number: data.battery_number || '',
        ex_showroom: data.ex_showroom != null ? data.ex_showroom.toString() : '', // Convert number to string
        sold_date: data.sold_date || '',
        status: data.status || 'Available',
      });


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

  const handleEdit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedVehicle = {
        vehicle_id: vehicle.vehicle_id,
        vehicle_number: vehicle.vehicle_number || '',
        chasis_number: vehicle.chasis_number || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        tool_kit: vehicle.tool_kit || '',
        battery_number: vehicle.battery_number || '',
        ex_showroom: vehicle.ex_showroom ? parseFloat(vehicle.ex_showroom) : null,
        sold_date: vehicle.sold_date || null,
        status: vehicle.status || 'Available',
      };

      const response = await fetch(`http://localhost:5000/api/updateVehicle/${vehicle.vehicle_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVehicle),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Get detailed error from backend
        console.log('errorData:', { errorData });
        throw new Error('Failed to update vehicle');
      }
      const data = await response.json();
      setSuccessMessage('Vehicle updated successfully!');
      navigate('/vehicles');

    } catch (error) {
      setError(error.message);
      console.error('Error updating vehicle:', error);
    } finally {
      setLoading(false);
    }

  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { vehicle_id } = vehicle.vehicle_id;
      const response = await fetch(`http://localhost:5000/api/deleteVehicles/${vehicle.vehicle_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },

      });
      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }
      setSuccessMessage('Vehicle deleted successfully!');
      navigate('/vehicles');
    } catch (error) {
      setError(error.message);
      console.error('Error deleting vehicle:', error);
    }finally{
      setLoading(false);
    }
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
  if (!vehicle.vehicle_id && !loading) {
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
          <input type="text" name="id" value={vehicle.vehicle_id} onChange={handleChange} />
        </label>
        <label>
          Purchase Date:
          <input type="date" name="purchaseDate" value={vehicle.purchaseDate} onChange={handleChange} />
        </label>
        <label>
          Vehicle Number:
          <input type="text" name="vehicleNumber" value={vehicle.vehicle_number} onChange={handleChange} />
        </label>
        <label>
          Engine Number:
          <input type="text" name="engineNumber" value={vehicle.engineNumber} onChange={handleChange} />
        </label>
        <label>
          Chassis Number:
          <input type="text" name="chassisNumber" value={vehicle.chasis_number} onChange={handleChange} />
        </label>
        <label>
          Make Year:
          <input type="number" name="year" value={vehicle.year} onChange={handleChange} />
        </label>
        <label>
          Model:
          <input type="text" name="model" value={vehicle.model} onChange={handleChange} />
        </label>
        <label>
          Color:
          <input type="text" name="color" value={vehicle.color ?? ''} onChange={handleChange} />
        </label>
        <label>
          Registration Number:
          <input type="text" name="regnNumber" value={vehicle.regnNumber} onChange={handleChange} />
        </label>
        <label>
          Tool Kit:
          <select name="tool_kit" value={vehicle.tool_kit ?? ''} onChange={handleChange}>
            <option value="">Select tool kit status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </label>
        <label>
          Battery Number:
          <input type="text" name="battery_number" value={vehicle.battery_number ?? ''} onChange={handleChange} />
        </label>
        <label>
          Ex-Showroom Price:
          <input type="number" name="ex_showroom" value={vehicle.ex_showroom} onChange={handleChange} />
        </label>
        <label>
          Sale Date:
          <input type="date" name="sold_date" value={vehicle.sold_date ?? ''} onChange={handleChange} />
        </label>
        <label>
          Vehicle Status:
          <select name="status" value={vehicle.status} onChange={handleChange}>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="In-Transit">In-Transit</option>
          </select>
        </label>
      </form>

      <div className="customer-detail-actions">
        <button className="btn btn-primary" onClick={handleEdit}>Edit</button>
        <button className="btn btn-delete" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default VehicleDetails;
