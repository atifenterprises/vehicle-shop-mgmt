import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiStepForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Customer
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    name: '',
    fatherName: '',
    mobileNo: '',
    ckycNo: '',
    address: '',
    // Vehicle
    vehicleNumber: '',
    engineNumber: '',
    make: '',
    model: '',
    year: '',
    chassisNumber: '',
    regnNumber: '',
    exShowroomPrice: '',
    // Sales
    saleType: 'Cash',
    loanNo: '',
    sanctionAmount: '',
    totalAmount: '',
    downPayment: '',
    tenure: '',
    saleDate: '',
    firstEmiDate: '',
    emiAmount: '',
    emiSchedule: []
  });

  const steps = ['Customer Details', 'Vehicle Details', 'Sales Details', 'Preview'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate EMI if relevant fields change
    if (['totalAmount', 'downPayment', 'tenure'].includes(name)) {
      const total = parseFloat(formData.totalAmount || 0);
      const down = parseFloat(formData.downPayment || 0);
      const tenure = parseInt(formData.tenure || 0);
      if (total > down && tenure > 0) {
        const emi = ((total - down) / tenure).toFixed(2);
        setFormData(prev => ({ ...prev, emiAmount: emi }));
      }
    }
  };

  const generateEmiSchedule = () => {
    const schedule = [];
    const emi = parseFloat(formData.emiAmount);
    const tenure = parseInt(formData.tenure);
    let date = new Date(formData.firstEmiDate);
    for (let i = 0; i < tenure; i++) {
      schedule.push({
        date: date.toISOString().split('T')[0],
        amount: emi
      });
      date.setMonth(date.getMonth() + 1);
    }
    return schedule;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 2) {
        // Generate EMI schedule before preview
        const schedule = generateEmiSchedule();
        setFormData(prev => ({ ...prev, emiSchedule: schedule }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Sale added successfully!');
        navigate('/');
      } else {
        alert('Failed to add sale');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding sale');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-step">
            <h3>Customer Details</h3>
            <div className="form-row">
              <label>Customer ID:</label>
              <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Date:</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Father Name:</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Mobile No:</label>
              <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Ckyc NO:</label>
              <input type="text" name="ckycNo" value={formData.ckycNo} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Address:</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="form-step">
            <h3>Vehicle Details</h3>
            <div className="form-row">
              <label>Vehicle Number:</label>
              <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Engine Number:</label>
              <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Make:</label>
              <input type="text" name="make" value={formData.make} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Model:</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Year:</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Chassis Number:</label>
              <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Regn Number:</label>
              <input type="text" name="regnNumber" value={formData.regnNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Ex-showroom Price:</label>
              <input type="number" name="exShowroomPrice" value={formData.exShowroomPrice} onChange={handleChange} required />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h3>Sales Details</h3>
            <div className="form-row">
              <label>Sale Type:</label>
              <select name="saleType" value={formData.saleType} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="form-row">
              <label>Loan No:</label>
              <input type="text" name="loanNo" value={formData.loanNo} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Sanction Amount:</label>
              <input type="number" name="sanctionAmount" value={formData.sanctionAmount} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Total Amount:</label>
              <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Down Payment:</label>
              <input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Tenure (months):</label>
              <input type="number" name="tenure" value={formData.tenure} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Sale Date:</label>
              <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>First EMI Date:</label>
              <input type="date" name="firstEmiDate" value={formData.firstEmiDate} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>EMI Amount:</label>
              <input type="number" name="emiAmount" value={formData.emiAmount} readOnly />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h3>Preview</h3>
            <div className="preview-section">
              <h4>Customer Details</h4>
              <p><strong>Customer ID:</strong> {formData.customerId}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Father Name:</strong> {formData.fatherName}</p>
              <p><strong>Mobile No:</strong> {formData.mobileNo}</p>
              <p><strong>Ckyc NO:</strong> {formData.ckycNo}</p>
              <p><strong>Address:</strong> {formData.address}</p>
            </div>
            <div className="preview-section">
              <h4>Vehicle Details</h4>
              <p><strong>Vehicle Number:</strong> {formData.vehicleNumber}</p>
              <p><strong>Engine Number:</strong> {formData.engineNumber}</p>
              <p><strong>Make:</strong> {formData.make}</p>
              <p><strong>Model:</strong> {formData.model}</p>
              <p><strong>Year:</strong> {formData.year}</p>
              <p><strong>Chassis Number:</strong> {formData.chassisNumber}</p>
              <p><strong>Regn Number:</strong> {formData.regnNumber}</p>
              <p><strong>Ex-showroom Price:</strong> {formData.exShowroomPrice}</p>
            </div>
            <div className="preview-section">
              <h4>Sales Details</h4>
              <p><strong>Sale Type:</strong> {formData.saleType}</p>
              <p><strong>Loan No:</strong> {formData.loanNo}</p>
              <p><strong>Sanction Amount:</strong> {formData.sanctionAmount}</p>
              <p><strong>Total Amount:</strong> {formData.totalAmount}</p>
              <p><strong>Down Payment:</strong> {formData.downPayment}</p>
              <p><strong>Tenure:</strong> {formData.tenure}</p>
              <p><strong>Sale Date:</strong> {formData.saleDate}</p>
              <p><strong>First EMI Date:</strong> {formData.firstEmiDate}</p>
              <p><strong>EMI Amount:</strong> {formData.emiAmount}</p>
              <h5>EMI Schedule</h5>
              <ul>
                {formData.emiSchedule.map((emi, index) => (
                  <li key={index}>{emi.date}: {emi.amount}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="multi-step-form-container">
      <div className="form-header">
        <button className="cancel-btn" onClick={() => navigate('/customers')}>×</button>
        <h2>Add New Sale</h2>
      </div>
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
      <form className="multi-step-form">
        {renderStepContent()}
        <div className="form-actions">
          {currentStep > 0 && <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>}
          {currentStep < steps.length - 1 && <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>}
          {currentStep === steps.length - 2 && <button type="button" className="btn btn-primary" onClick={nextStep}>Preview</button>}
          {currentStep === steps.length - 1 && <button type="button" className="btn btn-success" onClick={handleSubmit}>Submit</button>}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
