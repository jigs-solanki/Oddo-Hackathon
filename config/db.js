const mongoose = require('mongoose');


function maskUri(uri) {
  try {
    const u = new URL(uri.replace('mongodb://', 'http://').replace('mongodb+srv://', 'http://'));
    if (u.username) u.username = '*****';
    if (u.password) u.password = '*****';
  
    const prefix = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
    return prefix + u.host + u.pathname + (u.search || '');
  } catch (e) {
    return uri;
  }
}

const connectDB = async ({ retries = 4, delayMs = 1000 } = {}) => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stockmaster';

  try { mongoose.set('strictQuery', false); } catch (e) {}

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Connecting to MongoDB: ${maskUri(uri)}`);
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt + 1} failed:`);
      console.error(err && err.stack ? err.stack : err);
      if (attempt < retries) {
        const wait = delayMs * Math.pow(2, attempt); 
        console.log(`Retrying in ${wait}ms...`);
        
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      console.error('All MongoDB connection attempts failed.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
