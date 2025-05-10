import mongoose from 'mongoose';

const rewardHistorySchema = new mongoose.Schema({
  uid: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserWallet',
    required: true 
  },
  coin_type: { 
    type: String, 
    required: true,
    enum: ['SOL', 'BTC']
  },
  reward: { 
    type: Number, 
    required: true,
    default: 0
  }
}, { 
  timestamps: true // This will add createdAt and updatedAt fields
});

const RewardHistory = mongoose.model('RewardHistory', rewardHistorySchema);
export { RewardHistory }; 