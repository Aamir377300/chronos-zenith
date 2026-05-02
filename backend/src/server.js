require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Chronos Zenith API running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  });
});
