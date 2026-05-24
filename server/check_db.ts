import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { UserModel } from './src/Base/Base_Model/user.model';

dotenv.config();

async function checkDB() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp';
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    
    const count = await UserModel.countDocuments();
    console.log("Total users:", count);
    
    const users = await UserModel.find().limit(5);
    users.forEach(u => console.log(`- ${u.email} (${u.role})` || 'No email'));
    
    await mongoose.disconnect();
}

checkDB().catch(console.error);
