import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

// === CONFIG ===
const NETWORK = "mainnet"; // or "devnet"
const SOLANA_RPC =
  NETWORK === "mainnet"
    ? "https://mainnet.helius-rpc.com/?api-key=c585dc98-220f-414d-845d-856c55daecb3"
    : "https://api.devnet.solana.com";

const TOKEN_MINT_ADDRESS = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump";
const RECIPIENT_ADDRESS = "AcAACQ1T37u18vV6zPVPLTqJba3THWzrMSL77wuoCKGW";
const DECIMALS = 6;

// Format number with commas and 2 decimal places
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const TokenTransfer = ({ sender }) => {
  const [transactionHash, setTransactionHash] = useState(null);
  const [status, setStatus] = useState(null);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [stakeInfo, setStakeInfo] = useState({
    amount_staked: 0,
    reward_amount: 0
  });
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasSkippedReferral, setHasSkippedReferral] = useState(false);

  // useEffect(() => {
  //   if (sender) {
  //     checkUserStatus();
  //   }
  // }, [sender]);

  // const checkUserStatus = async () => {
  //   try {
  //     const response = await fetch(`/api/wallet/connect?walletAddress=${sender}`);
  //     const data = await response.json();
      
  //     setIsNewUser(data.isNewUser);
  //     setHasSkippedReferral(data.hasSkippedReferral);
      
  //     if (data.isNewUser && !data.hasSkippedReferral) {
  //       setShowReferralInput(true);
  //     } else if (data.hasSkippedReferral || data.needsReferral === false) {
  //       setShowReferralInput(false);
  //       fetchStakeInfo();
  //     }
  //   } catch (error) {
  //     console.error("Error checking user status:", error);
  //   }
  // };

  const validateReferral = async (code) => {
    try {
      const response = await fetch('/api/wallet/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: code,
          walletAddress: sender
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error validating referral:", error);
      return { valid: false, message: "Error validating referral" };
    }
  };

  const handleReferralSubmit = async () => {
    if (!referralCode.trim()) {
      setReferralError("Please enter a referral code");
      return;
    }

    const validation = await validateReferral(referralCode);
    if (!validation.valid) {
      setReferralError(validation.message);
      return;
    }

    try {
      const response = await fetch('/api/wallet/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: sender,
          referralCode: referralCode.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowReferralInput(false);
      fetchStakeInfo();
    } catch (error) {
      setReferralError(error.message);
    }
  };

  const handleSkipReferral = async () => {
    try {
      await fetch('/api/wallet/skip-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: sender })
      });

      setHasSkippedReferral(true);
      setShowReferralInput(false);
      fetchStakeInfo();
    } catch (error) {
      console.error("Error skipping referral:", error);
    }
  };

  const fetchStakeInfo = async () => {
    try {
      const response = await fetch(`/api/wallet/stake-info?walletAddress=${sender}`);
      const data = await response.json();
      setStakeInfo(data);
    } catch (error) {
      console.error("Error fetching stake info:", error);
    }
  };

  const transferTokens = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid token amount.", {
        icon: "⚠️",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
      return;
    }

    setIsStaking(true);
    setStatus("Preparing transfer...");

    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const senderPubKey = new PublicKey(sender);
      const recipientPubKey = new PublicKey(RECIPIENT_ADDRESS);
      const tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);

      const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, senderPubKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, recipientPubKey);

      const recipientInfo = await connection.getAccountInfo(recipientTokenAccount);

      const tx = new Transaction();

      if (!recipientInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            senderPubKey,
            recipientTokenAccount,
            recipientPubKey,
            tokenMint
          )
        );
      }

      tx.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPubKey,
          Number(amount) * 10 ** DECIMALS
        )
      );

      tx.feePayer = senderPubKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      setStatus("Requesting wallet signature...");
      const { signature } = await window.solana.signAndSendTransaction(tx);

      setStatus("Confirming...");
      await connection.confirmTransaction(signature, "confirmed");

      // Update stake in database
      await fetch('/api/wallet/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: sender,
          amount: Number(amount),
          txHash: signature
        })
      });

      // Refresh stake info
      await fetchStakeInfo();

      setTransactionHash(signature);
      setStatus("Transaction successful!");
      setAmount("");
      
      toast.success("Staking successful! 🎉", {
        icon: "✅",
        style: {
          background: "#52c41a",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Transfer failed:", error);
      setStatus("Transfer failed — see console.");
      toast.error("Staking failed. Please try again.", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          fontSize: "14px",
          fontWeight: "500",
        }}
        toastStyle={{
          borderRadius: "8px",
          padding: "16px",
          margin: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        progressStyle={{
          background: "rgba(255, 255, 255, 0.3)",
        }}
        bodyStyle={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "0",
        }}
        closeButton={false}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.container}
      >
        <motion.div
          style={styles.contentWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {showReferralInput ? (
              <motion.div
                key="referral"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={styles.referralContainer}
              >
                <motion.h2 
                  style={styles.heading}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Enter Referral Code
                </motion.h2>

                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      setReferralError("");
                    }}
                    placeholder="Enter referral code"
                    style={styles.input}
                  />
                </div>

                {referralError && (
                  <motion.p 
                    style={styles.error}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {referralError}
                  </motion.p>
                )}

                <div style={styles.buttonContainer}>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(92, 106, 196, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReferralSubmit}
                    style={styles.button}
                  >
                    Submit Referral
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSkipReferral}
                    style={styles.skipButton}
                  >
                    Skip
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!showReferralInput && (hasSkippedReferral || !isNewUser) && (
            <motion.div
              key="stake"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <motion.h2 
                style={styles.heading}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Stake FartCoin
              </motion.h2>

              <motion.div
                style={styles.inputContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div style={styles.inputWrapper}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter token amount"
                    min="0.000001"
                    step="0.000001"
                    style={styles.input}
                  />
                  <span style={styles.inputLabel}>FART</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(92, 106, 196, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={transferTokens}
                  style={{
                    ...styles.button,
                    opacity: isStaking ? 0.7 : 1,
                    cursor: isStaking ? "not-allowed" : "pointer",
                    pointerEvents: isStaking ? "none" : "auto"
                  }}
                  disabled={isStaking}
                >
                  {isStaking ? "Staking..." : "Stake Now"}
                </motion.button>
              </motion.div>

              {status && (
                <motion.div 
                  style={styles.statusContainer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={styles.statusIcon}>⏳</div>
                  <p style={styles.status}>{status}</p>
                </motion.div>
              )}

              {transactionHash && (
                <motion.div 
                  style={styles.link}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p style={styles.transactionLabel}>Transaction:</p>
                  <a
                    href={`https://explorer.solana.com/tx/${transactionHash}?cluster=${NETWORK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.transactionLink}
                  >
                    {transactionHash}
                  </a>
                </motion.div>
              )}

              <motion.div 
                style={styles.noteContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span style={styles.noteIcon}>ℹ️</span>
                <p style={styles.note}>Staking period is for 90 Days</p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

const styles = {
  container: {
    marginTop: "20px",
    textAlign: "center",
    padding: "15px",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  contentWrapper: {
    padding: "15px",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "1.5rem",
    fontWeight: "700",
    background: "linear-gradient(45deg, #5c6ac4, #6c7ae0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
  },
  stakingInfo: {
    backgroundColor: "#f8f9ff",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(92, 106, 196, 0.1)",
  },
  stakeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "15px",
  },
  stakeItem: {
    textAlign: "center",
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid rgba(92, 106, 196, 0.1)",
  },
  stakeIcon: {
    fontSize: "24px",
    marginBottom: "8px",
    display: "block",
  },
  stakeLabel: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "4px",
    fontWeight: "500",
  },
  stakeValue: {
    fontSize: "18px",
    color: "#5c6ac4",
    fontWeight: "bold",
    margin: "0",
    background: "linear-gradient(45deg, #5c6ac4, #6c7ae0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    paddingRight: "60px",
    "&:focus": {
      borderColor: "#5c6ac4",
      outline: "none",
      boxShadow: "0 0 0 3px rgba(92, 106, 196, 0.1)",
    },
  },
  inputLabel: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#666",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#5c6ac4",
    color: "#fff",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#f8f9ff",
    borderRadius: "8px",
  },
  statusIcon: {
    fontSize: "18px",
  },
  status: {
    margin: "0",
    fontStyle: "italic",
    color: "#333",
    fontSize: "14px",
  },
  link: {
    marginTop: "15px",
    fontSize: "13px",
    wordBreak: "break-word",
    padding: "12px",
    backgroundColor: "#f8f9ff",
    borderRadius: "8px",
  },
  transactionLabel: {
    margin: "0 0 4px 0",
    color: "#666",
  },
  transactionLink: {
    color: "#5c6ac4",
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  noteContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#f8f9ff",
    borderRadius: "8px",
  },
  noteIcon: {
    fontSize: "14px",
  },
  note: {
    margin: "0",
    fontStyle: "italic",
    color: "#666",
    fontSize: "13px",
  },
  referralContainer: {
    textAlign: "center",
    padding: "20px",
  },
  error: {
    color: "#dc3545",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "15px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "20px",
  },
  skipButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  "@media (max-width: 480px)": {
    container: {
      marginTop: "15px",
      padding: "12px",
    },
    contentWrapper: {
      padding: "12px",
    },
    heading: {
      fontSize: "1.3rem",
      marginBottom: "15px",
    },
    stakingInfo: {
      padding: "12px",
    },
    stakeGrid: {
      gridTemplateColumns: "1fr",
      gap: "10px",
    },
    stakeItem: {
      padding: "10px",
    },
    stakeValue: {
      fontSize: "16px",
    },
    input: {
      padding: "10px 14px",
      fontSize: "14px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "14px",
    },
  },
};

export default TokenTransfer;
