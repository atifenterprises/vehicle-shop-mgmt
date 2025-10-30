const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

// Helper functions for mapping
const mapVehicleToCamelCase = (vehicle) => {
  return {
    vehicleNumber: vehicle.vehicleNumber,
    engineNumber: vehicle.engineNumber,
    make: vehicle.make,
    model: vehicle.model,
    chassisNumber: vehicle.chassisNumber,
    batterySerialNumber: vehicle.batterySerialNumber,
    batteryCount: vehicle.batteryCount,
    regnNumber: vehicle.regnNumber,
    exShowroomPrice: vehicle.exShowroomPrice,
    purchaseDate: vehicle.purchaseDate,
    color: vehicle.color,
    toolKit: vehicle.toolKit,
    batteryType: vehicle.batteryType,
    vehicleChargerName: vehicle.vehicleChargerName,
    saleDate: vehicle.saleDate,
    vehicleStatus: vehicle.vehicleStatus,
  };
};

const mapVehicleToDatabase = (vehicle) => ({
  vehicleNumber: vehicle.vehicleNumber,
  engineNumber: vehicle.engineNumber,
  make: vehicle.make,
  model: vehicle.model,
  chassisNumber: vehicle.chassisNumber,
  batterySerialNumber: vehicle.batterySerialNumber,
  batteryCount: vehicle.batteryCount,
  regnNumber: vehicle.regnNumber,
  exShowroomPrice: vehicle.exShowroomPrice,
  purchaseDate: vehicle.purchaseDate,
  color: vehicle.color,
  toolKit: vehicle.toolKit,
  batteryType: vehicle.batteryType,
  vehicleChargerName: vehicle.vehicleChargerName,
  saleDate: vehicle.saleDate,
  vehicleStatus: vehicle.vehicleStatus,
});

const mapBatteryToDatabase = (battery) => {
  return {
    serialNumber: battery.serialNumber,
    batteryName: battery.batteryName,
    batteryType: battery.batteryType,
    price: battery.price,
    warrantyMonths: battery.warrantyMonths,
    status: battery.status,
    purchaseDate: battery.purchaseDate,
  };
};

const mapBatteryToCamelCase = (battery) => {
  return {
    serialNumber: battery.serialNumber,
    batteryName: battery.batteryName,
    batteryType: battery.batteryType,
    price: battery.price,
    warrantyMonths: battery.warrantyMonths,
    status: battery.status,
    purchaseDate: battery.purchaseDate,
  };
};

// Validation function for vehicle data
const validateVehicleData = (data, isUpdate = false) => {
  const errors = [];

  // Required fields for POST
  if (!isUpdate) {
    if (!data.vehicleNumber || typeof data.vehicleNumber !== 'string' || data.vehicleNumber.trim() === '') {
      errors.push('vehicleNumber is required and must be a non-empty string');
    }
    if (!data.make || typeof data.make !== 'string' || data.make.trim() === '') {
      errors.push('make is required and must be a non-empty string');
    }
    if (!data.model || typeof data.model !== 'string' || data.model.trim() === '') {
      errors.push('model is required and must be a non-empty string');
    }
    if (!data.chassisNumber || typeof data.chassisNumber !== 'string' || data.chassisNumber.trim() === '') {
      errors.push('chassisNumber is required and must be a non-empty string');
    }
  }

  // Validate batteryCount: must be integer >= 0
  if (data.batteryCount !== undefined) {
    if (!Number.isInteger(data.batteryCount) || data.batteryCount < 0) {
      errors.push('batteryCount must be a non-negative integer');
    }
  }

  // Validate exShowroomPrice: must be number >= 0 if provided
  if (data.exShowroomPrice !== undefined && data.exShowroomPrice !== null && data.exShowroomPrice !== '') {
    const price = parseFloat(data.exShowroomPrice);
    if (isNaN(price) || price < 0) {
      errors.push('exShowroomPrice must be a non-negative number');
    }
  }

  // Validate purchaseDate: must be valid date string if provided
  if (data.purchaseDate && isNaN(Date.parse(data.purchaseDate))) {
    errors.push('purchaseDate must be a valid date');
  }

  // Validate saleDate: must be valid date string if provided
  if (data.saleDate && isNaN(Date.parse(data.saleDate))) {
    errors.push('saleDate must be a valid date');
  }

  return errors;
};

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Authentication endpoints
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({ message: error.message });
    }
    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.json({
      message: "Signup successful. Please verify your email.",
      user: data.user
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/signout", async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    const { error } = await userSupabase.auth.signOut();
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.json({ message: 'Sign out successful' });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password Endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const {data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/resetpassword',
    });
    console.log('Forgot Data: ', {data});
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

});

app.post('/api/resetpassword', async (req, res) => {
  const { accessToken, newPassword } = req.body;

  if (!accessToken || !newPassword) {
    return res.status(400).json({ message: 'Missing access token or new password.' });
  }

  try {
    const decoded = jwt.decode(accessToken);
    const userId = decoded?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid access token.' });
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error.'+ err });
  }

});

app.get("/api/session", async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }
  try {
    // Create a new supabase client with the user's token to verify
    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    const { data, error } = await userSupabase.auth.getUser();
    if (error) {
      return res.status(401).json({ isAuthenticated: false });
    }
    res.json({ isAuthenticated: true, user: data.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// API endpoint for dashboard metrics
app.get("/api/dashboard/metrics", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;

    const { data: batterySalesData, error: batterySalesError } = await supabase.from('battery_sales').select('*');
    if (batterySalesError) throw batterySalesError;

    // Calculate metrics from data
    const financeCustomers = customersData.filter(c => c.saleType === 'Finance');
    const cashCustomers = customersData.filter(c => c.saleType === 'Cash');
    const activeLoans = financeCustomers.filter(c => c.loanStatus === 'Active');
    const overduePayments = financeCustomers.filter(c => c.loanStatus === 'Overdue');

    const totalLoans = financeCustomers.length;
    const activeLoansCount = activeLoans.length;
    const overduePaymentsCount = overduePayments.length;

    // Total Collection: sum of EMIAmount for active loans
    const totalCollection = activeLoans.reduce((sum, c) => sum + parseFloat(c.EMIAmount.replace(/,/g, '')), 0);
    const totalCollectionFormatted = `₹${totalCollection.toLocaleString('en-IN')}`;

    // New metrics
    const totalSales = financeCustomers.length + cashCustomers.length;
    const cashSalesCount = cashCustomers.length;
    const cashSalesAmount = cashCustomers.reduce((sum, c) => sum + parseFloat(c.totalAmount.replace(/,/g, '')), 0);
    const batterySalesCount = batterySalesData.length;
    const batterySalesAmount = batterySalesData.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalRevenue = financeCustomers.reduce((sum, c) => sum + parseFloat(c.totalAmount.replace(/,/g, '')), 0) +
      cashSalesAmount + batterySalesAmount;

    res.json({
      totalLoans,
      activeLoans: activeLoansCount,
      overduePayments: overduePaymentsCount,
      totalCollection,
      totalCollectionFormatted,
      totalLoansChange: "+12%", // Keep static for now
      activeLoansRate: totalLoans > 0 ? `${Math.round((activeLoansCount / totalLoans) * 100)}%` : "0%",
      overduePaymentsNote: overduePaymentsCount > 0 ? "Requires attention" : "All good",
      totalCollectionChange: "+8%", // Keep static
      totalSales,
      cashSalesCount,
      cashSalesAmount,
      batterySalesCount,
      batterySalesAmount,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for monthly collection trend
app.get("/api/dashboard/monthly-collection", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;

    const { data: batterySalesData, error: batterySalesError } = await supabase.from('battery_sales').select('*');
    if (batterySalesError) throw batterySalesError;

    // Aggregate EMI collections by month from finance customers
    const emiMonthly = {};
    customersData.filter(c => c.saleType === 'Finance').forEach(customer => {
      if (customer.emiSchedule && Array.isArray(customer.emiSchedule)) {
        customer.emiSchedule.forEach(emi => {
          if (emi.status === 'Paid') {
            const month = new Date(emi.date).getMonth();
            emiMonthly[month] = (emiMonthly[month] || 0) + parseFloat(emi.amount);
          }
        });
      }
    });

    // Aggregate battery sales by month
    const batteryMonthly = {};
    batterySalesData.forEach(sale => {
      const month = new Date(sale.saleDate).getMonth();
      batteryMonthly[month] = (batteryMonthly[month] || 0) + sale.totalAmount;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Combine EMI and battery sales collections
    const collection = months.map((_, idx) => (emiMonthly[idx] || 0) + (batteryMonthly[idx] || 0));

    res.json({
      months,
      collection
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for loan status distribution
app.get("/api/dashboard/loan-status", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;
    const financeCustomers = customersData.filter(c => c.saleType === 'Finance');
    let activeCount = 0;
    let closedCount = 0;
    let overdueCount = 0;

    financeCustomers.forEach(customer => {
      if (customer.loanStatus === 'Active') {
        activeCount++;
      } else if (customer.loanStatus === 'Overdue') {
        overdueCount++;
      } else {
        closedCount++;
      }
    });

    res.json({
      statuses: ["Active", "Closed", "Overdue"],
      counts: [activeCount, closedCount, overdueCount]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to handle form submission
app.post('/api/sales', async (req, res) => {
  try {
    const formData = req.body;
    console.log('FormData:', { formData });
    // Insert customer
    const customerData = {
      customerId: formData.customerId,
      date: formData.date,
      name: formData.name,
      fatherName: formData.fatherName,
      mobileNo: formData.mobileNo,
      ckycNo: formData.ckycNo,
      address: formData.address,
    };

    // Insert vehicle
    const vehicleData = {
      vehicleNumber: formData.vehicleNumber,
      engineNumber: formData.engineNumber,
      make: formData.make,
      model: formData.model,
      chassisNumber: formData.chassisNumber,
      batterySerialNumber: formData.batterySerialNumber || '', // Fallback to '' if not provided
      batteryCount: parseInt(formData.batteryCount) || 0, // Fallback to 0 if not provided
      regnNumber: formData.regnNumber,
      exShowroomPrice: parseFloat(formData.exShowroomPrice),
      color: formData.color || '',
      toolKit: formData.toolKit || '',
      batteryType: formData.batteryType || '',
      vehicleChargerName: formData.vehicleChargerName || '',
      purchaseDate: formData.purchaseDate || null,
      saleDate: formData.saleDate || null,
      vehicleStatus: formData.vehicleStatus || 'Sold',
    };

    const vehicleId = vehicleData.vehicle_id;

    // Prepare sale data
    const saleData = {
      customerId: formData.customerId,
      vehicleId: formData.vehicleNumber,
      saleType: formData.saleType,
      saleDate: formData.saleDate
    };

    // Add sale-type-specific fields
    if (formData.saleType === 'Cash') {
      saleData.totalAmount = parseFloat(formData.totalAmount);
      saleData.status = 'Completed';
      saleData.shopNumber = formData.shopNumber,
        saleData.paidAmount = parseFloat(formData.paidAmount);
      saleData.remainingAmount = parseFloat(formData.remainingAmount);
      saleData.lastpaymentDate = formData.lastpaymentDate;
      saleData.loanNumber = null;
      saleData.downPayment = 0;
      saleData.loanAmount = 0;
      saleData.tenure = 0;
      saleData.interestRate = 0;
      saleData.firstEMIDate = null;
      saleData.EMIAmount = 0;
      saleData.emiSchedule = null;
    } else if (formData.saleType === 'Finance') {
      saleData.totalAmount = parseFloat(formData.totalAmount);
      saleData.status = 'Active'; // Set status to Active for Finance sales
      saleData.loanNumber = formData.loanNumber;
      saleData.downPayment = parseFloat(formData.downPayment);
      saleData.loanAmount = parseFloat(formData.loanAmount);
      saleData.tenure = parseInt(formData.tenure);
      saleData.interestRate = parseFloat(formData.interestRate);
      saleData.firstEMIDate = formData.firstEMIDate;
      saleData.EMIAmount = parseFloat(formData.EMIAmount);
      saleData.emiSchedule = (formData.emiSchedule && Array.isArray(formData.emiSchedule)) ? formData.emiSchedule.map(emi => ({
        date: emi.date,
        amount: parseFloat(emi.amount) || 0,
        status: emi.status || 'Due',
        emiNo: parseInt(emi.emiNo) || 0,
        principal: parseFloat(emi.principal) || 0,
        interest: parseFloat(emi.interest) || 0,
        balance: parseFloat(emi.balance) || 0,
        bucket: emi.bucket || '0',
        overdueCharges: parseFloat(emi.overdueCharges) || 0,
      })) : null;

    }

    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('insert_sale_transaction', {
      p_customer_data: customerData,
      p_vehicle_data: vehicleData,
      p_sale_data: saleData,
    });

    if (error) {
      throw new Error(`Transaction Failed : ${error.message}`);
    }

    // Update vehicle status to 'Sold' after successful sale
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ vehicleStatus: 'Sold', saleDate: formData.saleDate })
      .eq('vehicleNumber', formData.vehicleNumber);

    if (updateError) {
      console.error('Error updating vehicle status:', updateError);
      // Note: Transaction succeeded but status update failed - consider rollback in production
    }

    // Return success response
    res.status(201).json({
      message: 'Records inserted successfully',
      customer: customerData,
      vehicle: vehicleData,
      sale: saleData
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// API endpoint for sales by type
app.get("/api/dashboard/sales-by-type", async (req, res) => {
  try {
    const { data: salesData, error: salesError } = await supabase.from('sales').select('*');
    if (salesError) throw salesError;

    const financeSales = salesData.filter(s => s.saleType === 'Finance');
    const cashSales = salesData.filter(s => s.saleType === 'Cash');

    const financeCount = financeSales.length;
    const cashCount = cashSales.length;
    const financeAmount = financeSales.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);
    const cashAmount = cashSales.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);

    res.json({
      types: ["Finance", "Cash"],
      counts: [financeCount, cashCount],
      amounts: [financeAmount, cashAmount]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for recent payments
app.get("/api/dashboard/recent-payments", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;

    const { data: batterySalesData, error: batterySalesError } = await supabase.from('battery_sales').select('*');
    if (batterySalesError) throw batterySalesError;

    const payments = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // From finance customers: use saleDate as payment date, assume paid
    customersData.filter(c => c.saleType === 'Finance').forEach(c => {
      const paymentDate = new Date(c.saleDate);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        payments.push({
          customer: c.name,
          loanNo: c.loanNumber,
          amount: c.EMIAmount,
          date: c.saleDate,
          status: 'Paid'
        });
      }
    });

    // From battery sales
    batterySalesData.forEach(b => {
      const paymentDate = new Date(b.saleDate);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        payments.push({
          customer: b.customerName,
          loanNo: '',
          amount: b.totalAmount,
          date: b.saleDate,
          status: 'Paid'
        });
      }
    });

    // Sort by date descending
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return all payments for the current month (no limit)
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for upcoming payments
app.get("/api/dashboard/upcoming-payments", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;
    const upcoming = [];
    const today = new Date();
    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);

    // Finance customers with due EMIs within next 5 days
    customersData.filter(c => c.saleType === 'Finance').forEach(customer => {
      if (customer.emiSchedule && Array.isArray(customer.emiSchedule)) {
        customer.emiSchedule.filter(emi => emi.status === 'Due').forEach(emi => {
          const dueDate = new Date(emi.date);
          if (dueDate >= today && dueDate <= fiveDaysLater) {
            upcoming.push({
              customer: customer.name,
              loanNo: customer.loanNumber,
              amount: emi.amount,
              dueDate: emi.date
            });
          }
        });
      }
    });

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for due payments
app.get("/api/dashboard/due-payments", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;
    const dues = [];
    // Finance customers
    customersData.filter(c => c.saleType === 'Finance').forEach(c => {
      if (c.emiSchedule && Array.isArray(c.emiSchedule)) {
        const overdueEmis = c.emiSchedule.filter(emi => emi.status === 'Overdue');
        if (overdueEmis.length > 0) {
          // Calculate bucket: count of overdue EMIs and total overdue amount
          let overdueCount = overdueEmis.length;
          let totalOverdueAmount = overdueEmis.reduce((sum, emi) => sum + parseFloat(emi.amount), 0);
          // Use the earliest overdue due date
          const earliestOverdueDate = overdueEmis.reduce((earliest, emi) => {
            const emiDate = new Date(emi.date);
            return emiDate < earliest ? emiDate : earliest;
          }, new Date(overdueEmis[0].date));
          dues.push({
            customer: c.name,
            loanNo: c.loanNumber,
            amount: c.EMIAmount,
            dueDate: earliestOverdueDate.toISOString().split('T')[0],
            type: 'EMI',
            bucketCount: overdueCount,
            bucketAmount: totalOverdueAmount
          });
        }
      }
    });

    res.json(dues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for EMI payments
app.get("/api/emi-payments", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;

    const emiPayments = [];
    customersData.filter(c => c.saleType === 'Finance').forEach(customer => {
      if (customer.emiSchedule && Array.isArray(customer.emiSchedule)) {
        customer.emiSchedule.forEach(emi => {
          emiPayments.push({
            customerName: customer.name,
            loanNumber: customer.loanNumber,
            emiAmount: emi.amount,
            dueDate: emi.date,
            status: emi.status
          });
        });
      }
    });

    res.json(emiPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to generate EMI schedule
const generateEmiSchedule = (firstEmiDate, tenure, emiAmount, loanAmount) => {
  if (!firstEmiDate || !tenure || !emiAmount || !loanAmount) return [];
  const schedule = [];
  const startDate = new Date(firstEmiDate);
  const emiAmt = parseFloat(emiAmount.replace(/,/g, ''));
  const loanAmt = parseFloat(loanAmount.replace(/,/g, ''));
  let balance = loanAmt;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < tenure; i++) {
    const emiDate = new Date(startDate);
    emiDate.setMonth(startDate.getMonth() + i);
    const dateStr = emiDate.toISOString().split('T')[0];
    const principal = Math.round(emiAmt * 0.7); // Assume 70% principal
    const interest = emiAmt - principal;
    balance -= principal;
    if (balance < 0) balance = 0;

    let status = 'due';
    if (dateStr < today) status = 'overdue';

    schedule.push({
      emiNo: i + 1,
      date: dateStr,
      principal: principal,
      interest: interest,
      amount: emiAmt,
      balance: balance,
      bucket: 'Current',
      overdueCharges: status === 'overdue' ? 650 : 0,
      status: status
    });
  }
  return schedule;
};

// GET /api/sales-details - Fetch customer + vehicle + sale data
app.get("/api/sales-details", async (req, res) => {
  try {
    console.log('originalUrl by get:', req.originalUrl);
    console.log('Query params:', req.query);

    const {
      customerId,
      mobileNo,
      ckycNo,
      vehicleNumber,
      loanNumber,
      saleType
    } = req.query;

    // Call the RPC function
    const { data, error } = await supabase.rpc('get_customer_vehicle_sale_details_basedon_saletype', {
      p_customer_id: customerId || null,
      p_mobile_no: mobileNo || null,
      p_ckyc_no: ckycNo || null,
      p_vehicle_number: vehicleNumber || null,
      p_loan_number: loanNumber || null,
      p_sale_type: saleType || null
    });

    if (error) throw error;

    console.log('Sales details data:', data);
    res.json(data);  // Return raw JSON array
  } catch (err) {
    console.error('Error in GET /api/sales-details:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET customers
app.get("/api/customers", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*');
    console.log('originalUrl by get : ', req.originalUrl);
    console.log('Customers data by get:', { data });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new customer
app.post("/api/customers", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').insert([req.body]).select();
    console.log('originalUrl by post : ', req.originalUrl);
    console.log('Customers data by post:', { data });
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    console.log('saleData by id:: ', req.params.id);
    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('customerId', req.params.id)
      .single();
    console.log('customerData by id:: ', { customer });

    if (customerError) throw customerError;
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch sales data
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('customerId', req.params.id)
      .single();
    console.log('saleData:: ', { sales });

    if (salesError && salesError.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows found" in Supabase
      throw salesError;
    }

    // Fetch Vehicle data
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicleNumber', sales.vehicleId)
      .single();
    console.log('vehiclesData:: ', { vehicle });

    if (vehicleError && vehicleError.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows found" in Supabase
      throw vehicleError;
    }

    // Map vehicle data to camelCase for consistent field naming
    const mappedVehicle = vehicle ? mapVehicleToCamelCase(vehicle) : null;

    // Initialize default values for summary
    let nextEmiDate = '-';
    let loanStatus = 'Closed';
    let totalSales = sales ? 1 : 0;
    let totalAmount = sales ? parseFloat(sales.totalAmount) || 0 : 0;
    let totalPaid = sales ? parseFloat(sales.paidAmount) || 0 : 0;

    // Calculate nextEmiDate as the date of the first unpaid EMI (status 'due' or 'overdue')
    if (sales && sales.emiSchedule && sales.emiSchedule.length > 0) {
      const firstUnpaidEmi = sales.emiSchedule.find(emi => emi.status !== 'Paid');
      nextEmiDate = firstUnpaidEmi?.date || '-';
    }
    console.log('nextEmiDate : ', nextEmiDate)

    // Update loanStatus based on EMI statuses
    if (sales && sales.emiSchedule && sales.emiSchedule.length > 0) {
      const hasOverdue = sales.emiSchedule.some(emi => emi.status === 'Overdue');
      const hasDue = sales.emiSchedule.some(emi => emi.status === 'Due');
      if (hasOverdue) {
        loanStatus = 'Overdue';
      } else if (hasDue) {
        loanStatus = 'Active';
      }
    }
    console.log('loanStatus : ', loanStatus)
    // Return EVERYTHING
    const response = {
      customer,
      vehicle: mappedVehicle,
      sales: sales || null,
      summary: {
        nextEmiDate,
        loanStatus,
        totalSales,
        totalAmount,
        totalPaid,
      },
    };
    console.log('response saleData:: ', { response });
    res.json(response);    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer by ID
app.put('/api/customers/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const formData = req.body;
  const reqObj = {
    date: formData.date,
    name: formData.name,
    fatherName: formData.fatherName,
    mobileNo: formData.mobileNo,
    ckycNo: formData.ckycNo,
    address: formData.address,
    vehicleNumber: formData.vehicleNumber,
    engineNumber: formData.engineNumber,
    make: formData.make,
    model: formData.model,
    chassisNumber: formData.chassisNumber,
    batterySerialNumber: formData.batterySerialNumber || '', // Fallback to '' if not provided
    batteryCount: parseInt(formData.batteryCount) || 0, // Fallback to 0 if not provided
    regnNumber: formData.regnNumber,
    exShowroomPrice: parseFloat(formData.exShowroomPrice) || 0,
    vehicleId: formData.vehicleNumber,
    saleType: formData.saleType,
    saleDate: formData.saleDate,
    totalAmount: parseFloat(formData.totalAmount) || 0,
    shopNumber: formData.shopNumber || null,
    loanNumber :formData.loanNumber || 0,
    sanctionAmount:null,
    paidAmount: parseFloat(formData.paidAmount) || 0,
    remainingAmount: parseFloat(formData.remainingAmount) || 0,
    lastpaymentDate: formData.lastpaymentDate || null,
    downPayment : parseFloat(formData.downPayment) || 0,
    loanAmount: parseFloat(formData.loanAmount) || 0,
    tenure: parseInt(formData.tenure) || 0,
    firstEMIDate: formData.firstEmiDate || null,
    EMIAmount : parseFloat(formData.emiAmount) || 0,
    emiSchedule : (formData.emiSchedule && Array.isArray(formData.emiSchedule)) ? formData.emiSchedule.map(emi => ({
      emiNo: parseInt(emi.emiNo) || 0,
      date: emi.date || '',
      amount: parseFloat(emi.amount) || 0,
      status: emi.status ? emi.status : 'Due',
      principal: parseFloat(emi.principal) || 0,
      interest: parseFloat(emi.interest) || 0,
      balance: parseFloat(emi.balance) || 0,
      bucket: emi.bucket || '0',
      overdueCharges: parseFloat(emi.overdueCharges) || 0,
    })) : null,
    loanStatus:null,
    promisedPaymentDate:null
  }; 

  // Basic validation
  if (!customerId || !reqObj.name || !reqObj.vehicleNumber || !reqObj.saleType) {
    return res.status(400).json({ error: 'Customer ID, Name, Vehicle Number, and Sale Type are required' });
  }

  if (!['Cash', 'Finance'].includes(reqObj.saleType)) {
    return res.status(400).json({ error: 'Sale Type must be either "Cash" or "Finance"' });
  }

  if (reqObj.shopNumber && (reqObj.shopNumber < 1 || reqObj.shopNumber > 5)) {
    return res.status(400).json({ error: 'Shop Number must be between 1 and 5' });
  }
  console.log('reqObj :',reqObj.saleType, reqObj.loanNumber, reqObj.loanAmount, reqObj.tenure, reqObj.firstEMIDate, reqObj.EMIAmount);
  // Additional validation for Finance sale type
  if (reqObj.saleType === 'Finance' && (!reqObj.loanNumber || !reqObj.loanAmount || !reqObj.tenure || !reqObj.firstEMIDate || !reqObj.EMIAmount)) {
    return res.status(400).json({ error: 'Loan Number, Loan Amount, Tenure, First EMI Date, and EMI Amount are required for Finance sales' });
  }

  // Additional validation for Cash sale type
  if (reqObj.saleType === 'Cash' && (!reqObj.totalAmount || !reqObj.saleDate)) {
    return res.status(400).json({ error: 'Total Amount and Sale Date are required for Cash sales' });
  }

  try {
    let rpcFunctionName;
    let rpcParams;

    if (reqObj.saleType === 'Cash') {
      rpcFunctionName = 'update_customer_vehicle_sale_cash';
      rpcParams = {
        p_customer_id: customerId,
        p_date: reqObj.date,
        p_name: reqObj.name,
        p_father_name: reqObj.fatherName,
        p_mobile_no: reqObj.mobileNo,
        p_ckyc_no: reqObj.ckycNo,
        p_address: reqObj.address,
        p_vehicle_number: reqObj.vehicleNumber,
        p_engine_number: reqObj.engineNumber,
        p_make: reqObj.make,
        p_model: reqObj.model,
        p_chassis_number: reqObj.chassisNumber,
        p_regn_number: reqObj.regnNumber,
        p_exshowroom_price: parseFloat(reqObj.exShowroomPrice) || 0,
        p_battery_serial_number: reqObj.batterySerialNumber,
        p_battery_count: parseInt(reqObj.batteryCount) || 1,
        p_sale_type: reqObj.saleType,
        p_shop_number: parseInt(reqObj.shopNumber) || null,
        p_total_amount: parseFloat(reqObj.totalAmount) || 0,
        p_paid_amount: parseFloat(reqObj.paidAmount) || 0,
        p_sale_date: reqObj.saleDate,
        p_last_payment_date: reqObj.lastpaymentDate || null
      };
    } else if (reqObj.saleType === 'Finance') {
      rpcFunctionName = 'update_customer_vehicle_sale_finance';
      rpcParams = {
        p_customer_id: customerId,
        p_date: reqObj.date,
        p_name: reqObj.name,
        p_father_name: reqObj.fatherName,
        p_mobile_no: reqObj.mobileNo,
        p_ckyc_no: reqObj.ckycNo,
        p_address: reqObj.address,
        p_vehicle_number: reqObj.vehicleNumber,
        p_engine_number: reqObj.engineNumber,
        p_make: reqObj.make,
        p_model: reqObj.model,
        p_chassis_number: reqObj.chassisNumber,
        p_regn_number: reqObj.regnNumber,
        p_exshowroom_price: parseFloat(reqObj.exShowroomPrice) || 0,
        p_battery_serial_number: reqObj.batterySerialNumber,
        p_battery_count: parseInt(reqObj.batteryCount) || 1,
        p_sale_type: reqObj.saleType,
        p_loan_number: reqObj.loanNumber || null,
        p_total_amount: parseFloat(reqObj.totalAmount) || 0,
        p_paid_amount: parseFloat(reqObj.paidAmount) || 0,
        p_down_payment: parseFloat(reqObj.downPayment) || 0,
        p_loan_amount: parseFloat(reqObj.loanAmount) || 0,
        p_tenure: parseInt(reqObj.tenure) || null,
        p_sale_date: reqObj.saleDate,
        p_first_emi_date: reqObj.firstEMIDate || null,
        p_emi_amount: parseFloat(reqObj.EMIAmount) || 0,
        p_emi_schedule: reqObj.emiSchedule || null
      };
    } else {
      return res.status(400).json({ error: 'Invalid sale type. Must be Cash or Finance.' });
    }

    // Call the appropriate Supabase RPC function
    const { data, error } = await supabase.rpc(rpcFunctionName, rpcParams);

    if (error) {
      console.error('Transaction error:', error);
      return res.status(500).json({ error: 'Failed to update data: ' + error.message });
    }

    return res.status(200).json({ message: 'Customer, vehicle, and sales data updated successfully', data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.get("/api/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    const mappedData = data.map(mapVehicleToCamelCase);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new vehicle
app.post("/api/vehicles", async (req, res) => {
  try {
    console.log('insert vehicle: ', req.body);

    // Validate input data
    const validationErrors = validateVehicleData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Check for duplicate vehicleNumber
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('vehicleNumber')
      .eq('vehicleNumber', req.body.vehicleNumber)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle with this vehicleNumber already exists' });
    }

    const vehicleData = mapVehicleToDatabase(req.body);
    const { data, error } = await supabase.from('vehicles').insert([vehicleData]).select();
    if (error) throw error;
    const mappedData = mapVehicleToCamelCase(data[0]);
    res.status(201).json(mappedData);
  } catch (err) {
    console.error('Error in POST /api/vehicles:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET vehicle by vehicleNumber
app.get("/api/vehicles/:vehicleNumber", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*').eq('vehicleNumber', req.params.vehicleNumber);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    let vehicle = data[0];

    // Fetch exShowroomPrice from master table if not present
    if (!vehicle.exShowroomPrice) {
      const { data: masterData, error: masterError } = await supabase
        .from('vehicle_models')
        .select('exShowroomPrice')
        .eq('make', vehicle.make)
        .eq('model', vehicle.model)
        .single();
      if (!masterError && masterData) {
        vehicle.exShowroomPrice = masterData.exShowroomPrice;
      }
    }

    const mappedData = mapVehicleToCamelCase(vehicle);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle by vehicleNumber
app.put("/api/vehicles/:vehicleNumber", async (req, res) => {
  try {
    // Fetch existing vehicle data
    const { data: existingVehicle, error: fetchError } = await supabase.from('vehicles').select('*').eq('vehicleNumber', req.params.vehicleNumber).single();
    if (fetchError) throw fetchError;
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Merge provided data with existing, keeping existing exShowroomPrice if not provided or empty
    const updatedData = { ...req.body };
    if (updatedData.exShowroomPrice === undefined || updatedData.exShowroomPrice === null || updatedData.exShowroomPrice === '') {
      updatedData.exShowroomPrice = existingVehicle.exShowroomPrice;
    }

    // Validate input data
    const validationErrors = validateVehicleData(updatedData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    const vehicleData = mapVehicleToDatabase(updatedData);
    const { data, error } = await supabase.from('vehicles').update(vehicleData).eq('vehicleNumber', req.params.vehicleNumber).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    const mappedData = mapVehicleToCamelCase(data[0]);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vehicle by vehicleNumber
app.delete("/api/vehicles/:vehicleNumber", async (req, res) => {
  try {
    // Check if there are any sales records associated with this vehicle
    const { count, error: salesError } = await supabase
      .from('sales')
      .select('customerId', { count: 'exact', head: true })
      .eq('vehicleId', req.params.vehicleNumber);

    if (salesError) throw salesError;

    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete vehicle with associated sales records' });
    }

    const { data, error } = await supabase.from('vehicles').delete().eq('vehicleNumber', req.params.vehicleNumber).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle status by vehicleNumber
app.put("/api/vehicles/:vehicleNumber/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({ vehicleStatus: status })
      .eq('vehicleNumber', req.params.vehicleNumber)
      .select();
      
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer enquiries
app.get("/api/customer-enquiries", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customer_enquiries').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new customer enquiry
app.post("/api/customer-enquiries", async (req, res) => {
  try {
    const newEnquiry = { ...req.body, status: req.body.status || 'New', created_at: new Date().toISOString(), id: Date.now() };
    const { data, error } = await supabase.from('customer_enquiries').insert([newEnquiry]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer enquiry by ID
app.get("/api/customer-enquiries/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customer_enquiries').select('*').eq('id', req.params.id);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer enquiry not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer enquiry by ID
app.put("/api/customer-enquiries/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customer_enquiries').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer enquiry not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer enquiry by ID
app.delete("/api/customer-enquiries/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customer_enquiries').delete().eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer enquiry not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET batteries
app.get("/api/batteries", async (req, res) => {
  try {
    const { data, error } = await supabase.from('batteries').select('*');
    if (error) throw error;
    const mappedData = data.map(mapBatteryToCamelCase);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new battery
app.post("/api/batteries", async (req, res) => {
  try {
    console.log('Received battery data:', req.body);

    const newBattery = {
      ...mapBatteryToDatabase(req.body),
      status: req.body.status || 'In Stock'
    };

    console.log('Battery to insert:', newBattery);
    const { data, error } = await supabase.from('batteries').insert([newBattery]).select();
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Battery inserted successfully:', data);
    const mappedData = mapBatteryToCamelCase(data[0]);
    res.status(201).json(mappedData);
  } catch (err) {
    console.error('Error in POST /api/batteries:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET battery by serial number
app.get("/api/batteries/:serialNumber", async (req, res) => {
  try {
    const { data, error } = await supabase.from('batteries').select('*').eq('serialNumber', req.params.serialNumber);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }
    const mappedData = mapBatteryToCamelCase(data[0]);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update battery by serial number
app.put("/api/batteries/:serialNumber", async (req, res) => {
  try {
    const updateData = mapBatteryToDatabase(req.body);
    const { data, error } = await supabase.from('batteries').update(updateData).eq('serialNumber', req.params.serialNumber).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }
    const mappedData = mapBatteryToCamelCase(data[0]);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE battery by serial number
app.delete("/api/batteries/:serialNumber", async (req, res) => {
  try {
    const { data, error } = await supabase.from('batteries').delete().eq('serialNumber', req.params.serialNumber).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }
    const mappedData = mapBatteryToCamelCase(data[0]);
    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET battery sales
app.get("/api/battery-sales", async (req, res) => {
  try {
    const { data, error } = await supabase.from('battery_sales').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new battery sale
app.post("/api/battery-sales", async (req, res) => {
  try {
    // Validate that serialNumber and batteries arrays have the same length
    if (!req.body.serialNumber || !req.body.batteries ||
      req.body.serialNumber.length !== req.body.batteries.length) {
      return res.status(400).json({ error: 'serialNumber and batteries arrays must have the same length' });
    }

    // Validate that serial numbers in array match batteries
    const serialNumbers = req.body.serialNumber;
    const batteries = req.body.batteries;
    for (let i = 0; i < serialNumbers.length; i++) {
      if (serialNumbers[i] !== batteries[i].serialNumber) {
        return res.status(400).json({ error: `Serial number mismatch at index ${i}` });
      }
    }

    // Add id if not provided (for tables without auto-increment)
    const saleData = { ...req.body };
    if (!saleData.id) {
      saleData.id = Date.now(); // Temporary fix, better to make id serial in database
    }

    const { data, error } = await supabase.from('battery_sales').insert([saleData]).select();
    if (error) throw error;

    // Update battery statuses to 'Sold'
    for (const serialNum of req.body.serialNumber) {
      await supabase.from('batteries').update({ status: 'Sold' }).eq('serialNumber', serialNum);
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET battery sale by ID
app.get("/api/battery-sales/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('battery_sales').select('*').eq('id', req.params.id);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery sale not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update battery sale by ID
app.put("/api/battery-sales/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('battery_sales').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery sale not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE battery sale by ID
app.delete("/api/battery-sales/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('battery_sales').delete().eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Battery sale not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});