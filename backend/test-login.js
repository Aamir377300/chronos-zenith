require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const email = 'belalaamirkhan1@gmail.com';
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('+password');
  console.log('Found user:', !!user);
  if (user) {
    console.log('Password in DB:', user.password);
    const isMatch = await user.comparePassword('aamirkhan');
    console.log('Match result:', isMatch);
  } else {
    const allUsers = await User.find({});
    console.log('All user emails:', allUsers.map(u => u.email));
  }
  process.exit(0);
}

test();
