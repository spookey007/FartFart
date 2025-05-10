import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { UserWallet } from './models/UserWallet.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Generate unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Wallet connection endpoint
app.post('/api/wallet/connect', async (req, res) => {
  try {
    const { 
      walletAddress,
      referralCode 
    } = req.body;

    // Check if user already exists in both MongoDB and Prisma
    let user = await UserWallet.findOne({ walletAddress });
    let prismaUser = await prisma.userWallet.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      // Generate a unique referral code for the new user
      const userReferralCode = generateReferralCode();
      
      // Create new user in MongoDB
      user = new UserWallet({
        walletAddress,
        referralCode: userReferralCode, // User's own referral code
        jreferal: referralCode || null, // Referral code used by user
      });

      await user.save();

      // Create new user in Prisma
      prismaUser = await prisma.userWallet.create({
        data: {
          walletAddress,
          referralCode: userReferralCode,
          jreferal: referralCode || null,
        }
      });

      // Create referral record in Prisma
      await prisma.referral.create({
        data: {
          walletAddress,
          referralCode: userReferralCode,
          hasSkipped: !referralCode
        }
      });

      return res.status(200).json({
        message: 'Wallet connected successfully',
        isNewUser: true,
        referralCode: userReferralCode,
        hasSkippedReferral: !referralCode,
        userReferralCode: userReferralCode,
        jreferal: null
      });
    }

    // Check referral status in Prisma
    const referralRecord = await prisma.referral.findUnique({
      where: { walletAddress }
    });

    // If user exists, check if they need to provide referral code
    if (!user.jreferal || user.jreferal === "") {
      return res.status(200).json({
        message: 'Wallet already connected',
        isNewUser: false,
        needsReferral: true,
        hasSkippedReferral: false,
        userReferralCode: user.referralCode,
        jreferal: user.jreferal
      });
    }

    return res.status(200).json({
      message: 'Wallet already connected',
      isNewUser: false,
      needsReferral: false,
      referralCode: user.referralCode,
      hasSkippedReferral: referralRecord?.hasSkipped || false,
      userReferralCode: user.referralCode,
      jreferal: user.jreferal
    });

  } catch (error) {
    console.error('Wallet connection error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add validation endpoint
app.post('/api/wallet/validate-referral', async (req, res) => {
  try {
    const { referralCode, walletAddress } = req.body;
    
    // Check if referral code exists
    const referrer = await UserWallet.findOne({ referralCode });
    
    if (!referrer) {
      return res.json({ 
        valid: false, 
        message: "Invalid referral code" 
      });
    }

    // Check if user is trying to use their own referral code
    if (referrer.walletAddress === walletAddress) {
      return res.json({ 
        valid: false, 
        message: "You cannot use your own referral code" 
      });
    }

    // Check if user already has a referral
    const user = await UserWallet.findOne({ walletAddress });
    console.log("User jreferal:", user.jreferal);
    if (user && user.jreferal && user.jreferal.trim() !== "") {
      return res.json({ 
        valid: false, 
        message: "You already have a referral code" 
      });
    }

    res.json({ 
      valid: true, 
      message: "Valid referral code" 
    });
  } catch (error) {
    console.error('Error validating referral:', error);
    res.status(500).json({ error: 'Failed to validate referral' });
  }
});

// Update referral submission endpoint
app.post('/api/wallet/referral', async (req, res) => {
  try {
    const { walletAddress, referralCode } = req.body;

    // First check if the referral code exists
    const referrer = await prisma.userWallet.findFirst({
      where: {
        referralCode: referralCode
      }
    });

    if (!referrer) {
      return res.status(400).json({
        valid: false,
        message: "Invalid referral code"
      });
    }

    // Check if user is trying to use their own referral code
    if (referrer.walletAddress === walletAddress) {
      return res.status(400).json({
        valid: false,
        message: "You cannot use your own referral code"
      });
    }

    // Check if user already has a referral code
    const existingUser = await UserWallet.findOne({ walletAddress });
    if (existingUser && existingUser.jreferal && existingUser.jreferal.trim() !== "") {
      return res.status(400).json({
        valid: false,
        message: "You already have a referral code"
      });
    }

    // Update the user's wallet with the referral code
    const updatedUser = await prisma.userWallet.upsert({
      where: {
        walletAddress: walletAddress
      },
      update: {
        jreferal: referralCode
      },
      create: {
        walletAddress: walletAddress,
        jreferal: referralCode,
        balance: "0",
        amount_staked: "0",
        days_staked: 0,
        amount_withdrawn: "0",
        reward_amount: "0",
        isAdmin: false
      }
    });

    // Also update MongoDB
    await UserWallet.findOneAndUpdate(
      { walletAddress },
      { 
        $set: { 
          jreferal: referralCode,
          hasSkippedReferral: false
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      valid: true,
      message: "Referral code submitted successfully",
      referralCode: updatedUser.referralCode
    });
  } catch (error) {
    console.error("Error submitting referral:", error);
    res.status(500).json({
      valid: false,
      message: "Failed to submit referral code"
    });
  }
});

// Skip referral endpoint
app.post('/api/wallet/skip-referral', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Update in MongoDB
    const user = await UserWallet.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.jreferal) {
      return res.status(400).json({ message: 'Referral already processed' });
    }

    // Mark user as having skipped referral in MongoDB
    user.jreferal = null;
    await user.save();

    // Update in Prisma
    await prisma.userWallet.update({
      where: { walletAddress },
      data: { jreferal: null }
    });

    // Create or update referral record
    const existingReferral = await prisma.referral.findUnique({
      where: { walletAddress }
    });

    if (existingReferral) {
      await prisma.referral.update({
        where: { walletAddress },
        data: { hasSkipped: true }
      });
    } else {
      await prisma.referral.create({
        data: {
          walletAddress,
          hasSkipped: true
        }
      });
    }

    return res.status(200).json({
      message: 'Referral skipped successfully',
      referralCode: user.referralCode
    });

  } catch (error) {
    console.error('Skip referral error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get stake info endpoint
app.get('/api/wallet/stake-info', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const user = await UserWallet.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      amount_staked: user.amount_staked,
      days_staked: user.days_staked,
      reward_amount: user.reward_amount
    });

  } catch (error) {
    console.error('Stake info error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add stake update endpoint
app.post('/api/wallet/stake', async (req, res) => {
  try {
    const { walletAddress, amount, txHash } = req.body;
    
    if (!txHash) {
      return res.status(400).json({ 
        error: 'Transaction hash is required' 
      });
    }
    
    // Convert amount to number
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
      return res.status(400).json({ 
        error: 'Invalid amount provided' 
      });
    }

    // Get current stake amount
    const currentUser = await UserWallet.findOne({ walletAddress });
    const currentStake = parseFloat(currentUser?.amount_staked || "0");
    const newStake = currentStake + numericAmount;
    
    // Create staking record
    await prisma.stakingRecord.create({
      data: {
        walletAddress,
        amount: amount.toString(),
        txHash,
        status: "pending"
      }
    });
    
    // Update stake in MongoDB
    const userWallet = await UserWallet.findOneAndUpdate(
      { walletAddress },
      { 
        $set: { 
          amount_staked: newStake.toString(),
          lastTransactionAt: new Date() 
        }
      },
      { new: true }
    );

    // Update stake in Prisma
    await prisma.userWallet.upsert({
      where: { walletAddress },
      update: {
        amount_staked: newStake.toString(),
        lastTransactionAt: new Date()
      },
      create: {
        walletAddress,
        amount_staked: newStake.toString(),
        lastTransactionAt: new Date(),
        balance: "0",
        days_staked: 0,
        amount_withdrawn: "0",
        reward_amount: "0",
        isAdmin: false
      }
    });

    // Update staking record status to completed
    await prisma.stakingRecord.update({
      where: { txHash },
      data: { status: "completed" }
    });

    res.json({ success: true, userWallet });
  } catch (error) {
    console.error('Error updating stake:', error);
    
    // If there's an error, update the staking record status to failed
    if (req.body.txHash) {
      try {
        await prisma.stakingRecord.update({
          where: { txHash: req.body.txHash },
          data: { status: "failed" }
        });
      } catch (updateError) {
        console.error('Error updating staking record status:', updateError);
      }
    }
    
    res.status(500).json({ error: 'Failed to update stake' });
  }
});

// Update stake info endpoint to use lastTransactionAt
app.get('/api/wallet/stake-info', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    // Get stake info from MongoDB
    const userWallet = await UserWallet.findOne({ walletAddress });
    
    if (!userWallet) {
      return res.json({
        amount_staked: 0,
        days_staked: 0,
        reward_amount: 0
      });
    }

    // Calculate days staked using lastTransactionAt
    const lastStakeDate = userWallet.lastTransactionAt || new Date();
    const daysStaked = Math.floor((new Date() - lastStakeDate) / (1000 * 60 * 60 * 24));
    
    // Calculate reward (example: 5% annual return)
    const annualReturn = 0.05;
    const dailyReturn = annualReturn / 365;
    const rewardAmount = parseFloat(userWallet.amount_staked) * dailyReturn * daysStaked;

    res.json({
      amount_staked: userWallet.amount_staked,
      days_staked: daysStaked,
      reward_amount: rewardAmount.toString()
    });
  } catch (error) {
    console.error('Error fetching stake info:', error);
    res.status(500).json({ error: 'Failed to fetch stake info' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 