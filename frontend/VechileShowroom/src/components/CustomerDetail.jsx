import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { generateLetterHTML } from './LetterPrint';

const CustomerDetail = () => {
  // Company details for the letter
  const company = {
    name: 'Vehicle Showroom Company',
    address: '123 Main Street, City, State, ZIP Code',
    phone: '+1-234-567-8900',
    email: 'info@vehicleshowroom.com'
  };
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
    batterySerialNumber: '',
    batteryCount: '',
    vehicleChargerName:'',
    saleType: '',
    shopNumber: '',
    loanNumber: '',
    sanctionAmount: '',
    totalAmount: '',
    paidAmount: '',
    downPayment: '',
    tenure: '',
    saleDate: '',
    firstEmiDate: '',
    emiAmount: '',
    interestRate: '',
    emiSchedule: [],
    salesStatus: '',
    nextEmiDate: '',
    promisedPaymentDate: '',
    interest: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customer data from backend using ID
  const fetchCustomerData = async (id) => {
    setLoading(true);
    setError(null);
    try {

      const response = await fetch(`http://localhost:5000/api/customers/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      const data = await response.json();    
      console.log('Data customer :', data);
      setCustomer({
        customerId: data.customer?.customerId || '',
        date: data.customer?.date || '',
        name: data.customer?.name || '',
        fatherName: data.customer?.fatherName || '',
        mobileNo: data.customer?.mobileNo || '',
        ckycNo: data.customer?.ckycNo || '',
        address: data.customer?.address || '',
        vehicleNumber: data.vehicle?.vehicleNumber || '',
        engineNumber: data.vehicle?.engineNumber || '',
        make: data.vehicle?.make || '',
        model: data.vehicle?.model || '',
        chassisNumber: data.vehicle?.chassisNumber || '',
        regnNumber: data.vehicle?.regnNumber || '',
        exShowroomPrice: data.vehicle?.exShowroomPrice ? data.vehicle.exShowroomPrice.toString() : '',
        batterySerialNumber: data.vehicle?.batterySerialNumber || '',
        batteryCount: data.vehicle?.batteryCount ? data.vehicle.batteryCount.toString() : '',
        vehicleChargerName:data.vehicle?.vehicleChargerName ||'',
        color: data.vehicle?.color || '',
        toolKit: data.vehicle?.toolKit || '',
        batteryType: data.vehicle?.batteryType || '',
        vehicleChargerType: data.vehicle?.vehicleChargerType || '',
        purchaseDate: data.vehicle?.purchaseDate || '',
        saleDate: data.vehicle?.saleDate || '',
        vehicleStatus: data.vehicle?.vehicleStatus || '',
        saleType: data.sales?.saleType || '',
        shopNumber: data.sales?.shopNumber ? data.sales.shopNumber.toString() : '',
        loanNumber: data.sales?.loanNumber || '',
        totalAmount: data.sales?.totalAmount ? data.sales.totalAmount.toString() : '',
        paidAmount: data.sales?.paidAmount ? data.sales.paidAmount.toString() : '',
        downPayment: data.sales?.downPayment ? data.sales.downPayment.toString() : '',
        loanAmount: data.sales?.loanAmount ? data.sales.loanAmount.toString() : '',
        tenure: data.sales?.tenure ? data.sales.tenure.toString() : '',
        firstEmiDate: data.sales?.firstEMIDate || '',
        emiAmount: data.sales?.EMIAmount ? data.sales.EMIAmount.toString() : '',
        interestRate:data.sales?.interestRate? data.sales.interestRate.toString():'',
        emiSchedule: data.sales?.emiSchedule && Array.isArray(data.sales.emiSchedule) ? updateBuckets(data.sales.emiSchedule) : [],
        salesStatus: data.summary?.loanStatus || '',
        nextEmiDate: data.summary?.nextEmiDate || '',
        promisedPaymentDate: data.sales?.lastpaymentDate || '',
        interest: 0,
      });
      console.log('Interest Rate from API:', data.sales?.interestRate);
      console.log('Full sales data:', data.sales);



    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //fetch from backend using ID from URL
    if (id) {
      //console.log('useeffect fetch customer: ', id)
      fetchCustomerData(id);
    } else if (customerFromState) { // If customer data is passed from state (from Customer.jsx), use it
      console.log('customerFromState :: ', { customerFromState });
      setCustomer(customerFromState);
    }
  }, [customerFromState, id]);

  // Calculate promised payment date for cash sales if missing
  useEffect(() => {
    if (customer.saleType?.toLowerCase() === 'cash' && !customer.promisedPaymentDate && customer.saleDate) {
      const saleDate = new Date(customer.saleDate);
      const interestRate = 17.5; // 17.5% interest rate
      const daysToAdd = Math.ceil((parseFloat(customer.totalAmount) - parseFloat(customer.paidAmount)) * interestRate / 100 / 365);
      const promisedDate = new Date(saleDate);
      promisedDate.setDate(promisedDate.getDate() + daysToAdd);
      setCustomer(prev => ({ ...prev, promisedPaymentDate: promisedDate.toISOString().split('T')[0] }));
    }
  }, [customer.saleType, customer.saleDate, customer.totalAmount, customer.paidAmount, customer.promisedPaymentDate]);

  // Generate EMI schedule when loanAmount, tenure, interestRate, firstEmiDate change
  useEffect(() => {
    const loanAmount = parseFloat(customer.loanAmount);
    const tenure = parseInt(customer.tenure);
    const interestRate = parseFloat(customer.interestRate);
    const firstEmiDate = customer.firstEmiDate;

    if (loanAmount > 0 && tenure > 0 && interestRate > 0 && firstEmiDate && (!customer.emiSchedule || customer.emiSchedule.length === 0)) {
      const emiSchedule = generateEmiSchedule(loanAmount, tenure, interestRate, firstEmiDate);
      setCustomer(prev => ({ ...prev, emiSchedule, emiAmount: emiSchedule[0]?.amount.toString() || '' }));
    }
  }, [customer.loanAmount, customer.tenure, customer.interestRate, customer.firstEmiDate, customer.emiSchedule]);

  // Function to generate EMI schedule
  const generateEmiSchedule = (loanAmount, tenure, interestRate, firstEmiDate) => {
    const monthlyRate = interestRate / 12 / 100;
    const emiAmount = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const schedule = [];
    let balance = loanAmount;
    let date = new Date(firstEmiDate);

    for (let i = 1; i <= tenure; i++) {
      const interest = balance * monthlyRate;
      const principal = emiAmount - interest;
      balance -= principal;

      schedule.push({
        emiNo: i,
        date: date.toISOString().split('T')[0],
        principal: Math.round(principal),
        interest: Math.round(interest),
        amount: Math.round(emiAmount),
        balance: Math.round(balance),
        bucket: 0,
        overdueCharges: 0,
        status: 'Due'
      });

      date.setMonth(date.getMonth() + 1);
    }

    return schedule;
  };

  // Function to update buckets based on overdue status
  const updateBuckets = (schedule) => {
    let overdueCount = 0;
    return schedule.map(emi => {
      if (emi.status === 'Overdue') overdueCount++;
      return { ...emi, bucket: overdueCount };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  // const handleEmiStatusChange = (index, newStatus) => {
  //   setCustomer(prev => ({
  //     ...prev,
  //     emiSchedule: prev.emiSchedule.map((emi, i) =>
  //       i === index ? { ...emi, status: newStatus, overdueCharges: newStatus === 'Overdue' ? 650 : 0 } : emi
  //     )
  //   }));
  // };

  const handleEmiStatusChange = (index, newStatus) => {
    setCustomer(prev => {
      const updatedEmiSchedule = prev.emiSchedule.map((emi, i) =>
        i === index ? { ...emi, status: newStatus, overdueCharges: newStatus === 'Overdue' ? 650 : 0 } : emi
      );
      const updatedWithBuckets = updateBuckets(updatedEmiSchedule);
      console.log('Updated EMI Schedule:', updatedWithBuckets); // Log to verify
      return {
        ...prev,
        emiSchedule: updatedWithBuckets
      };
    });
  };

  // Calculate total payable amount
  const calculateTotalPayable = () => {
    const overdueEmis = customer.emiSchedule.filter(emi => emi.status === 'Overdue');
    const overdueCount = overdueEmis.length;
    const emiAmount = parseFloat(customer.emiAmount) || 0;
    const overdueCharges = 650;
    return (overdueCount * emiAmount) + (overdueCount * overdueCharges);
  };
  // Handler functions
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic validation      
      if (!customer.customerId || customer.customerId !== id) {
        throw new Error('Customer IDs is invalid or missing');
      }
      if (!customer.name || !customer.vehicleNumber || !customer.saleType) {
        throw new Error('Names, Vehicle Number, and Sale Type are required');
      }
      console.log('handleupdate customer record:',customer);
      const response = await fetch(`http://localhost:5000/api/customers/${customer.customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update customer: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update Response:', data);

      alert('Customer updated successfully');

    } catch (error) {
      console.error('Error updating customer:', error.message);
      setError(error.message);
      alert(`Error updating customer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
  };

  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this website to print.');
      return;
    }
    const letterHTML = generateLetterHTML(customer, company);
    printWindow.document.write(letterHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  // Helper function to determine which fields to show based on sale type
  const getFieldsToShow = (saleType) => {
    const type = saleType?.toLowerCase();
    if (type === 'finance') {
      return {
        showFinanceFields: true,
        showCashFields: false
      };
    } else if (type === 'cash') {
      return {
        showFinanceFields: false,
        showCashFields: true
      };
    } else {
      return {
        showFinanceFields: true,
        showCashFields: true
      };
    }
  };

  // Helper function to determine back button based on from
  const getBackConfig = (from) => {
    if (from === 'sales-finance') {
      return {
        backButtonText: 'Back to Sales & Finance',
        backButtonRoute: '/sales-finance'
      };
    } else if (from === 'cashflow') {
      return {
        backButtonText: 'Back to Sales & Cash',
        backButtonRoute: '/cashflows'
      };
    } else if (from === 'loan-repayments') {
      return {
        backButtonText: 'Back to Loan Repayments',
        backButtonRoute: '/loan-repayments'
      };
    }
  };

  const fieldConfig = getFieldsToShow(customer.saleType);
  const backConfig = getBackConfig(location.state?.from);

  // Show loading state
  if (loading) {
    return (
      <div className="customer-container">
        <header className="customer-header">
          <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
          <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
            ← {backConfig.backButtonText}
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
          <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
            ← {backConfig.backButtonText}
          </button>
        </header>
        <div className="error-container">
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
            {backConfig.backButtonText}
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
          <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
            ← {backConfig.backButtonText}
          </button>
        </header>
        <div className="no-data-container">
          <p>No customer data available. {customer.customerId}</p>
          <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
            {backConfig.backButtonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1><span className="customer-icon">🔒</span> Customer Detail</h1>
        <button className="btn btn-primary" onClick={() => navigate(backConfig.backButtonRoute)}>
          ← {backConfig.backButtonText}
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
        <label>
          Battery Serial Name:
          <input type="text" name="batterySerialNumber" value={customer.batterySerialNumber} onChange={handleChange} />
        </label>
        <label>
          Battery Count:
          <input type="number" name="batteryCount" value={customer.batteryCount} onChange={handleChange} />
        </label>
        <label>
          Color:
          <input type="text" name="color" value={customer.color} onChange={handleChange} />
        </label>
        <label>
          Tool Kit:
          <input type="text" name="toolKit" value={customer.toolKit} onChange={handleChange} />
        </label>
        <label>
          Battery Type:
          <input type="text" name="batteryType" value={customer.batteryType} onChange={handleChange} />
        </label>
        <label>
          Vehicle Charger Type:
          <input type="text" name="vehicleChargerName" value={customer.vehicleChargerName} onChange={handleChange} />
        </label>
        <label>
          Purchase Date:
          <input type="date" name="purchaseDate" value={customer.purchaseDate} onChange={handleChange} />
        </label>
        <label>
          Sale Date:
          <input type="date" name="saleDate" value={customer.saleDate} onChange={handleChange} />
        </label>
        <label>
          Vehicle Status:
          <input type="text" name="vehicleStatus" value={customer.vehicleStatus} onChange={handleChange} />
        </label>

        {/* Sales Details */}
        <h3>Sales Details</h3>
        <label>
          Sale Type:
          <input type="text" name="saleType" value={customer.saleType} onChange={handleChange} />
        </label>
        {customer.saleType?.toLowerCase() !== 'finance' && (
          <label>
            Shop Number:
            <input type="text" name="shopNumber" value={customer.shopNumber} onChange={handleChange} />
          </label>
        )}

        {/* Finance Sale Fields */}
        {fieldConfig.showFinanceFields && (
          <>
            <label>
              Loan Number:
              <input type="text" name="loanNumber" value={customer.loanNumber} onChange={handleChange} />
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
              Loan Amount:
              <input type="number" name="loanAmount" value={customer.loanAmount} onChange={handleChange} />
            </label>
            <label>
              Tenure:
              <input type="number" name="tenure" value={customer.tenure} onChange={handleChange} />
            </label>
            <label>
              Interest Rate (% per annum):
              <input type="number" name="interestRate" value={customer.interestRate} onChange={handleChange} />
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
              <select name="salesStatus" value={customer.salesStatus} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </label>
          </>
        )}

        {/* EMI Schedule */}
        {fieldConfig.showFinanceFields && customer.emiSchedule && customer.emiSchedule.length > 0 && (
          <>
            <h3>EMI Schedule</h3>
            <div className="emi-schedule">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>EMI No.</th>
                    <th>Due Date</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Bucket (Overdue EMIs)</th>
                    <th>Overdue Charges</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.emiSchedule.map((emi, index) => (
                    <tr key={index}>
                      <td>{emi.emiNo}</td>
                      <td>{emi.date}</td>
                      <td>₹{emi.principal.toLocaleString('en-IN')}</td>
                      <td>₹{emi.interest.toLocaleString('en-IN')}</td>
                      <td>₹{emi.amount.toLocaleString('en-IN')}</td>
                      <td>₹{emi.balance.toLocaleString('en-IN')}</td>
                      <td>{emi.bucket}</td>
                      <td>₹{emi.overdueCharges.toLocaleString('en-IN')}</td>
                      <td>₹{(emi.amount + emi.overdueCharges).toLocaleString('en-IN')}</td>
                      <td>
                        <select
                          value={emi.status ? emi.status : 'Due'}
                          onChange={(e) => handleEmiStatusChange(index, e.target.value)}>
                          <option value="Paid">Paid</option>
                          <option value="Due">Due</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Payable for Overdue EMIs:</td>
                    <td style={{ fontWeight: 'bold' }}>₹{calculateTotalPayable().toLocaleString('en-IN')}</td>
                    <td colSpan="4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
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
              <input type="number" value={String(customer.totalAmount - customer.paidAmount || 0)} readOnly />
            </label>
            <label>
              Sale Date:
              <input type="date" name="saleDate" value={customer.saleDate} onChange={handleChange} />
            </label>
            <label>
              Promised Payment Date:
              <input type="date" name="promisedPaymentDate" value={customer.promisedPaymentDate} onChange={handleChange} />
            </label>
            <label>
              Payment Status:
              <select name="salesStatus" value={customer.salesStatus} onChange={handleChange}>
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


};

export default CustomerDetail;
