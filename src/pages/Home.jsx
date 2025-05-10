import { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import TokenTransfer from "../components/TokenTransfer";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [isReferralCompleted, setIsReferralCompleted] = useState(false);

  const handleConnect = (address) => {
    setUserAddress(address);
  };

  const handleDisconnect = () => {
    setUserAddress(null);
    setIsReferralCompleted(false);
  };

  const handleReferralComplete = () => {
    setIsReferralCompleted(true);
  };

  return (
    <div>
      <Header />
      <main style={{ textAlign: "center", padding: "50px" }}>
        <h1> Earn rewards while staking Fartcoin </h1>
        <WalletConnect
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onReferralComplete={handleReferralComplete}
        />
        {/* {userAddress && isReferralCompleted && <TokenTransfer sender={userAddress} />} */}
      </main>
    </div>
  );
};

export default Home;
