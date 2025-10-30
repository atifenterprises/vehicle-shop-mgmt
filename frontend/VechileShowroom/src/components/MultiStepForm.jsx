import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiStepForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleSerial, setSelectedVehicleSerial] = useState('');
  const [formData, setFormData] = useState({
    // Customer
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    name: '',
    fatherName: '',
    mobileNo: '',
    ckycNo: '',
    address: '',
    customerStatus: 'Active',
    // Vehicle
    vehicleNumber: '',
    engineNumber: '',
    make: '',
    model: '',
    chassisNumber: '',
    batterySerialNumber: '',
    batteryCount: 0,
    regnNumber: '',
    exShowroomPrice: '',
    color: '',
    toolKit: '',
    batteryType: '',
    vehicleChargerName: '',
    purchaseDate: '',
    saleDate: '',
    vehicleStatus: '',
    // Sales
    saleType: '',
    salesStatus: '',
    // Sales - Cash fields
    shopNumber: '',
    totalAmount: '',
    paidAmount: '',
    remainingAmount: '',
    lastpaymentDate: '',
    // Sales - Finance fields
    loanNumber: '',
    downPayment: '',
    loanAmount: '',
    tenure: '',
    interestRate: '',
    firstEMIDate: '',
    EMIAmount: '',
    emiSchedule: []
  });

  const steps = ['Customer Details', 'Vehicle Details', 'Sales Details', 'Preview'];

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      if (response.ok) {
        const allVehicles = await response.json();
        const inStockVehicles = allVehicles.filter(vehicle => vehicle.vehicleStatus === 'In Stock');
        setVehicles(inStockVehicles);
      } else {
        console.error('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleSelection = (e) => {
    setSelectedVehicleSerial(e.target.value);
  };

  const selectVehicle = () => {
    const selectedVehicle = vehicles.find(vehicle => vehicle.vehicleNumber === selectedVehicleSerial);
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: selectedVehicle.vehicleNumber,
        engineNumber: selectedVehicle.engineNumber,
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        chassisNumber: selectedVehicle.chassisNumber,
        batterySerialNumber: selectedVehicle.batterySerialNumber,
        batteryCount: selectedVehicle.batteryCount,
        regnNumber: selectedVehicle.regnNumber,
        exShowroomPrice: selectedVehicle.exShowroomPrice,
        color: selectedVehicle.color || '',
        toolKit: selectedVehicle.toolKit || '',
        batteryType: selectedVehicle.batteryType || '',
        vehicleChargerName: selectedVehicle.vehicleChargerName || '',
        purchaseDate: selectedVehicle.purchaseDate || '',
        saleDate: selectedVehicle.saleDate || '',
        vehicleStatus: selectedVehicle.vehicleStatus || ''
      }));
      setSelectedVehicleSerial('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Set default salesStatus based on saleType
    if (name === 'saleType') {
      const defaultStatus = value === 'Cash' ? 'Active' : 'Active';
      setFormData(prev => ({ ...prev, salesStatus: defaultStatus }));
    }

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
          EMIAmount: emi.toFixed(2)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          loanAmount: loanAmount.toString(),
          EMIAmount: ''
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
    const emi = parseFloat(formData.EMIAmount);
    const tenure = parseInt(formData.tenure);
    const loanAmount = parseFloat(formData.loanAmount);
    const monthlyRate = parseFloat(formData.interestRate) / 12 / 100;
    let balance = loanAmount;
    let date = new Date(formData.firstEMIDate);

    for (let i = 0; i < tenure; i++) {
      const interest = balance * monthlyRate;
      const principal = emi - interest;
      balance -= principal;

      schedule.push({
        date: date.toISOString().split('T')[0],
        amount: emi,
        status: 'Due',
        emiNo: i + 1,
        principal: Math.round(principal),
        interest: Math.round(interest),
        balance: Math.round(balance),
        bucket: 0,
        overdueCharges: 0,
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
            <div className="form-row">
              <label>Customer Status:</label>
              <select name="customerStatus" value={formData.customerStatus} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="form-step">
            <h3>Vehicle Details</h3>
            <div className="form-section">
              <h4>Vehicle Selection</h4>
              <div className="form-row">
                <label>Select Vehicle:</label>
                <select name="selectedVehicleSerial" value={selectedVehicleSerial} onChange={handleVehicleSelection}>
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                      {vehicle.vehicleNumber} - {vehicle.model} - ₹{vehicle.exShowroomPrice}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <button type="button" className='btn' onClick={selectVehicle}>Select Vehicle</button>
              </div>
            </div>
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
              <label>Battery Serial Number:</label>
              <input type="text" name="batterySerialNumber" value={formData.batterySerialNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Battery Count:</label>
              <input type="number" name="batteryCount" value={formData.batteryCount} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Regn Number:</label>
              <input type="text" name="regnNumber" value={formData.regnNumber} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Ex-showroom Price:</label>
              <input type="number" name="exShowroomPrice" value={formData.exShowroomPrice} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Color:</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Tool Kit:</label>
              <input type="text" name="toolKit" value={formData.toolKit} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Battery Type:</label>
              <input type="text" name="batteryType" value={formData.batteryType} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Vehicle Charger Name:</label>
              <input type="text" name="vehicleChargerName" value={formData.vehicleChargerName} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Purchase Date:</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Sale Date:</label>
              <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Vehicle Status:</label>
              <input type="text" name="vehicleStatus" value={formData.vehicleStatus} onChange={handleChange} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h3>Sales Details</h3>

            {/* Sale Type Radio Buttons */}
            <div className="form-row">
              <label>Sale Type:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="saleType"
                    value="Cash"
                    checked={formData.saleType === 'Cash'}
                    onChange={handleChange}
                  />
                  Cash
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="saleType"
                    value="Finance"
                    checked={formData.saleType === 'Finance'}
                    onChange={handleChange}
                  />
                  Finance
                </label>
              </div>
            </div>

            {/* Sales Status */}
            <div className="form-row">
              <label>Sales Status:</label>
              <select name="salesStatus" value={formData.salesStatus} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                {formData.saleType === 'Finance' && <option value="Overdue">Overdue</option>}
              </select>
            </div>

            {/* Cash Sale Fields */}
            {formData.saleType === 'Cash' && (
              <>
                <div className="form-row">
                  <label>Shop Number:</label>
                  <select name="shopNumber" value={formData.shopNumber} onChange={handleChange} required>
                    <option value="">Select Shop Number</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
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
                  <input type="date" name="lastpaymentDate" value={formData.lastpaymentDate} onChange={handleChange} required />
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
                  <input type="date" name="firstEMIDate" value={formData.firstEMIDate} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>EMI Amount:</label>
                  <input type="number" name="EMIAmount" value={formData.EMIAmount} readOnly />
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
              <p><strong>Chassis Number:</strong> {formData.chassisNumber}</p>
              <p><strong>Battery Serial Number:</strong> {formData.batterySerialNumber}</p>
              <p><strong>Battery Count:</strong> {formData.batteryCount}</p>
              <p><strong>Regn Number:</strong> {formData.regnNumber}</p>
              <p><strong>Ex-showroom Price:</strong> {formData.exShowroomPrice}</p>
              <p><strong>Color:</strong> {formData.color}</p>
              <p><strong>Tool Kit:</strong> {formData.toolKit}</p>
              <p><strong>Battery Type:</strong> {formData.batteryType}</p>
              <p><strong>Vehicle Charger Name:</strong> {formData.vehicleChargerName}</p>
              <p><strong>Purchase Date:</strong> {formData.purchaseDate}</p>
              <p><strong>Sale Date:</strong> {formData.saleDate}</p>
              <p><strong>Vehicle Status:</strong> {formData.vehicleStatus}</p>
            </div>
            <div className="preview-section">
              <h4>Sales Details</h4>
              <p><strong>Sale Type:</strong> {formData.saleType}</p>
              <p><strong>Sales Status:</strong> {formData.salesStatus}</p>
              
              {/* Cash Sale Preview */}
              {formData.saleType === 'Cash' && (
                <>
                  <p><strong>Shop Number:</strong> {formData.shopNumber}</p>
                  <p><strong>Sale Date:</strong> {formData.saleDate}</p>
                  <p><strong>Total Amount:</strong> {formData.totalAmount}</p>
                  <p><strong>Paid Amount:</strong> {formData.paidAmount}</p>
                  <p><strong>Remaining Amount:</strong> {formData.remainingAmount}</p>
                  <p><strong>Last Payment Date:</strong> {formData.lastpaymentDate}</p>
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
                  <p><strong>First EMI Date:</strong> {formData.firstEMIDate}</p>
                  <p><strong>EMI Amount:</strong> {formData.EMIAmount}</p>
                  <h5>EMI Schedule</h5>
                  {/* <ul>
                    {formData.emiSchedule.map((emi, index) => (
                      <li key={index}>
                        <table className="emi-table">
                          <tr className="emi-row">
                            <td className="emi-cell"><strong>EMI Date :</strong> {emi.date} </td>
                            <td className="emi-cell"><strong>EMI Amount :</strong> ₹{emi.amount}</td>
                            <td className="emi-cell"><strong>Payment Status :</strong><span style={{ color: "orange" }}>{emi.status}</span></td>
                          </tr>
                        </table>
                      </li>
                    ))}
                  </ul> */}
                  <table className="emi-table">
                    <thead>
                      <tr className="emi-header-row">
                        <th className="emi-header-cell">EMI #</th>
                        <th className="emi-header-cell">EMI Date</th>
                        <th className="emi-header-cell">EMI Amount(₹)</th>
                        <th className="emi-header-cell">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.emiSchedule.map((emi, index) => (
                        <tr key={index} className="emi-row">
                          <td className="emi-cell">
                            {emi.emiNo}
                          </td>
                          <td className="emi-cell">
                            {emi.date}
                          </td>
                          <td className="emi-cell">
                            ₹{emi.amount}
                          </td>
                          <td className="emi-cell">
                            <strong style={{ color: "orange" }}>{emi.status}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
