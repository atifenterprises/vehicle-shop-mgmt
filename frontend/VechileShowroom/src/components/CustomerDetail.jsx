import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../index.css';

const CustomerDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const customerFromState = location.state?.customer;

  const [customer, setCustomer] = useState({
    customerId: '',
    date: '',
    name: '',
    fatherName: '',
    mobileNo: '',
    ckycNo: '',
    address: '',
    vehicleNumber: '',
    engineNumber: '',
    make: '',
    model: '',
    year: '',
    chassisNumber: '',
    regnNumber: '',
    exShowroomPrice: '',
    saleType: '',
    loanNo: '',
    sanctionAmount: '',
    totalAmount: '',
    downPayment: '',
    tenure: '',
    saleDate: '',
    firstEmiDate: '',
    emiAmount: '',
    emiSchedule: [],
  });

  useEffect(() => {
    if (customerFromState) {
      setCustomer(customerFromState);
    }
  }, [customerFromState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    alert('Edit functionality not implemented yet.');
  };

  const handleDelete = () => {
    alert('Delete functionality not implemented yet.');
  };

  if (!customerFromState) {
    return (
      <div className="customer-container">
        <p>No customer data available.</p>
        <button className="btn btn-primary" onClick={() => navigate('/customers')}>
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
        <button className="btn btn-primary" onClick={() => navigate('/customers')}>
          ← Back to Customers
        </button>
      </header>

      <form className="customer-detail customer-detail-form">
        <label>
          Customer ID:
          <input type="text" name="customerId" value={customer.customerId} onChange={handleChange} />
        </label>
        <label>
          Date:
          <input type="date" name="date" value={customer.date} onChange={handleChange} />
        </label>
        <label>
          Name:
          <input type="text" name="name" value={customer.name} onChange={handleChange} />
        </label>
        <label>
          Father Name:
          <input type="text" name="fatherName" value={customer.fatherName} onChange={handleChange} />
        </label>
        <label>
          Mobile No:
          <input type="text" name="mobileNo" value={customer.mobileNo} onChange={handleChange} />
        </label>
        <label>
          CKYC No:
          <input type="text" name="ckycNo" value={customer.ckycNo} onChange={handleChange} />
        </label>
        <label>
          Address:
          <textarea name="address" value={customer.address} onChange={handleChange} />
        </label>
        <label>
          Vehicle Number:
          <input type="text" name="vehicleNumber" value={customer.vehicleNumber} onChange={handleChange} />
        </label>
        <label>
          Engine Number:
          <input type="text" name="engineNumber" value={customer.engineNumber} onChange={handleChange} />
        </label>
        <label>
          Make:
          <input type="text" name="make" value={customer.make} onChange={handleChange} />
        </label>
        <label>
          Model:
          <input type="text" name="model" value={customer.model} onChange={handleChange} />
        </label>
        <label>
          Year:
          <input type="number" name="year" value={customer.year} onChange={handleChange} />
        </label>
        <label>
          Chassis Number:
          <input type="text" name="chassisNumber" value={customer.chassisNumber} onChange={handleChange} />
        </label>
        <label>
          Regn Number:
          <input type="text" name="regnNumber" value={customer.regnNumber} onChange={handleChange} />
        </label>
        <label>
          Ex-showroom Price:
          <input type="number" name="exShowroomPrice" value={customer.exShowroomPrice} onChange={handleChange} />
        </label>
        <label>
          Sale Type:
          <input type="text" name="saleType" value={customer.saleType} onChange={handleChange} />
        </label>
        <label>
          Loan No:
          <input type="text" name="loanNo" value={customer.loanNo} onChange={handleChange} />
        </label>
        <label>
          Sanction Amount:
          <input type="number" name="sanctionAmount" value={customer.sanctionAmount} onChange={handleChange} />
        </label>
        <label>
          Total Amount:
          <input type="number" name="totalAmount" value={customer.totalAmount} onChange={handleChange} />
        </label>
        <label>
          Down Payment:
          <input type="number" name="downPayment" value={customer.downPayment} onChange={handleChange} />
        </label>
        <label>
          Tenure:
          <input type="number" name="tenure" value={customer.tenure} onChange={handleChange} />
        </label>
        <label>
          Sale Date:
          <input type="date" name="saleDate" value={customer.saleDate} onChange={handleChange} />
        </label>
        <label>
          First EMI Date:
          <input type="date" name="firstEmiDate" value={customer.firstEmiDate} onChange={handleChange} />
        </label>
        <label>
          EMI Amount:
          <input type="number" name="emiAmount" value={customer.emiAmount} readOnly />
        </label>
        <label>
          Status:
          <select name="loanStatus" value={customer.loanStatus} onChange={handleChange}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Overdue">Overdue</option>
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

export default CustomerDetail;
