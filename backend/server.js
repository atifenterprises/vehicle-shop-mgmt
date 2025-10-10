require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// API endpoint to check session
app.get('/api/session', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ isAuthenticated: false, message: 'No token provided' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid or expired token' });
    }
    res.json({ isAuthenticated: true, user: data.user });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ isAuthenticated: false, message: 'Internal server error' });
  }
});

// API endpoint for Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    //console.log('Data :', { data });
    if (error) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    res.json({ message: 'Login Successful', user: data.user, session: data.session });
  } catch (error) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

});

// Forgot Password Endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/resetpassword',
    });
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

});

// Exchange code Endpoint
app.post('/api/exchange', async (req, res) => {
  const { code } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession({ code });
    if (error) return res.status(401).json({ message: error.message });
    res.json({ session: data.session });
  } catch (err) {
    console.error('Exchange code error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
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
    res.status(500).json({ message: 'Internal server error.' });
  }

});


// API endpoint for Sign Up
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body
  console.log('Sign up data: ', { email, password, name })
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/verified',
        data: { display_name: name }
      }

    });
    console.log('Sign up data: ', { data })
    if (error) {
      console.error('Sign up error:', error);
      if (error.code === 'user_already_exists') {
        return res.status(400).json({ message: 'Email already registered.' });
      }
      return res.status(400).json({ message: error.message });
    }

    // Check for pending confirmation
    if (data.user?.confirmation_sent_at || !data.user?.aud.includes('authenticated')) {
      return res.status(202).json({
        message: 'Signup initiated. Please verify your email to complete registration.',
        emailSentTo: email
      });
    }
    // Update user metadata with display name

    // const userId = data?.user?.id;
    // if (!userId) {
    //   return res.status(202).json({
    //     message: 'Signup initiated. Please verify your email to complete registration.',
    //   });
    // }

    // const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId,
    //   {
    //     user_metadata: { display_name: name },
    //   }
    // );
    // if (updateError) {
    //   console.error('Failed to update display name:', updateError.message);
    //   return res.status(500).json({ message: 'Login successful, but failed to update display name.' });
    // }

    res.status(201).json({
      message: 'User registered successfully!',
      user: data.user
    });
  }
  catch (err) {
    console.error('Unexpected error in signup:', err);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }


});

// API endpoint for Sign Out
app.post('/api/signout', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) throw error;
    res.status(200).json({ message: 'Signed out successfully' });
  } catch (err) {
    console.error('Sign out error:', error);
    res.status(400).json({ message: error.message });
  }
});

// API endpoint for dashboard metrics
app.get("/api/dashboard/metrics", (req, res) => {
  res.json({
    totalLoans: 24,
    activeLoans: 18,
    overduePayments: 3,
    totalCollection: 245800,
    totalCollectionFormatted: "₹2,45,800",
    totalLoansChange: "+12%",
    activeLoansRate: "75%",
    overduePaymentsNote: "Requires attention",
    totalCollectionChange: "+8%"
  });
});

// API endpoint for monthly collection trend (sample data)
app.get("/api/dashboard/monthly-collection", (req, res) => {
  res.json({
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    collection: [20000, 2000, 25000, 2000, 2700, 300, 32000, 3000, 4533, 24541, 7855, 12345]
  });
});


// API endpoint for customer list
app.get("/api/getcustomer", async (req, res) => {
  try {
    const { data, error } = await supabase.from('customer').select()
    console.log('Customer:', { data })
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})

//API for customer Insert record
app.post("/api/insertcustomer", async (req, res) => {
  const { name, father_name, mobile_no, address } = req.body
  try {
    const { data, error } = await supabase
      .from('customer')
      .insert([
        { name: name, father_name: father_name, mobile_no: mobile_no, address: address },
      ])
      .select()
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})


// API endpoint for vehicle list
app.get("/api/getVehicles", async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicle').select()
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})

// API endpoint for vehicle by Id
app.get("/api/getVehicle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('vehicle').select('*').eq('vehicle_id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Vehicle Not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})

//API endpoint to update Vehicle
app.put("/api/updateVehicle/:id", async (req, res) => {
  const { id } = req.params;
  const {
    vehicle_id,
    vehicle_number,
    chasis_number,
    make,
    model,
    color,
    battery_number,
    ex_showroom,
    sold_date,
    status,
  } = req.body;
  const toolkit = req.body.tool_kit ?? 'Available';
  console.log('vehicle id, id:', { vehicle_id, id: parseInt(id) });

  // Basic validation
  if (!vehicle_id || vehicle_id !== parseInt(id)) {
    return res.status(400).json({ error: 'Invalid or missing vehicle_id' });
  }

  console.log('Update Vehicle Request:', {
    vehicle_number,
    chasis_number,
    make: make || null,
    model: model || null,
    color: color || null,
    tool_kit: toolkit || 'Available',
    battery_number: battery_number || null,
    ex_showroom: ex_showroom ? parseFloat(ex_showroom) : null,
    sold_date: sold_date || null,
    status: status || 'Available',
  });

  try {
    const { data, error } = await supabase
      .from('vehicle')
      .update({
        vehicle_number,
        chasis_number,
        make: make || null,
        model: model || null,
        color: color || null,
        tool_kit: toolkit || 'Available',
        battery_number: battery_number || null,
        ex_showroom: ex_showroom ? parseFloat(ex_showroom) : null,
        sold_date: sold_date || null,
        status: status || 'Available',
      })
      .eq('vehicle_id', parseInt(id))
      .select()
      .single();
    //console.log('Supabase returned data:', { data });
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update vehicle', details: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Return updated vehicle
    res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// API endpoint for insert vehicle
app.post("/api/insertVehicles", async (req, res) => {

  const { chasis_number, vehicle_number, status, color, model, year, ex_showroom, sold_date } = req.body;
  try {
    const { data, error } = await supabase
      .from('vehicle')
      .insert([
        {
          chasis_number: chasis_number, vehicle_number: vehicle_number, status: status, color: color, model: model, year: year,
          ex_showroom: ex_showroom, sold_date: sold_date || null
        },
      ])
      .select()

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }


})

// API endpoint for insert vehicle
app.delete("/api/deleteVehicles/:vehicle_id", async (req, res) => {
  const { vehicle_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('vehicle')
      .delete()
      .eq('vehicle_id', parseInt(vehicle_id))
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete vehicle', details: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle deleted successfully', data });

  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})

// API endpoint to handle form submission
app.post('/api/sales', async (req, res) => {
  try {
    const formData = req.body;

    // Insert customer
    const { data: customerData, error: customerError } = await supabase
      .from('customer')
      .insert({
        //date: formData.date,
        name: formData.name,
        father_name: formData.fatherName,
        mobile_no: formData.mobileNo,
        //ckyc_no: formData.ckycNo,
        address: formData.address
      })
      .select()
      .single();

    if (customerError) {
      throw new Error(`Customer insertion failed: ${customerError.message}`);
    }

    const customerId = customerData.customer_id;
    if (!customerId) {
      throw new Error('Customer ID not generated');
    }
    console.log('Customer inserted with ID:', customerId);

    // Insert vehicle
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicle')
      .insert({
        vehicle_number: formData.vehicleNumber,
        //engine_number: formData.engineNumber,
        year: formData.make,
        model: formData.model,
        chasis_number: formData.chassisNumber,
        // regn_number: formData.regnNumber,
        ex_showroom: parseFloat(formData.exShowroomPrice),
        //customer_id: customerId
      })
      .select()
      .single();

    if (vehicleError) {
      throw new Error(`Vehicle insertion failed: ${vehicleError.message}`);
    }

    const vehicleId = vehicleData.vehicle_id;

    if (!vehicleId) {
      throw new Error('Vehicle ID not generated');
    }
    console.log('Vehicle inserted with ID:', vehicleId);
    // Prepare sale data
    const saleData = {
      customer_id: customerId,
      vehicle_id: vehicleId,
      sale_type: formData.saleType,
      sale_date: formData.saleDate,
      total_amount: parseFloat(formData.totalAmount)
    };

    // Add sale-type-specific fields
    if (formData.saleType === 'Cash') {
      saleData.total_deposite = parseFloat(formData.paidAmount);
      //saleData.remaining_amount = parseFloat(formData.remainingAmount);
      //saleData.last_payment_date = formData.lastPaymentDate;
    } else if (formData.saleType === 'Finance') {
      saleData.loan_number = formData.loanNumber;
      saleData.down_payment = parseFloat(formData.downPayment);
      //saleData.loan_amount = parseFloat(formData.loanAmount);
      //saleData.tenure = parseInt(formData.tenure);
      //saleData.interest_rate = parseFloat(formData.interestRate);
      //saleData.first_emi_date = formData.firstEmiDate;
      //saleData.emi_amount = parseFloat(formData.emiAmount);
      // saleData.emi_schedule = formData.emiSchedule.map(emi => ({
      //   date: emi.date,
      //   amount: parseFloat(emi.amount)
      // }));
      //***NOTE: Generate EMI is not working since it is being called at current setp 2 before assigning values to required fields.
    }

    // Insert sale
    const { data: saleResult, error: saleError } = await supabase
      .from('sale')
      .insert(saleData)
      .select()
      .single();

    if (saleError) {
      throw new Error(`Sale insertion failed: ${saleError.message}`);
    }

    // Return success response
    res.status(201).json({
      message: 'Records inserted successfully',
      customer: customerData,
      vehicle: vehicleData,
      sale: saleResult
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


// API endpoint for services
app.get("/api/getservice", async (req, res) => {
  const { data, error } = await supabase.from('customer').select()
  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);

})


// API endpoint for loan status distribution (sample data)
app.get("/api/dashboard/loan-status", (req, res) => {
  res.json({
    statuses: ["Active", "Closed", "Overdue"],
    counts: [18, 5, 3]
  });
});

const customers = [
  {
    id: 1,
    name: 'John Doe',
    mobile: '1234567890',
    loanNumber: 'LN001',
    loanAmount: '1,00,000',
    vehicleNumber: 'KA01AB1234',
    loanStatus: 'Active',
    nextEmiDate: '2024-10-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    mobile: '0987654321',
    loanNumber: 'LN002',
    loanAmount: '2,50,000',
    vehicleNumber: 'KA02CD5678',
    loanStatus: 'Active',
    nextEmiDate: '2024-10-20',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    mobile: '1122334455',
    loanNumber: 'LN003',
    loanAmount: '5,00,000',
    vehicleNumber: 'KA03EF9012',
    loanStatus: 'Closed',
    nextEmiDate: '-',
  },
];

// GET customers
app.get("/api/customers", (req, res) => {
  res.json(customers);
});

// POST add new customer
app.post("/api/customers", (req, res) => {
  const newCustomer = req.body;
  newCustomer.id = customers.length + 1;
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// GET customer by ID
app.get("/api/customers/:id", (req, res) => {
  const customerId = parseInt(req.params.id);
  const customer = customers.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(customer);
});

// PUT update customer by ID
app.put("/api/customers/:id", (req, res) => {
  const customerId = parseInt(req.params.id);
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  customers[customerIndex] = { ...customers[customerIndex], ...req.body };
  res.json(customers[customerIndex]);
});

// DELETE customer by ID
app.delete("/api/customers/:id", (req, res) => {
  const customerId = parseInt(req.params.id);
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const deletedCustomer = customers.splice(customerIndex, 1);
  res.json(deletedCustomer[0]);
});


// Sample customer enquiries data
const customerEnquiries = [
  {
    id: 1,
    customerName: 'Rajesh Kumar',
    customerAddress: '123 MG Road, Bangalore, Karnataka - 560001',
    mobile: '9876543210',
    interestedVehicle: 'Honda City 2024, Silver Color, Petrol Variant',
    estimateDate: '2024-10-25',
    status: 'New',
    createdAt: '2024-10-15T10:30:00Z'
  },
  {
    id: 2,
    customerName: 'Priya Sharma',
    customerAddress: '456 Brigade Road, Bangalore, Karnataka - 560025',
    mobile: '8765432109',
    interestedVehicle: 'Maruti Suzuki Swift, Red Color, Manual Transmission',
    estimateDate: '2024-10-28',
    status: 'In Progress',
    createdAt: '2024-10-14T14:20:00Z'
  },
  {
    id: 3,
    customerName: 'Amit Patel',
    customerAddress: '789 Residency Road, Bangalore, Karnataka - 560025',
    mobile: '7654321098',
    interestedVehicle: 'Hyundai Creta, White Color, Diesel Variant',
    estimateDate: '2024-10-20',
    status: 'Completed',
    createdAt: '2024-10-12T09:15:00Z'
  },
  {
    id: 4,
    customerName: 'Sneha Reddy',
    customerAddress: '321 Koramangala, Bangalore, Karnataka - 560034',
    mobile: '6543210987',
    interestedVehicle: 'Toyota Innova Crysta, Grey Color, Automatic',
    estimateDate: '2024-10-30',
    status: 'New',
    createdAt: '2024-10-16T16:45:00Z'
  },
  {
    id: 5,
    customerName: 'Vikram Singh',
    customerAddress: '654 JP Nagar, Bangalore, Karnataka - 560078',
    mobile: '5432109876',
    interestedVehicle: 'Mahindra XUV700, Black Color, Diesel Variant',
    estimateDate: '2024-10-22',
    status: 'In Progress',
    createdAt: '2024-10-13T11:30:00Z'
  }
];


// API endpoint for customer enquiry
app.get('/api/customer-enquiries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_enquiry')
      .select('*')

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});
//API endpoint for inserting new customer enquiry
app.post("/api/customer-enquiries", async (req, res) => {
  const { customerName, customerAddress, mobile, interestedVehicle, estimateDate, status } = req.body;
  console.log('Request Body: ',{req})
  try {
    const { data, error } = await supabase
      .from('customer_enquiry')
      .insert([
        {
          customer_name: customerName, address: customerAddress, mobile_no: mobile, interested_vehicle: interestedVehicle
          , estimate_date: estimateDate || null, status: status,
        },
      ])
      .select()
      console.log('Enquiry Data: ',{data})
      console.log('Enquiry Error: ',{error})
    if (error) return res.status(400).json({ error: error.message });   
    res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

//API endpoint for customer enquiry by ID
app.get("/api/customer-enquiries/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('customer_enquiry').select('*').eq('cust_enquiry_id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Custumor Enquiry Not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

//API endpoint for customer enquiry update by ID
app.put("/api/customer-enquiries/:id", async (req, res) => {
  const { id } = req.params;
  const { customerName, customerAddress, mobile, interestedVehicle, estimateDate, status } = req.body;
  try {
    const { data, error } = await supabase
      .from('customer_enquiry')
      .update({
        customer_name:customerName,
        address:customerAddress,
        mobile_no:mobile,
        interested_vehicle:interestedVehicle,
        estimate_date: estimateDate || null,
        status: status || 'New',
      })
      .eq('cust_enquiry_id', parseInt(id))
      .select()
      .single();
    //console.log('Supabase returned data:', { data });
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update Customer Enquiry', details: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Customer Enquiry not found' });
    }

    // Return updated Customer Enquiry
    res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// API endpoint for DELETE customer enquiry by ID
app.delete("/api/customer-enquiries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('customer_enquiry')
      .delete()
      .eq('cust_enquiry_id', parseInt(id))
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete Customer Enquiry', details: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Customer Enquiry not found' });
    }
    res.status(200).json({ message: 'Customer Enquiry deleted successfully', data });

  } catch (error) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }

})

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});

