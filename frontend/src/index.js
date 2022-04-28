import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./pages/App";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    
    <div className="container">
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </div>
  </React.StrictMode>
);