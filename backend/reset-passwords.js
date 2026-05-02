require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const users = await User.find({});
  for (const user of users) {
    // Generate new hash
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('aamirkhan', salt);
    
    // Update directly to avoid pre-save hooks acting weird if any
    await User.updateOne({ _id: user._id }, { $set: { password: hash } });
    console.log(`Reset password for ${user.email} to 'aamirkhan'`);
  }
  
  console.log('All passwords reset.');
  process.exit(0);
}

reset();
