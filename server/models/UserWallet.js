import mongoose from 'mongoose';

const userWalletSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  balance: { type: String, default: "0" },
  lastTransactionAt: { type: Date, default: null },
  days_staked: { type: Number, default: 0 },
  amount_staked: { type: String, default: "0" },
  amount_withdrawn: { type: String, default: "0" },
  reward_amount: { type: String, default: "0" },
  referralCode: { type: String, unique: true, sparse: true },
  jreferal: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userWalletSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserWallet = mongoose.model('UserWallet', userWalletSchema);
