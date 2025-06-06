import React from 'react';
import AnimatedBackground from './AnimatedBackground';

const Header = () => {
  return (
    <>
      <div style={styles.bannerContainer}>
        <AnimatedBackground isActive={true} />
        <div style={styles.banner}>
          <p style={styles.bannerText}>
            🚀 Limited Time Offer: 2x Staking Rewards! Lock in your tokens for the next 48 hours for double earnings. Min. stake: 1000 USDT to qualify.
          </p>
        </div>
      </div>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>
          <a href="/" style={styles.linkTitle}>
            <img 
              src="/fartcoin.png" 
              alt="FartFart" 
              style={styles.logo}
            />
            FartFart
          </a>
        </h1>
        <nav>
          <a href="/about" style={styles.link}>
            About
          </a>
        </nav>
      </header>
    </>
  );
};

const styles = {
  bannerContainer: {
    position: 'relative',
    overflow: 'hidden',
    display: 'none',
  },
  banner: {
    position: 'relative',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    color: '#000',
    textAlign: 'center',
    padding: '10px',
    fontWeight: 'bold',
    fontSize: '1.1em',
    animation: 'pulse 2s infinite',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    height: '32px',
    width: 'auto',
    marginRight: '8px',
    verticalAlign: 'middle',
  },
  linkTitle: {
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  link: {
    color: 'white',
    marginRight: '15px',
    textDecoration: 'none',
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: 0.8,
    },
  },
  bannerText: {
    margin: 0,
  },
};

// Add keyframes for the pulse animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default Header;
