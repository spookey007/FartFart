import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About"; // <-- Import the About component

function App() {
  return (
    <Router>
      <Routes>
        {/* The existing route for "/" */}
        <Route path="/" element={<Home />} />

        {/* New route for "/about" */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
