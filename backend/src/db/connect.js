const mongoose = require('mongoose');
const config = require('../config');

// In serverless, global variables persist between requests
let cachedConnection = null;

const connectDB = async () => {
  // If we have a cached connection, check if it's still alive
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  // If we are currently connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('Already connecting to MongoDB, waiting...');
    // We don't want to start another connection, but we also need to wait.
    // However, mongoose handles this internally if we call connect again.
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, sometimes helps with Atlas connectivity
    });
    
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Reset cached connection on error
    cachedConnection = null;
    throw error;
  }
};

module.exports = connectDB;
