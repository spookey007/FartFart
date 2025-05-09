import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';

const Header = () => {
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  return (
    <>
      <div style={styles.bannerContainer}>
        <AnimatedBackground isActive={isAnimationActive} />
        <div style={styles.banner}>
          🎉 Double Rewards Promotion This Weekend! All staked FART coin this weekend will earn double! 🎉
          <button 
            onClick={() => setIsAnimationActive(!isAnimationActive)}
            style={styles.toggleButton}
          >
            {isAnimationActive ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>
          <a href="/" style={styles.linkTitle}>
            Hot Air Rises
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
  toggleButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.2em',
    cursor: 'pointer',
    padding: '5px',
    zIndex: 2,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#333',
    color: 'white',
  },
  linkTitle: {
    color: 'white',
    textDecoration: 'none',
  },
  link: {
    color: 'white',
    marginRight: '15px',
    textDecoration: 'none',
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
