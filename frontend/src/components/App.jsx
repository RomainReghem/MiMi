import * as React from "react";
import { Routes, Route, } from "react-router-dom";

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

import Settings from "./Settings/Settings";


import '../styles/tictactoe.css'
import '../styles/documents.css'
import '../styles/cell.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/600.css'

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
  },
  colors: {
    space:

    {
      900: '#03045e',
      800: '#023e8a',
      700: '#0077b6',
      600: '#0096c7',
      500: '#00b4d8',
      400: '#48cae4',
      300: '#90e0ef',
      200: '#ade8f4',
      100: '#caf0f8',
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

            <Route element={<PersistLogin />}>
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
        </Routes>


      </ChakraProvider>
    </>
  );
}
