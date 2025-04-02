const Header = () => {
  return (
    <header style={styles.header}>
      <h1>Crypto Magic Wand</h1>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    backgroundColor: "#333",
    color: "white",
  },
  link: {
    color: "white",
    marginRight: "15px",
    textDecoration: "none",
  }
};

export default Header;
