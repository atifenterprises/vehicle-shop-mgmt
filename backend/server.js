const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Backend is running!");
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
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    collection: [20000, 2000, 25000, 2000, 2700, 300, 32000, 3000]
  });
});

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
    loanNumber: 'LN001',
    name: 'John Doe',
    mobile: '1234567890',
    loanStatus: 'Active',
    loanDetails: 'Loan amount: $10,000',
    status: 'Active',
  },
  {
    id: 2,
    loanNumber: 'LN002',
    name: 'Jane Smith',
    mobile: '0987654321',
    loanStatus: 'Active',
    loanDetails: 'Loan amount: $15,000',
    status: 'Active',
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

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});

