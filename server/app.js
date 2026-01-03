import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Import salary routes
import salaryRoutes from './routes/salary.routes.js';
app.use('/api/salary', salaryRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;
