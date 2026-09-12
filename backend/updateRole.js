const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const res = await User.updateMany({}, { $set: { role: 'Admin' } });
  console.log('Updated users to Admin:', res);
  process.exit(0);
}).catch(console.error);
