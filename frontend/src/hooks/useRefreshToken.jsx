import axios from '../api/axios';
import useAuth from './useAuth';
import useUserData from './useUserData'
import jwt_decode from "jwt-decode";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const { setUserData } = useUserData();

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

        // Si c'est un élève on aura besoin d'afficher son pseudo et ses images, la classe n'en a pas.
        // console.log(response.data)
        // response.data.role == "eleve" && setUserData(prev => {
        //     return {
        //         ...prev,
        //         image:response.data.image.data,
        //         avatar:response.data.avatar,
        //         pseudo:response.data.pseudo
        //     }
        // })
        
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;