import React from 'react';
import "./index.css"
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from './components/App';
import { AuthProvider } from "./context/AuthProvider";
import { UserDataProvider } from './context/UserDataProvider';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <>
    <Router>
      <AuthProvider>
        <UserDataProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
        </UserDataProvider>
      </AuthProvider>
    </Router>
  </>
);