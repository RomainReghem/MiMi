import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";


const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    // Si l'utilisateur est déconnecté lors de la navigation vers une page protégée, on le redirige vers le Login
    return (
        auth?.user ? <Outlet/> : <Navigate to="/login" state = {{from: location}} replace/>
    );
}

export default RequireAuth;