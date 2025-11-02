import React, { useState } from 'react';
import {Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext.jsx';
import Dashboard from './Dashboard.jsx';
import Customer from './components/Customer.jsx';
import CustomerDetail from './components/CustomerDetail.jsx';
import MultiStepForm from './components/MultiStepForm.jsx';
import AddVehicleForm from './components/AddVehicleForm.jsx';
import Vehicle from './components/Vehicle.jsx';
import VehicleDetails from './components/VehicleDetails.jsx';
import Battery from './components/Battery.jsx';
import BatterySaleForm from './components/BatterySaleForm.jsx';
import BatteryInvoice from './components/BatteryInvoice.jsx';
import CalculateEMI from './components/CalculateEMI.jsx';
import Cashflow from './components/Cashflow.jsx';
import CustomerEnquiry from './components/CustomerEnquiry.jsx';
import LoadingProgress from './components/LoadingProgress.jsx';
import Sidebar from './Sidebar.jsx';
import './index.css';
import LoginForm from './Auth/LoginForm.jsx';
import SignOut from './Auth/SignOut.jsx';
//import Verified from './Auth/Verified.jsx';
import ForgotPassword from './Auth/ForgotPassword.jsx';
import ResetPassword from './Auth/ResetPassword.jsx';
import { useEffect } from 'react';
import SignUpForm from './Auth/SignUpForm.jsx';
import SalesFinance from './components/SalesFinance.jsx';
import LoanRepayments from './components/LoanRepayments.jsx';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('isAuthenticated1:', isAuthenticated);
  if (loading) {
    return (
      <>
        <LoadingProgress />
        <div>Loading...</div>
      </>
    ); // Show loading progress bar and loading state while checking session
  }
  console.log('isAuthenticated:', isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isEMIDialogOpen, setIsEMIDialogOpen] = useState(false);
  const openEMIDialog = () => setIsEMIDialogOpen(true);
  const closeEMIDialog = () => setIsEMIDialogOpen(false);
  const location = useLocation();
  useEffect(()=>{
    console.log('Current URL:', location.pathname+location.search+location.hash);
  },[location])
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginForm />} />  
        <Route path="/vehicle-shop-mgmt" element={<LoginForm />} />        
        {/* <Route path="/verified" element={<Verified />} /> */}
        <Route path="/signup" element={<ProtectedRoute><SignUpForm /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        {/* <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} /> */}
        <Route path="/signout" element={<ProtectedRoute><SignOut /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard openEMIDialog={openEMIDialog} /></ProtectedRoute>} />
        {/* <Route path="/" element={<Dashboard  />} /> */}
        <Route path="/customers" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
        <Route path="/add-sale" element={<ProtectedRoute><MultiStepForm /></ProtectedRoute>} />
        <Route path="/add-vehicle" element={<ProtectedRoute><AddVehicleForm /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Vehicle /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
        <Route path="/batteries" element={<ProtectedRoute><Battery /></ProtectedRoute>} />
        <Route path="/battery-sale" element={<ProtectedRoute><BatterySaleForm /></ProtectedRoute>} />
        <Route path="/battery-invoice/:id" element={<ProtectedRoute><BatteryInvoice /></ProtectedRoute>} />
        <Route path="/cashflows" element={<ProtectedRoute><Cashflow /></ProtectedRoute>} />
        <Route path="/sales-finance" element={<ProtectedRoute><SalesFinance/></ProtectedRoute>} />
        <Route path="/loan-repayments" element={<ProtectedRoute><LoanRepayments /></ProtectedRoute>} />
        <Route path="/customerEnquiry" element={<ProtectedRoute><CustomerEnquiry /></ProtectedRoute>} />
      </Routes>
      {isEMIDialogOpen && (
        <div className="modal-overlay" onClick={closeEMIDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CalculateEMI onClose={closeEMIDialog} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
