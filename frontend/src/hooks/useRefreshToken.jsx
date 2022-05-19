import axios from '../api/axios';
import useAuth from './useAuth';
import jwt_decode from "jwt-decode";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });

        setAuth(prev => {
            return {
                ...prev,
                user:jwt_decode(response?.data?.accessToken).UserInfo.mail,
                role: response.data.role,
                accessToken: response.data.accessToken,
                invitation: response.data.invitation,
                idclasse: response.data.idclasse,
                preference:JSON.parse(localStorage.getItem("preference"+jwt_decode(response?.data?.accessToken).UserInfo.mail))
            }
        });
        
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;