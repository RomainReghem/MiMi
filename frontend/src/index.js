import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./pages/App";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
    <div className="container">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<App />}/>
          </Routes>          
        </AuthProvider>
      </Router>
    </div>
);