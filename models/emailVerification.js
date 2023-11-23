import mongoose, { Schema } from 'mongoose';


const emailVerificationSchema = Schema({
  userID: String,
  token: String,
  createdAt: Date,
  expiresAt: Date,
});

const Verification = mongoose.model("Verification", emailVerificationSchema);

export default Verification;