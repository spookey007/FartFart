const Header = () => {
  return (
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
  linkTitle: {
    color: "white",
    textDecoration: "none",
  },
  link: {
    color: "white",
    marginRight: "15px",
    textDecoration: "none",
  },
};

export default Header;
