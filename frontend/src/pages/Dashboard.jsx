import styled from 'styled-components'
import Profile from "../pages/Profile"
import Documents from "../pages/Documents"
import DashboardLayout from "../pages/DashboardLayout"
import '../styles/dashboard.css'
import { Routes, Route, } from "react-router-dom";

const Dashboard = styled.div`
display:flex;
width:100%;
height:100%;
`
function Protected() {
    return (        
            <Routes>
                <Route path="" element={<DashboardLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/documents" element={<Documents />} />
                </Route>
            </Routes>
    )
}

export default Protected;