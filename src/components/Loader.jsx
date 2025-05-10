import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.spinner}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #5c6ac4',
    borderRadius: '50%'
  }
};

export default Loader; 