import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinicflow');
  await User.deleteMany({});

  await User.create([
    { name: 'Admin User', email: 'admin@clinic.com', password: 'admin123', role: 'admin' },
    { name: 'Dr. Smith', email: 'dr.smith@clinic.com', password: 'doctor123', role: 'doctor' },
    { name: 'Dr. Jones', email: 'dr.jones@clinic.com', password: 'doctor123', role: 'doctor' },
  ]);

  console.log('Seeded: admin@clinic.com / admin123');
  console.log('Seeded: dr.smith@clinic.com / doctor123');
  console.log('Seeded: dr.jones@clinic.com / doctor123');
  await mongoose.disconnect();
};

seed().catch(console.error);
