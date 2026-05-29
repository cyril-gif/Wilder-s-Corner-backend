import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'cyrillantam@gmail.com'; // change this
  const result = await User.updateOne({ email }, { role: 'admin' });
  console.log(result.modifiedCount ? 'Admin updated' : 'User not found');
  process.exit();
}

makeAdmin();
