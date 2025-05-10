import mongoose from 'mongoose';

const depositRecordSchema = new mongoose.Schema({
  uid: { 
    type: mongoose.Schema.Types.ObjectId, // Refers to UserWallet _id
    ref: 'UserWallet',
    required: true 
  },
  amount: { type: Number, required: true }, // Changed to Number type
  coin_type: { type: String, required: true },
}, { timestamps: true }); // createdAt and updatedAt auto-managed

const DepositRecord = mongoose.model('DepositRecord', depositRecordSchema);
export { DepositRecord }; 