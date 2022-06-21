import * as React from "react";
import useAuth from "../hooks/useAuth";
import { Routes, Route, Switch } from "react-router-dom";

import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

import Layout from "./Layout"
import Home from "./Home"
import Login from "./Login/Login"
import Choice from "./Login/Choice"
import RegisterStudent from "./Login/RegisterStudent"
import RegisterClass from "./Login/RegisterClass"
import Profile from "./Profile/Profile"
import PersistLogin from "./Login/PersistLogin"
import RequireAuth from "./RequireAuth"
import Documents from "./Documents/Documents"
import Jutsu from "../components/Jutsu";
import JutsuClass from "../components/JutsuClass"
import TicTacToe from "./Games/TicTacToe";
import Jeux from "./Games/Jeux"
import NotFound from "./NotFound"
import Terms from "./Terms"
import Settings from "./Settings/Settings";
import SendMail from "./Login/SendMail";
import PwdReset from "./Login/PwdReset";


import '../styles/tictactoe.css'
import '../styles/documents.css'
import '../styles/cell.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/600.css'

// Chakra UI (https://chakra-ui.com/) est la librairie d'UI components qui sera utilisée dans ce projet
// On étend le thème pour rajouter entre autres des polices et des couleurs.
const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
  },
  colors: {
    darkblue:
    {
      50: '#eeebff',
      100: '#cbc7ee',
      200: '#a8a2dd',
      300: '#867dce',
      400: '#6358c0',
      500: '#493ea6',
      600: '#393182',
      700: '#29235e',
      800: '#17153b',
      900: '#080619',
    }
  }
})

export default function App() {
  const { auth } = useAuth();

  return (
    <>
      <ColorModeScript />
      <ChakraProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sendmail" element={<SendMail />} />
            <Route path="/pwdreset" element={<PwdReset />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/register-class" element={<RegisterClass />} />
            <Route path="/choice" element={<Choice />} />
            <Route path="/terms" element={<Terms />} />
            </Route>

            <Route element={<PersistLogin />}>
            <Route path="/" element={<Layout />}>
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/video" element={auth?.role == 'eleve' ? <Jutsu /> : <JutsuClass/>} />
                <Route path="/games" element={<Jeux />} />
                <Route path="/tictactoe" element={<TicTacToe />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
          <Route path='*' element={<NotFound/>}/>
        </Routes>


      </ChakraProvider>
    </>
  );
}
