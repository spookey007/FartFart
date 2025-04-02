import { useState, useEffect } from "react";

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const checkIfAlreadyConnected = async () => {
      if (window.solana?.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          onConnect?.(address);
        } catch {
          // silently ignore if user denied
        }
      }
    };
    checkIfAlreadyConnected();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom Wallet not detected. Please install it!");
        return;
      }

      const resp = await window.solana.connect();
      const address = resp.publicKey.toString();
      setWalletAddress(address);
      onConnect?.(address);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress(null);
      onDisconnect?.();
    } catch (error) {
      console.error("Disconnect failed", error);
    }
  };

  return (
    <div>
      {walletAddress ? (
        <>
          <p>Connected: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Phantom Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;
