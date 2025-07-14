import React from 'react';
import AnimatedBackground from './AnimatedBackground';

const Header = () => {
  return (
    <>
      <div style={styles.bannerContainer}>
        <AnimatedBackground isActive={true} />
        <div style={styles.banner}>
        <span style={styles.bannerText}>🚨</span>
        <span style={styles.validUntil}>Only valid until banner is removed.</span>
          <p style={styles.bannerText}>
            🚀 Limited Time Offer: x14 Staking Rewards! Min. stake: 1000 USDT to qualify.
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
    display: 'block',
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
  validUntil: {
    display: 'inline-block',
    background: '#fffbe6',
    color: '#d35400',
    fontWeight: 700,
    fontSize: '1.15em',
    borderRadius: '6px',
    padding: '4px 14px',
    margin: '0 10px',
    boxShadow: '0 1px 4px rgba(255, 198, 0, 0.12)',
    letterSpacing: '0.02em',
    transition: 'background 0.2s, color 0.2s',
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
