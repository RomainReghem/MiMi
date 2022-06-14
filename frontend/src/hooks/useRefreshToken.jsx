import axios from '../api/axios';
import useAuth from './useAuth';
import useUserData from './useUserData'
import useSetURL from './useSetURL';
import jwt_decode from "jwt-decode";

const useRefreshToken = () => {
    const setURL = useSetURL();
    const { setAuth } = useAuth();
    const { userData, setUserData } = useUserData();


    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });

        setAuth(prev => {
            return {
                ...prev,
                user: jwt_decode(response?.data?.accessToken).UserInfo.mail,
                role: response.data.role,
                accessToken: response.data.accessToken,
                invitation: response.data.invitation,
                idclasse: response.data.idclasse,
                mailclasse: response.data.mailClasse,
                preference: JSON.parse(localStorage.getItem("preference" + jwt_decode(response?.data?.accessToken).UserInfo.mail))
            }
        });
        // Si c'est un élève on aura besoin d'afficher son pseudo et ses images, la classe n'en a pas.
        if (response.data.role == "eleve") {
            setUserData(prev => {
                return {
                    ...prev,
                    image: response.data.image.data,
                    avatar: response.data.avatar,
                    pseudo: response.data.pseudo,
                    avatarAsImage: response?.data?.avatarAsImg.data,
                }
            })

            // On appelle le hook qui permet de transformer les images en URL pour la visioconférence.
            try {
                await setURL(response.data.image.data, response?.data?.avatarAsImg.data)
            }
            catch (err) {
                console.log(err)
            }
        }
        
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;