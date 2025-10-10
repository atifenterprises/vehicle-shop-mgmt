import React, { useState } from 'react';
import {Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './components/Auth/AuthContext.jsx';
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
import Sidebar from './Sidebar.jsx';
import './index.css';
import LoginForm from './components/Auth/LoginForm.jsx';
import SignOut from './components/Auth/SignOut.jsx';
import Verified from './components/Auth/Verified.jsx';
import ForgotPassword from './components/Auth/ForgotPassword.jsx';
import ResetPassword from './components/Auth/ResetPassword.jsx';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('isAuthenticated1:', isAuthenticated);
  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking session
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
        <Route path="/verified" element={<Verified />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} /> */}
        <Route path="/signout" element={<ProtectedRoute><SignOut /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard openEMIDialog={openEMIDialog} /></ProtectedRoute>} />
        {/* <Route path="/" element={<Dashboard  />} /> */}
        {/* <Route path="/customers" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
        <Route path="/add-sale" element={<ProtectedRoute><MultiStepForm /></ProtectedRoute>} />
        <Route path="/add-vehicle" element={<ProtectedRoute><AddVehicleForm /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Vehicle /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
        <Route path="/cashflows" element={<ProtectedRoute><Cashflow /></ProtectedRoute>} />
        <Route path="/customerEnquiry" element={<ProtectedRoute><CustomerEnquiry /></ProtectedRoute>} /> */}

        <Route path="/customers" element={<Customer />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/add-sale" element={<MultiStepForm />} />
        <Route path="/add-vehicle" element={<AddVehicleForm />} />
        <Route path="/vehicles" element={<Vehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/cashflows" element={<Cashflow />} />
        <Route path="/customerEnquiry" element={<CustomerEnquiry />} />
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
