const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const tenantRoutes = require('./routes/tenants.routes');
const userRoutes = require('./routes/users.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', tenantRoutes);
app.use('/api', userRoutes);

module.exports = app;
