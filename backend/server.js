const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


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
    const financeCustomers = customersData.filter(c => c.saleType === 'finance');
    const cashCustomers = customersData.filter(c => c.saleType === 'cash');
    const activeLoans = financeCustomers.filter(c => c.loanStatus === 'Active');
    const overduePayments = financeCustomers.filter(c => c.loanStatus === 'Overdue');

    const totalLoans = financeCustomers.length;
    const activeLoansCount = activeLoans.length;
    const overduePaymentsCount = overduePayments.length;

    // Total Collection: sum of emiAmount for active loans
    const totalCollection = activeLoans.reduce((sum, c) => sum + parseFloat(c.emiAmount.replace(/,/g, '')), 0);
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

// API endpoint for monthly collection trend (sample data with battery sales)
app.get("/api/dashboard/monthly-collection", async (req, res) => {
  try {
    const { data: batterySalesData, error: batterySalesError } = await supabase.from('battery_sales').select('*');
    if (batterySalesError) throw batterySalesError;

    // Aggregate battery sales by month
    const batteryMonthly = {};
    batterySalesData.forEach(sale => {
      const month = new Date(sale.saleDate).getMonth();
      batteryMonthly[month] = (batteryMonthly[month] || 0) + sale.totalAmount;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sep","Oct","Nov","Dec"];
    const collection = [20000, 2000, 25000, 2000, 2700, 300, 32000, 3000,4533,24541,7855,12345];

    // Add battery sales to collection
    const updatedCollection = collection.map((val, idx) => val + (batteryMonthly[idx] || 0));

    res.json({
      months,
      collection: updatedCollection
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for loan status distribution (sample data)
app.get("/api/dashboard/loan-status", (req, res) => {
  res.json({
    statuses: ["Active", "Closed", "Overdue"],
    counts: [18, 5, 3]
  });
});

// API endpoint for sales by type
app.get("/api/dashboard/sales-by-type", async (req, res) => {
  try {
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
    if (customersError) throw customersError;

    const financeCustomers = customersData.filter(c => c.saleType === 'finance');
    const cashCustomers = customersData.filter(c => c.saleType === 'cash');

    const financeCount = financeCustomers.length;
    const cashCount = cashCustomers.length;
    const financeAmount = financeCustomers.reduce((sum, c) => sum + parseFloat(c.totalAmount.replace(/,/g, '')), 0);
    const cashAmount = cashCustomers.reduce((sum, c) => sum + parseFloat(c.totalAmount.replace(/,/g, '')), 0);

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

    // From finance customers: use saleDate as payment date, assume paid
    customersData.filter(c => c.saleType === 'finance').forEach(c => {
      payments.push({
        customer: c.name,
        loanNo: c.loanNumber,
        amount: c.emiAmount,
        date: c.saleDate,
        status: 'Paid'
      });
    });

    // From battery sales
    batterySalesData.forEach(b => {
      payments.push({
        customer: b.customerName,
        loanNo: '',
        amount: b.totalAmount,
        date: b.saleDate,
        status: 'Paid'
      });
    });

    // Sort by date descending
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to 10
    res.json(payments.slice(0, 10));
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

    // Finance customers with overdue status
    customersData.filter(c => c.saleType === 'finance' && c.loanStatus === 'Overdue').forEach(c => {
      dues.push({
        customer: c.name,
        loanNo: c.loanNumber,
        amount: c.emiAmount,
        dueDate: c.nextEmiDate
      });
    });

    res.json(dues);
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

// GET customers
app.get("/api/customers", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*');
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
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*').eq('id', req.params.id);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = data[0];

    // Calculate nextEmiDate as the date of the first unpaid EMI (status 'due' or 'overdue')
    let nextEmiDate = '-';
    if (customer.emiSchedule && customer.emiSchedule.length > 0) {
      const firstUnpaidEmi = customer.emiSchedule.find(emi => emi.status !== 'paid');
      if (firstUnpaidEmi) {
        nextEmiDate = firstUnpaidEmi.date;
      }
    }

    // Update loanStatus based on EMI statuses
    let loanStatus = 'Closed';
    if (customer.emiSchedule && customer.emiSchedule.length > 0) {
      const hasOverdue = customer.emiSchedule.some(emi => emi.status === 'overdue');
      const hasDue = customer.emiSchedule.some(emi => emi.status === 'due');
      if (hasOverdue) {
        loanStatus = 'Overdue';
      } else if (hasDue) {
        loanStatus = 'Active';
      }
    }

    const customerWithCalculatedFields = {
      ...customer,
      nextEmiDate,
      loanStatus
    };

    res.json(customerWithCalculatedFields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer by ID
app.put("/api/customers/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer by ID
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').delete().eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new vehicle
app.post("/api/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET vehicle by ID
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', req.params.id);
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle by ID
app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vehicle by ID
app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicles').delete().eq('id', req.params.id).select();
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
    const newEnquiry = { ...req.body, status: req.body.status || 'New', createdAt: new Date().toISOString() };
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

// Helper function to map database fields to camelCase
const mapBatteryToCamelCase = (battery) => ({
  id: battery.id,
  serialNumber: battery.serialNumber,
  batteryName: battery.batteryName,
  batteryType: battery.batteryType,
  price: battery.price,
  warrantyMonths: battery.warrantyMonths,
  purchaseDate: battery.purchaseDate,
  status: battery.status,
  created_at: battery.created_at,
  updated_at: battery.updated_at
});

// Helper function to map camelCase to database fields
const mapBatteryToDatabase = (battery) => ({
  serialNumber: battery.serialNumber,
  batteryName: battery.batteryName,
  batteryType: battery.batteryType,
  price: battery.price,
  warrantyMonths: battery.warrantyMonths,
  purchaseDate: battery.purchaseDate,
  status: battery.status
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
    const { data, error } = await supabase.from('battery_sales').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET battery sale by by Serial Number
app.get("/api/battery-sales/:serialNumber", async (req, res) => {
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
app.put("/api/battery-sales/:serialNumber", async (req, res) => {
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
app.delete("/api/battery-sales/:serialNumber", async (req, res) => {
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

