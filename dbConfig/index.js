import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection = async () => {
  const uri = process.env.MONGODB_URL;
  try {
    const connection = await mongoose.connect(uri);
    console.log("Db connected successfully");
  } catch (error) {
    console.log("DB Error: " + error);
  }
};

export default dbConnection;