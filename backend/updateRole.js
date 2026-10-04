const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });


mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const res = await User.updateMany({}, { $set: { role: 'Admin' } });
  console.log('Updated users to Admin:', res);
  process.exit(0);
}).catch(console.error);
