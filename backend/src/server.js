// const express = require('express');
// const cors = require('cors');
// const pool = require('./config/db');

// // routes
// const authRoutes = require('./routes/auth.routes');
// const tenantRoutes = require('./routes/tenants.routes');
// const userRoutes = require('./routes/users.routes');
// const projectRoutes = require('./routes/projects.routes');
// const taskRoutes = require('./routes/tasks.routes');

// const app = express();

// app.use(cors());
// app.use(express.json());

// /**
//  * ✅ MANDATORY HEALTH CHECK
//  * Evaluator depends on this
//  */
// app.get('/api/health', async (req, res) => {
//   try {
//     await pool.query('SELECT 1');
//     res.status(200).json({
//       status: 'ok',
//       database: 'connected'
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       database: 'disconnected'
//     });
//   }
// });

// /**
//  * API ROUTES
//  */
// app.use('/api', authRoutes);
// app.use('/api', tenantRoutes);
// app.use('/api', userRoutes);
// app.use('/api', projectRoutes);
// app.use('/api', taskRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Backend server running on port ${PORT}`);
// });

////-----------------------------------------------

// const app = require('./app');

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Backend server running on port ${PORT}`);
// });

//--working

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
