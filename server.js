require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Database Connection
connectDB();

// Routes
const graphRoutes = require('./routes/graph');
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use('/api/graph-value', graphRoutes);

// ---------------- Serve Static Frontend ----------------
app.use(express.static(path.join(__dirname, 'public')));

// Optional: Direct routes for specific pages
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Catch-all fallback for other routes (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test Route
app.get("/", (req, res) => {
    res.send("Server is working!");
  });
  
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
