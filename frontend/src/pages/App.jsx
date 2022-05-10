import * as React from "react";
import { Routes, Route, } from "react-router-dom";

// Hooks
import useAuth from "../hooks/useAuth";
// Composants
import Nav from "../components/Nav"
import RequireAuth from "../components/RequireAuth"
import { ReactNotifications } from 'react-notifications-component'
import PersistLogin from "../components/PersistLogin";

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
import Construction from "./Construction"

// Styles
import '../styles/App.css'
import '../styles/connexion.css'
import 'react-notifications-component/dist/theme.css'


export default function App() {
  return (
    <>
      <ReactNotifications />
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
        <div className="top-border" />

        <Routes>
          <Route path="/" element={<Layout />}>

            {/* Routes publiques, pas besoin d'être connecté*/}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/register-class" element={<RegisterClass />} />
            <Route path="/choice" element={<Choice />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/success" element={<Success />} />



            {/* Routes qui nécessitent d'être connecté*/}
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/documents" element={<Construction />} />
                <Route path="/visio" element={<Construction />} />
                <Route path="/jeux" element={<Construction />} />
              </Route>
            </Route>



          </Route>
        </Routes>
      </div>

    </>
  );
}