import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../index.css';

const CustomerDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
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
    chassisNumber: '',
    regnNumber: '',
    exShowroomPrice: '',
    saleType: '',
    loanNumber: '',
    sanctionAmount: '',
    totalAmount: '',
    paidAmount: '',
    downPayment: '',
    tenure: '',
    saleDate: '',
    firstEmiDate: '',
    emiAmount: '',
    emiSchedule: [],
    loanStatus: '',
    nextEmiDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customer data from backend using ID
  const fetchCustomerData = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If customer data is passed from state (from Customer.jsx), use it
    if (customerFromState) {
      setCustomer(customerFromState);
    }
    // Otherwise, fetch from backend using ID from URL
    else if (id) {
      fetchCustomerData(id);
    }
  }, [customerFromState, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to determine which fields to show based on sale type
  const getFieldsToShow = (saleType) => {
    const type = saleType?.toLowerCase();
    if (type === 'finance') {
      return {
        showFinanceFields: true,
        showCashFields: false,
        backButtonText: 'Back to Customers',
        backButtonRoute: '/customers'
      };
    } else if (type === 'cash') {
      return {
        showFinanceFields: false,
        showCashFields: true,
        backButtonText: 'Back to Cashflow',
        backButtonRoute: '/cashflows'
      };
    } else {
      return {
        showFinanceFields: true,
        showCashFields: true,
        backButtonText: 'Back to Customers',
        backButtonRoute: '/customers'
      };
    }
  };

  const fieldConfig = getFieldsToShow(customer.saleType);

  // Show loading state
  if (loading) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
          <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
            ← {fieldConfig.backButtonText}
          </button>
        </header>
        <div className="loading-container">
          <p>Loading customer data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
          <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
            ← {fieldConfig.backButtonText}
          </button>
        </header>
        <div className="error-container">
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
            {fieldConfig.backButtonText}
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!customer.customerId && !loading) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
          <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
            ← {fieldConfig.backButtonText}
          </button>
        </header>
        <div className="no-data-container">
          <p>No customer data available.</p>
          <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
            {fieldConfig.backButtonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
        <button className="btn btn-primary" onClick={() => navigate(fieldConfig.backButtonRoute)}>
          ← {fieldConfig.backButtonText}
        </button>
      </header>

      <form className="customer-detail customer-detail-form">
        {/* Customer Details */}
        <h3>Customer Details</h3>
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

        {/* Vehicle Details */}
        <h3>Vehicle Details</h3>
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

        {/* Sales Details */}
        <h3>Sales Details</h3>
        <label>
          Sale Type:
          <input type="text" name="saleType" value={customer.saleType} onChange={handleChange} />
        </label>

        {/* Finance Sale Fields */}
        {fieldConfig.showFinanceFields && (
          <>
            <label>
              Loan Number:
              <input type="text" name="loanNumber" value={customer.loanNumber} onChange={handleChange} />
            </label>
            <label>
              Sanction Amount:
              <input type="number" name="sanctionAmount" value={customer.sanctionAmount} onChange={handleChange} />
            </label>
            <label>
              Down Payment:
              <input type="number" name="downPayment" value={customer.downPayment} onChange={handleChange} />
            </label>
            <label>
              Loan Amount:
              <input type="number" name="loanAmount" value={customer.loanAmount} onChange={handleChange} />
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
              Loan Status:
              <select name="loanStatus" value={customer.loanStatus} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </label>
          </>
        )}

        {/* Cash Sale Fields */}
        {fieldConfig.showCashFields && (
          <>
            <label>
              Total Amount:
              <input type="number" name="totalAmount" value={customer.totalAmount} onChange={handleChange} />
            </label>
            <label>
              Paid Amount:
              <input type="number" name="paidAmount" value={customer.paidAmount} onChange={handleChange} />
            </label>
            <label>
              Remaining Amount:
              <input type="number" value={customer.totalAmount - customer.paidAmount} readOnly />
            </label>
            <label>
              Sale Date:
              <input type="date" name="saleDate" value={customer.saleDate} onChange={handleChange} />
            </label>
            <label>
              Payment Status:
              <select name="loanStatus" value={customer.loanStatus} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </label>
          </>
        )}
      </form>

      <div className="customer-detail-actions">
        <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
        <button className="btn btn-delete" onClick={handleDelete}>Delete</button>
        <button className="btn btn-primary" onClick={handlePrint}>Print🖨️</button>
      </div>
    </div>
  );

  // Handler functions
  function handleUpdate() {
    fetch(`http://localhost:5000/api/customers/${customer.customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    })
    .then(response => {
      if (response.ok) {
        alert('Customer updated successfully');
      } else {
        alert('Failed to update customer');
      }
    })
    .catch(error => {
      console.error('Error updating customer:', error);
      alert('Error updating customer');
    });
  }

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    fetch(`http://localhost:5000/api/customers/${customer.customerId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        alert('Customer deleted successfully');
        navigate('/customers');
      } else {
        alert('Failed to delete customer');
      }
    })
    .catch(error => {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    });
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this website to print.');
      return;
    }
    const customerReport = `
      <html>
      <head>
        <title>Customer Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Customer Report</h1>
        <table>
          <tr><th>Customer ID</th><td>${customer.customerId}</td></tr>
          <tr><th>Name</th><td>${customer.name}</td></tr>
          <tr><th>Father Name</th><td>${customer.fatherName}</td></tr>
          <tr><th>Mobile No</th><td>${customer.mobileNo}</td></tr>
          <tr><th>CKYC No</th><td>${customer.ckycNo}</td></tr>
          <tr><th>Address</th><td>${customer.address}</td></tr>
          <tr><th>Vehicle Number</th><td>${customer.vehicleNumber}</td></tr>
          <tr><th>Engine Number</th><td>${customer.engineNumber}</td></tr>
          <tr><th>Make</th><td>${customer.make}</td></tr>
          <tr><th>Model</th><td>${customer.model}</td></tr>
          <tr><th>Chassis Number</th><td>${customer.chassisNumber}</td></tr>
          <tr><th>Regn Number</th><td>${customer.regnNumber}</td></tr>
          <tr><th>Ex-showroom Price</th><td>${customer.exShowroomPrice}</td></tr>
          <tr><th>Sale Type</th><td>${customer.saleType}</td></tr>
          <tr><th>Loan Number</th><td>${customer.loanNumber}</td></tr>
          <tr><th>Sanction Amount</th><td>${customer.sanctionAmount}</td></tr>
          <tr><th>Total Amount</th><td>${customer.totalAmount}</td></tr>
          <tr><th>Paid Amount</th><td>${customer.paidAmount}</td></tr>
          <tr><th>Down Payment</th><td>${customer.downPayment}</td></tr>
          <tr><th>Tenure</th><td>${customer.tenure}</td></tr>
          <tr><th>Sale Date</th><td>${customer.saleDate}</td></tr>
          <tr><th>First EMI Date</th><td>${customer.firstEmiDate}</td></tr>
          <tr><th>EMI Amount</th><td>${customer.emiAmount}</td></tr>
          <tr><th>Loan Status</th><td>${customer.loanStatus}</td></tr>
          <tr><th>Next EMI Date</th><td>${customer.nextEmiDate}</td></tr>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(customerReport);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
};

export default CustomerDetail;
