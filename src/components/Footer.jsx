const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} Crypto Transfer. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    textAlign: "center",
    padding: "10px",
    backgroundColor: "#333",
    color: "white",
    position: "absolute",
    bottom: "0",
    width: "100%",
  },
};

export default Footer;
