import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config/index.js';
import { initDatabase } from './src/db/database.js';
import authRoutes from './src/routes/authRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & ensure connection
initDatabase();

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow frontend origin
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded signature images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Expense Voucher Management System API'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Voucher Management API Server running on port ${config.port}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`📁 Uploads served at: http://localhost:${config.port}/uploads`);
  console.log(`=======================================================`);
});

export default app;
