import * as React from "react";
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
import Jitsi from "../components/jitsi";
import TicTacToe from "./Games/TicTacToe";
import Jeux from "./Games/Jeux"
import NotFound from "./NotFound"

import Settings from "./Settings/Settings";


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
      50: '#e3f3ff',
      100: '#bdd9f5',
      200: '#96bee9',
      300: '#6ea5dd',
      400: '#478bd2',
      500: '#2d71b8',
      600: '#205890',
      700: '#143f68',
      800: '#062641',
      900: '#000e1b',
    }
  }
})

export default function App() {
  return (
    <>
      <ColorModeScript />
      <ChakraProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/register-class" element={<RegisterClass />} />
            <Route path="/choice" element={<Choice />} />
            </Route>

            <Route element={<PersistLogin />}>
            <Route path="/" element={<Layout />}>
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/video" element={<Jitsi />} />
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
