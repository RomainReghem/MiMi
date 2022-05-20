import * as React from "react";
import { Routes, Route, } from "react-router-dom";

// Hooks
import useAuth from "../hooks/useAuth";
// Composants
import Nav from "../components/Nav"
import RequireAuth from "../components/RequireAuth"
import { ReactNotifications } from 'react-notifications-component'
import PersistLogin from "../components/PersistLogin";
import Jitsi from "../components/jitsi";

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
import Settings from "./Settings";
import Visio from "./Visio"

// Styles
import '../styles/App.css'
import '../styles/connexion.css'
import '../styles/documents.css'
import 'react-notifications-component/dist/theme.css'
import '../styles/identity.css'
import '../styles/settings.css'
import '../styles/users.css'



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
                <Route path="/documents" element={<Documents />} />
                <Route path="/visio" element={<Jitsi />} />
                <Route path="/jeux" element={<Construction />} />
                <Route path="/settings" element={<Settings/>}/>                
              </Route>
            </Route>



          </Route>
        </Routes>
      </div>

    </>
  );
}