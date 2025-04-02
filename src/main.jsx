import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/css/index.css"; // Global styles
import { Buffer } from 'buffer';

if (!window.Buffer) window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
