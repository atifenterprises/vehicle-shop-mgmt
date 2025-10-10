import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiStepForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Customer
    // customerId: '',
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
    chassisNumber: '',
    regnNumber: '',
    exShowroomPrice: '',
    // Sales - Cash fields
    saleDate: '',
    totalAmount: '',
    paidAmount: '',
    remainingAmount: '',
    lastPaymentDate: '',
    // Sales - Finance fields
    loanNumber: '',
    downPayment: '',
    loanAmount: '',
    tenure: '',
    interestRate: '',
    firstEmiDate: '',
    emiAmount: '',
    emiSchedule: []
  });

  const steps = ['Customer Details', 'Vehicle Details', 'Sales Details', 'Preview'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate EMI if relevant fields change (only for Finance)
    if (['totalAmount', 'downPayment', 'tenure', 'interestRate'].includes(name)) {
      const totalAmount = parseFloat(name === 'totalAmount' ? value : formData.totalAmount) || 0;
      const downPayment = parseFloat(name === 'downPayment' ? value : formData.downPayment) || 0;
      const tenure = parseInt(name === 'tenure' ? value : formData.tenure) || 0;
      const interestRate = parseFloat(name === 'interestRate' ? value : formData.interestRate) || 0;

      // Calculate loan amount (Total Amount - Down Payment)
      const loanAmount = totalAmount - downPayment;

      if (loanAmount > 0 && tenure > 0 && interestRate > 0) {
        const monthlyRate = interestRate / 12 / 100;
        const months = tenure;
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        setFormData(prev => ({
          ...prev,
          loanAmount: loanAmount.toString(),
          emiAmount: emi.toFixed(2)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          loanAmount: loanAmount.toString(),
          emiAmount: ''
        }));
      }
    }

    // Auto-calculate remaining amount for Cash sales
    if (['totalAmount', 'paidAmount'].includes(name)) {
      const totalAmount = parseFloat(name === 'totalAmount' ? value : formData.totalAmount) || 0;
      const paidAmount = parseFloat(name === 'paidAmount' ? value : formData.paidAmount) || 0;
      const remainingAmount = totalAmount - paidAmount;
      setFormData(prev => ({ ...prev, remainingAmount: remainingAmount.toString() }));
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

            // Validate required fields before submission
      const requiredCustomerFields = ['date', 'name', 'fatherName','mobileNo', 'ckycNo','address'];
      const requiredVehicleFields = ['vehicleNumber', 'engineNumber', 'make', 'model', 'chassisNumber', 'regnNumber', 'exShowroomPrice'];
      const requiredSaleFields = ['saleType', 'saleDate', 'totalAmount'];
      const requiredCashFields = ['paidAmount', 'remainingAmount', 'lastPaymentDate'];
      const requiredFinanceFields = ['loanNumber', 'downPayment', 'loanAmount', 'tenure', 'interestRate', 'firstEmiDate', 'emiAmount'];

      for(const field of requiredCustomerFields)
      {
        if(!formData[field] || formData[field].toString() ==='')
        {
          alert(`Please fill in the ${field} field in Customer Details`);
          return;
        }
      }
      
      for (const field of requiredVehicleFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
          alert(`Please fill in the ${field} field in Vehicle Details`);
          return;
        }
      }

      for (const field of requiredSaleFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
          alert(`Please fill in the ${field} field in Sales Details`);
          return;
        }
      }

      if (formData.saleType === 'Cash') {
        for (const field of requiredCashFields) {
          if (!formData[field] || formData[field].toString().trim() === '') {
            alert(`Please fill in the ${field} field for Cash sale`);
            return;
          }
        }
      } else if (formData.saleType === 'Finance') {
        for (const field of requiredFinanceFields) {
          if (!formData[field] || (field === 'emiSchedule' ? !Array.isArray(formData[field]) || formData[field].length === 0 : formData[field].toString().trim() === '')) {
            alert(`Please fill in the ${field} field for Finance sale`);
            return;
          }
        }
      } else {
        alert('Please select a valid sale type (Cash or Finance)');
        return;
      }

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const responseData = await response.json();

      if (response.ok) {
        alert('Sale added successfully!');
        navigate('/');
      } else {
        console.error('API Error:', responseData.error, responseData.details);
        alert(`Failed to add sale: ${responseData.error}${responseData.details ? ` - ${responseData.details}` : ''}`);
      }
    } catch (error) {
      console.error('Submission Error:', error.message);
      alert(`Error adding sale: ${error.message}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-step">
            <h3>Customer Details</h3>
            {/* <div className="form-row">
              <label>Customer ID:</label>
              <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} required />
            </div> */}
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
              <label>Make(Year):</label>
              <input type="text" name="make" value={formData.make} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Model:</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required />
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

            {/* Sale Type Radio Buttons */}
            <div className="form-row">
              <label className="form-label">Sale Type:</label>
              <div className="radio-group">
                <label htmlFor="saleTypeCash" className="radio-label">
                  <input
                    type="radio"
                    id="saleTypeCash"
                    name="saleType"
                    value="Cash"
                    checked={formData.saleType === 'Cash'}
                    onChange={handleChange}
                    required
                  />
                  Cash
                </label>
                <label htmlFor="saleTypeFinance" className="radio-label">
                  <input
                    type="radio"
                    id="saleTypeFinance"
                    name="saleType"
                    value="Finance"
                    checked={formData.saleType === 'Finance'}
                    onChange={handleChange}
                    required
                  />
                  Finance
                </label>
              </div>
            </div>

            {/* Cash Sale Fields */}
            {formData.saleType === 'Cash' && (
              <>
                <div className="form-row">
                  <label>Sale Date:</label>
                  <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Total Amount:</label>
                  <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Paid Amount:</label>
                  <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Remaining Amount:</label>
                  <input type="number" name="remainingAmount" value={formData.remainingAmount} readOnly />
                </div>
                <div className="form-row">
                  <label>Last Payment Date:</label>
                  <input type="date" name="lastPaymentDate" value={formData.lastPaymentDate} onChange={handleChange} required />
                </div>
              </>
            )}

            {/* Finance Sale Fields */}
            {formData.saleType === 'Finance' && (
              <>
                <div className="form-row">
                  <label>Loan Number:</label>
                  <input type="text" name="loanNumber" value={formData.loanNumber} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Total Amount:</label>
                  <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Down Payment:</label>
                  <input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Loan Amount:</label>
                  <input type="number" name="loanAmount" value={formData.loanAmount} readOnly />
                </div>
                <div className="form-row">
                  <label>Tenure (months):</label>
                  <input type="number" name="tenure" value={formData.tenure} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Interest Rate (%):</label>
                  <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Sale Date:</label>
                  <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>First EMI Date:</label>
                  <input type="date" name="firstEmiDate" value={formData.firstEmiDate} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>EMI Amount:</label>
                  <input type="number" name="emiAmount" value={formData.emiAmount} readOnly />
                </div>
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h3>Preview</h3>
            <div className="preview-section">
              <h4>Customer Details</h4>
              {/* <p><strong>Customer ID:</strong> {formData.customerId}</p> */}
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
              <p><strong>Chassis Number:</strong> {formData.chassisNumber}</p>
              <p><strong>Regn Number:</strong> {formData.regnNumber}</p>
              <p><strong>Ex-showroom Price:</strong> {formData.exShowroomPrice}</p>
            </div>
            <div className="preview-section">
              <h4>Sales Details</h4>
              <p><strong>Sale Type:</strong> {formData.saleType}</p>

              {/* Cash Sale Preview */}
              {formData.saleType === 'Cash' && (
                <>
                  <p><strong>Sale Date:</strong> {formData.saleDate}</p>
                  <p><strong>Total Amount:</strong> {formData.totalAmount}</p>
                  <p><strong>Paid Amount:</strong> {formData.paidAmount}</p>
                  <p><strong>Remaining Amount:</strong> {formData.remainingAmount}</p>
                  <p><strong>Last Payment Date:</strong> {formData.lastPaymentDate}</p>
                </>
              )}

              {/* Finance Sale Preview */}
              {formData.saleType === 'Finance' && (
                <>
                  <p><strong>Loan Number:</strong> {formData.loanNumber}</p>
                  <p><strong>Total Amount:</strong> {formData.totalAmount}</p>
                  <p><strong>Down Payment:</strong> {formData.downPayment}</p>
                  <p><strong>Loan Amount:</strong> {formData.loanAmount}</p>
                  <p><strong>Tenure:</strong> {formData.tenure}</p>
                  <p><strong>Interest Rate:</strong> {formData.interestRate}</p>
                  <p><strong>Sale Date:</strong> {formData.saleDate}</p>
                  <p><strong>First EMI Date:</strong> {formData.firstEmiDate}</p>
                  <p><strong>EMI Amount:</strong> {formData.emiAmount}</p>
                  <h5>EMI Schedule</h5>
                  <ul>
                    {formData.emiSchedule.map((emi, index) => (
                      <li key={index}>{emi.date}: {emi.amount}</li>
                    ))}
                  </ul>
                </>
              )}
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
          {currentStep < steps.length - 2 && <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>}
          {currentStep === steps.length - 2 && <button type="button" className="btn btn-primary" onClick={nextStep}>Preview</button>}
          {currentStep === steps.length - 1 && <button type="button" className="btn btn-success" onClick={handleSubmit}>Submit</button>}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
