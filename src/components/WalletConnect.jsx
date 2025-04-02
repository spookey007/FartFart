import { useEffect, useState } from "react";

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  // Auto-connect if already trusted
  useEffect(() => {
    const checkIfAlreadyConnected = async () => {
      if (window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          const address = response.publicKey.toString();
          setWalletAddress(address);
          onConnect?.(address);
        } catch (err) {
          // User hasn't approved before or closed popup silently
          console.log("Auto-connect skipped:", err.message);
        }
      }
    };
    checkIfAlreadyConnected();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom Wallet not detected. Please install it from https://phantom.app");
        return;
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      onConnect?.(address);
    } catch (error) {
      if (error.code === 4001) {
        // User rejected
        alert("Wallet connection was rejected.");
      } else {
        console.error("Wallet connection failed:", error);
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress(null);
      onDisconnect?.();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <div style={styles.container}>
      {walletAddress ? (
        <>
          <p style={styles.address}>Connected: {walletAddress}</p>
          <button onClick={disconnectWallet} style={styles.button}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet} style={styles.button}>Connect Phantom Wallet</button>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    margin: "20px auto",
  },
  address: {
    marginBottom: "10px",
    fontSize: "14px",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  button: {
    backgroundColor: "#5c6ac4",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default WalletConnect;
