import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";
import TokenTransfer from "./TokenTransfer";

// Add icons for stake metrics
const StakeIcon = ({ type }) => {
  const icons = {
    amount: "💰",
    reward: "🎁"
  };
  return <span style={{ fontSize: "24px", marginBottom: "8px" }}>{icons[type]}</span>;
};

// Format number with commas and 2 decimal places
const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

const WalletConnect = ({ onConnect, onDisconnect, onReferralComplete }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSkippedReferral, setHasSkippedReferral] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [stakeInfo, setStakeInfo] = useState({
    amount_staked: "0",
    reward_amount: "0"
  });
  const [referralError, setReferralError] = useState("");
  const [isReferralCompleted, setIsReferralCompleted] = useState(false);

  // Auto-connect if already trusted
  useEffect(() => {
    const checkIfAlreadyConnected = async () => {
      if (window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          const address = response.publicKey.toString();
          setWalletAddress(address);
          onConnect?.(address);
          await checkUserStatus(address);
        } catch (err) {
          console.log("Auto-connect skipped:", err.message);
        }
      }
    };
    checkIfAlreadyConnected();
  }, []);

  const checkUserStatus = async (address) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      const data = await response.json();
      console.log('User status response:', data);
      
      // Set user's referral code
      setUserReferralCode(data.userReferralCode);

      // Check if user has a jreferal code
      if (!data.jreferal || data.jreferal === "") {
        // Show referral input if user has no jreferal code
        setShowReferralInput(true);
        setHasSkippedReferral(false);
        setIsReferralCompleted(false);
      } else {
        // User has a jreferal code, show stake info
        setShowReferralInput(false);
        setHasSkippedReferral(false);
        setIsReferralCompleted(true);
        onReferralComplete?.();
        await fetchStakeInfo(address);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      toast.error("Failed to check user status", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStakeInfo = async (address) => {
    try {
      console.log("Fetching stake info for address:", address);
      const response = await fetch(`/api/wallet/stake-info?walletAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stake info');
      }
      const data = await response.json();
      console.log("Stake info received:", data);
      setStakeInfo({
        amount_staked: formatNumber(data.amount_staked || 0),
        reward_amount: formatNumber(data.reward_amount || 0)
      });
    } catch (error) {
      console.error("Error fetching stake info:", error);
      setStakeInfo({
        amount_staked: "0",
        reward_amount: "0"
      });
    }
  };

  // Add useEffect to fetch stake info when wallet is connected
  useEffect(() => {
    if (walletAddress && !showReferralInput && !hasSkippedReferral) {
      fetchStakeInfo(walletAddress);
    }
  }, [walletAddress, showReferralInput, hasSkippedReferral]);

  // Add useEffect to refresh stake info periodically
  useEffect(() => {
    if (walletAddress && !showReferralInput && !hasSkippedReferral) {
      const interval = setInterval(() => {
        fetchStakeInfo(walletAddress);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [walletAddress, showReferralInput, hasSkippedReferral]);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      if (!window.solana || !window.solana.isPhantom) {
        toast.error("Phantom Wallet Required", {
          icon: "⚠️",
          style: {
            background: "#ff4d4f",
            color: "#fff",
          },
        });
        return;
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      onConnect?.(address);
      await checkUserStatus(address);
      toast.success("Wallet Connected!", {
        icon: "✅",
        style: {
          background: "#52c41a",
          color: "#fff",
        },
      });
    } catch (error) {
      if (error.code === 4001) {
        toast.warning("Connection Rejected", {
          icon: "⚠️",
          style: {
            background: "#faad14",
            color: "#fff",
          },
        });
      } else {
        toast.error("Connection Failed", {
          icon: "❌",
          style: {
            background: "#ff4d4f",
            color: "#fff",
          },
        });
        console.error("Wallet connection failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralSubmit = async () => {
    if (!referralCode.trim()) {
      toast.error("Referral Code Required", {
        icon: "⚠️",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
      return;
    }

    try {
      // First validate the referral code
      const validateResponse = await fetch('/api/wallet/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: referralCode.trim(),
          walletAddress
        })
      });

      const validationData = await validateResponse.json();
      console.log('Validation Response:', validationData);

      if (!validateResponse.ok) {
        toast.error(validationData.message || "Invalid Referral Code", {
          icon: "❌",
          style: {
            background: "#ff4d4f",
            color: "#fff",
          },
        });
        return;
      }

      if (!validationData.valid) {
        toast.error(validationData.message || "Invalid Referral Code", {
          icon: "❌",
          style: {
            background: "#ff4d4f",
            color: "#fff",
          },
        });
        return;
      }

      setIsLoading(true);
      // If validation passes, submit the referral
      const response = await fetch('/api/wallet/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          referralCode: referralCode.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Referral Code Accepted!", {
        icon: "🎉",
        style: {
          background: "#52c41a",
          color: "#fff",
        },
      });
      setShowReferralInput(false);
      setIsReferralCompleted(true);
      onReferralComplete?.();
      await fetchStakeInfo(walletAddress);
    } catch (error) {
      console.error('Referral Error:', error);
      toast.error(error.message || "Failed to submit referral code", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipReferral = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/skip-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      const data = await response.json();
      if (data.referralCode) {
        toast.info("Referral Skipped", {
          icon: "⏭️",
          style: {
            background: "#1890ff",
            color: "#fff",
          },
        });
        setUserReferralCode(data.referralCode);
        setShowReferralInput(false);
        setHasSkippedReferral(true);
        setIsReferralCompleted(true);
        onReferralComplete?.();
      }
    } catch (error) {
      toast.error("Failed to Skip Referral", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
      console.error("Error skipping referral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to reset user state
  const resetUserState = () => {
    setWalletAddress(null);
    setShowReferralInput(false);
    setUserReferralCode(null);
    setIsNewUser(false);
    setHasSkippedReferral(false);
    setStakeInfo({
      amount_staked: "0",
      reward_amount: "0"
    });
  };

  // Update disconnectWallet to use resetUserState
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      await window.solana.disconnect();
      resetUserState();
      onDisconnect?.();
      toast.info("Wallet Disconnected", {
        icon: "👋",
        style: {
          background: "#1890ff",
          color: "#fff",
        },
      });
    } catch (error) {
      toast.error("Disconnect Failed", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowStakeDialog(false);
    }
  };

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(userReferralCode);
      toast.success("Referral code copied to clipboard!", {
        icon: "📋",
        style: {
          background: "#4CAF50",
          color: "#fff",
        },
      });
    } catch (error) {
      toast.error("Failed to copy referral code", {
        icon: "❌",
        style: {
          background: "#ff4d4f",
          color: "#fff",
        },
      });
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
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={styles.container}
        >
          {walletAddress ? (
            <AnimatePresence mode="wait">
              {showReferralInput ? (
                <motion.div
                  key="referral"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={styles.referralContainer}
                >
                  <h3 style={styles.title}>Enter Referral Code</h3>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    style={styles.input}
                  />
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReferralSubmit}
                      style={styles.button}
                    >
                      Submit Referral
                    </motion.button>
                  </div>
                  {userReferralCode && (
                    <motion.div 
                      style={{
                        ...styles.referralInfo,
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#f8f9ff',
                        borderRadius: '12px',
                        border: '1px solid rgba(92, 106, 196, 0.1)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p style={{
                        ...styles.referralLabel,
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>Your Referral Code:</p>
                      <motion.div 
                        style={{
                          ...styles.referralCodeContainer,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          backgroundColor: '#fff',
                          borderRadius: '10px',
                          border: '1px solid rgba(92, 106, 196, 0.15)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          width: '100%',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        whileHover={{ 
                          scale: 1.01, 
                          backgroundColor: "#f8f9fa",
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          borderColor: 'rgba(92, 106, 196, 0.25)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyReferralCode}
                      >
                        <p style={{
                          ...styles.referralCode,
                          margin: 0,
                          flex: 1,
                          textAlign: 'left',
                          fontFamily: 'monospace',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          letterSpacing: '0.5px',
                          userSelect: 'none'
                        }}>{userReferralCode}</p>
                        <motion.span 
                          style={{
                            ...styles.copyIcon,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '12px',
                            color: '#5c6ac4',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            padding: '8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(92, 106, 196, 0.05)'
                          }}
                          whileHover={{ 
                            scale: 1.1,
                            opacity: 1,
                            backgroundColor: 'rgba(92, 106, 196, 0.1)'
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="stake"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={styles.stakeContainer}
                >
                  <div style={styles.walletInfo}>
                    <p style={styles.address}>Connected: {walletAddress}</p>
                    {userReferralCode && !showReferralInput && (
                      <motion.div 
                        style={{
                          ...styles.referralInfo,
                          marginTop: '20px',
                          padding: '16px',
                          backgroundColor: '#f8f9ff',
                          borderRadius: '12px',
                          border: '1px solid rgba(92, 106, 196, 0.1)'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p style={{
                          ...styles.referralLabel,
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '12px',
                          fontWeight: '500'
                        }}>Your Referral Code:</p>
                        <motion.div 
                          style={{
                            ...styles.referralCodeContainer,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            border: '1px solid rgba(92, 106, 196, 0.15)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            width: '100%',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          whileHover={{ 
                            scale: 1.01, 
                            backgroundColor: "#f8f9fa",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            borderColor: 'rgba(92, 106, 196, 0.25)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCopyReferralCode}
                        >
                          <p style={{
                            ...styles.referralCode,
                            margin: 0,
                            flex: 1,
                            textAlign: 'left',
                            fontFamily: 'monospace',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333',
                            letterSpacing: '0.5px',
                            userSelect: 'none'
                          }}>{userReferralCode}</p>
                          <motion.span 
                            style={{
                              ...styles.copyIcon,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: '12px',
                              color: '#5c6ac4',
                              opacity: 0.8,
                              transition: 'all 0.2s ease',
                              padding: '8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(92, 106, 196, 0.05)'
                            }}
                            whileHover={{ 
                              scale: 1.1,
                              opacity: 1,
                              backgroundColor: 'rgba(92, 106, 196, 0.1)'
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </motion.span>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  <motion.div 
                    style={styles.stakingInfo}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div style={styles.stakeGrid}>
                      <motion.div 
                        style={styles.stakeItem}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span style={styles.stakeIcon}>💰</span>
                        <p style={styles.stakeLabel}>Amount Staked</p>
                        <p style={styles.stakeValue}>${stakeInfo.amount_staked}</p>
                      </motion.div>
                      <motion.div 
                        style={styles.stakeItem}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span style={styles.stakeIcon}>🎁</span>
                        <p style={styles.stakeLabel}>Staking Rewards</p>
                        <p style={styles.stakeValue}>${stakeInfo.reward_amount}</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <div style={styles.buttonContainer}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowStakeDialog(true)}
                      style={styles.stakeButton}
                    >
                      Stake FartCoin
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={disconnectWallet}
                      style={styles.button}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              style={styles.button}
            >
              Connect Phantom Wallet
            </motion.button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showStakeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.dialogOverlay}
            onClick={handleDialogClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.dialog}
            >
              <div style={styles.dialogHeader}>
                <h3 style={styles.dialogTitle}></h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStakeDialog(false)}
                  style={styles.closeButton}
                >
                  ✕
                </motion.button>
    </div>
              <TokenTransfer 
                sender={walletAddress} 
                onClose={() => setShowStakeDialog(false)}
                onStakeComplete={() => {
                  setShowStakeDialog(false);
                  fetchStakeInfo(walletAddress);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  referralContainer: {
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "15px",
    outline: "none",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#5c6ac4",
    },
  },
  buttonContainer: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "15px",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#5c6ac4",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    minWidth: "120px",
  },
  error: {
    color: "#dc3545",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "15px",
  },
  stakeContainer: {
    padding: "20px",
  },
  walletInfo: {
    marginBottom: "20px",
    textAlign: "center",
  },
  address: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
    wordBreak: "break-all",
  },
  referralInfo: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "10px",
    cursor: "pointer",
  },
  referralLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
  },
  referralCodeContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(92, 106, 196, 0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      backgroundColor: "#f8f9fa",
      borderColor: "rgba(92, 106, 196, 0.2)",
    },
  },
  referralCode: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    fontFamily: "monospace",
    margin: "0",
    letterSpacing: "0.5px",
  },
  copyIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#5c6ac4",
    opacity: 0.8,
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 1,
      color: "#4CAF50",
    },
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
  stakeButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    minWidth: "120px",
  },
  dialogOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  dialogTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#666",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f5f5f5",
      color: "#333",
    },
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "90%",
    width: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    position: "relative",
  },
  "@media (max-width: 480px)": {
    container: {
      padding: "15px",
      margin: "10px",
    },
    title: {
      fontSize: "20px",
    },
    input: {
      padding: "10px",
      fontSize: "14px",
    },
    button: {
      padding: "6px 12px",
      fontSize: "12px",
      minWidth: "100px",
    },
    stakeButton: {
      padding: "6px 12px",
      fontSize: "12px",
      minWidth: "100px",
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
    dialogTitle: {
      fontSize: "18px",
    },
    closeButton: {
      fontSize: "18px",
      width: "28px",
      height: "28px",
    },
  },
  "@media (max-width: 360px)": {
    stakeItem: {
      padding: "8px",
    },
    stakeLabel: {
      fontSize: "12px",
    },
    stakeValue: {
      fontSize: "15px",
    },
    button: {
      padding: "5px 10px",
      fontSize: "11px",
      minWidth: "90px",
    },
    stakeButton: {
      padding: "5px 10px",
      fontSize: "11px",
      minWidth: "90px",
    },
  },
};

export default WalletConnect;
