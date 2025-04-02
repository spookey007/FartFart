import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div>
      <Header />
      <main
        style={{
          maxWidth: "90vw",
          margin: "20px auto",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <h1>About FartCoin</h1>
        <p>
          FartCoin is a groundbreaking decentralized token on the Solana blockchain
          that aims to bring a fun, innovative, and community-driven experience to
          crypto enthusiasts. While its lighthearted name might raise a few eyebrows,
          the project is serious about building accessible, user-friendly tools for
          its growing ecosystem.
        </p>

        <h2>Our Vision</h2>
        <p>
          We believe in empowering users through DeFi services that are open,
          transparent, and easy to use. Our goal is to combine the best aspects
          of blockchain technology with approachable branding and straightforward
          interfaces.
        </p>

        <h2>Staking: Earn Rewards with FartCoin</h2>
        <p>
          One of the key features of our ecosystem is the ability to stake your
          FartCoin. Staking lets you lock up your tokens for a period of 60 days,
          helping to secure the network or provide liquidity, all while earning
          additional rewards.
        </p>

        <h3>How Staking Works</h3>
        <ol>
          <li>
            <strong>Lock Your Tokens:</strong> Choose a staking pool or contract on the
            official FartCoin dashboard.
          </li>
          <li>
            <strong>Accrue Rewards:</strong> Rewards are distributed daily throughout the
            staking period.
          </li>
          <li>
            <strong>Automatic Withdrawal:</strong> After 60 days, both your staked
            tokens and any earned rewards automatically return to your wallet.
          </li>
        </ol>

        <h3>Staking Rewards</h3>
        <ul>
          <li>Basic Staking APY: ~10%</li>
          <li>Enhanced Staking APY: ~15%</li>
        </ul>
        <p>
          <em>
            Note: These percentages are placeholders. Adjust based on real-world
            conditions or project economics.
          </em>
        </p>

        <h3>Example Timeline</h3>
        <p>
          <strong>Day 1:</strong> You stake 10,000 FartCoin.
          <br />
          <strong>Days 1–60:</strong> Tokens remain locked, accumulating daily rewards.
          <br />
          <strong>Day 60:</strong> Your entire stake plus rewards automatically
          return to your wallet.
        </p>

        <h3>Risks & Considerations</h3>
        <ul>
          <li>
            <strong>Market Volatility:</strong> Token prices may fluctuate during
            your staking period.
          </li>
          <li>
            <strong>Lock-Up Period:</strong> Early withdrawal options may be limited
            or unavailable.
          </li>
          <li>
            <strong>Smart Contract Risk:</strong> While we prioritize security,
            there’s always a possibility of unforeseen vulnerabilities.
          </li>
        </ul>

        <h2>Get Involved</h2>
        <p>
          Beyond staking, FartCoin has an active community on Discord, Telegram,
          and Twitter. Join us to stay up to date on upcoming features, governance
          proposals, and community events.
        </p>

        <h2>Contact & Community</h2>
        <p>
          For more information, check out our official website, follow us on
          social channels, or jump into our community chats. We love hearing
          feedback, feature requests, and creative ideas from our supporters!
        </p>
      </main>
    
    </div>
  );
};

export default About;
