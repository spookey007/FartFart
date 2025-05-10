import { connectDB } from '../../lib/mongodb';
import Referral from '../../models/Referral';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { walletAddress, referralCode, hasSkipped } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Check if user already exists
    const existingUser = await Referral.findOne({ walletAddress: walletAddressA });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Referral already processed for this wallet' });
    }

    // Create new referral entry
    const referral = new Referral({
      walletAddress: walletAddressA,
      referralCode: referralCode || undefined,
      hasSkipped: hasSkipped || false,
    });

    await referral.save();

    return res.status(200).json({ message: 'Referral processed successfully' });
  } catch (error) {
    console.error('Referral processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 