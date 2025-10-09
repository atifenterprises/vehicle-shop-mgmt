import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Customer from './components/Customer.jsx';
import CustomerDetail from './components/CustomerDetail.jsx';
import MultiStepForm from './components/MultiStepForm.jsx';
import AddVehicleForm from './components/AddVehicleForm.jsx';
import Vehicle from './components/Vehicle.jsx';
import VehicleDetails from './components/VehicleDetails.jsx';
import CalculateEMI from './components/CalculateEMI.jsx';
import Cashflow from './components/Cashflow.jsx';
import CustomerEnquiry from './components/CustomerEnquiry.jsx';
import SalesFinance from './components/SalesFinance.jsx';
import LoanRepayments from './components/LoanRepayments.jsx';
import Sidebar from './Sidebar.jsx';
import './index.css';

function App() {
  const [isEMIDialogOpen, setIsEMIDialogOpen] = useState(false);

  const openEMIDialog = () => setIsEMIDialogOpen(true);
  const closeEMIDialog = () => setIsEMIDialogOpen(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard openEMIDialog={openEMIDialog} />} />
        <Route path="/customers" element={<Customer />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/add-sale" element={<MultiStepForm />} />
        <Route path="/add-vehicle" element={<AddVehicleForm />} />
        <Route path="/vehicles" element={<Vehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/cashflows" element={<Cashflow />} />
        <Route path="/customerEnquiry" element={<CustomerEnquiry />} />
        <Route path="/sales-finance" element={<SalesFinance />} />
        <Route path="/loan-repayments" element={<LoanRepayments />} />
      </Routes>
      {isEMIDialogOpen && (
        <div className="modal-overlay" onClick={closeEMIDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CalculateEMI onClose={closeEMIDialog} />
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
