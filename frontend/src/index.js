import React from 'react';
import "./index.css"
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from './components/App';
import { AuthProvider } from "./context/AuthProvider";

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </Router>
  </>
);