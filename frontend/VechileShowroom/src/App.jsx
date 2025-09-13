import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Customer from './components/Customer.jsx';
import CustomerDetail from './components/CustomerDetail.jsx';
import MultiStepForm from './components/MultiStepForm.jsx';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customer />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/add-sale" element={<MultiStepForm />} />
      </Routes>
    </Router>
  );
}

export default App;
