import * as React from "react";
import { Routes, Route, } from "react-router-dom";

// Hooks
import useAuth from "../hooks/useAuth";
// Composants
import Nav from "../components/Nav"
import RequireAuth from "../components/RequireAuth"

// Pages
import Profile from "./Profile"
import Documents from "./Documents"
import Login from "./Login";
import RegisterStudent from "./RegisterStudent";
import RegisterClass from "./RegisterClass"
import Choice from "./Choice"
import Home from "./Home"
import Layout from "./Layout"
import Success from "./Success"
import Tests from "./Tests"

// Styles
import '../styles/App.css'
import '../styles/connexion.css'



export default function App() {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <div className="top-border" />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/register-class" element={<RegisterClass />} />
          <Route path="/choice" element={<Choice />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/success" element={<Success />} />

          <Route element={<RequireAuth />}>
          </Route>

          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<Documents />} />
        </Route>


      </Routes>
    </div>
  );
}