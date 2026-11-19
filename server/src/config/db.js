const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  const conn = await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
