import mongoose from 'mongoose';

const stakingRecordSchema = new mongoose.Schema({
  uid: { 
    type: mongoose.Schema.Types.ObjectId, // Refers to UserWallet _id
    ref: 'UserWallet',
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  staking_period: { 
    type: Number, 
    required: true 
  },
  start_date: { 
    type: Date, 
    required: true 
  },
  end_date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true }); // createdAt and updatedAt auto-managed

const StakingRecord = mongoose.model('StakingRecord', stakingRecordSchema);
export { StakingRecord };
