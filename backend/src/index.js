require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const seedAdmin = require('./db/seed-admin');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { startFarmerDailyEmailJob } = require('./jobs/farmer-daily-email.job');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow all origins with credentials
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
let cachedDb = null;
app.use(async (req, res, next) => {
  try {
    if (!cachedDb || mongoose.connection.readyState === 0) {
      cachedDb = await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(503).json({ message: 'Database connection failed. Please try again later.' });
  }
});


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/marketplace', require('./routes/marketplace.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/admin', require('./routes/admin-auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/soil-chatbot', require('./routes/soil-chatbot.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      startFarmerDailyEmailJob();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Startup failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = app;
