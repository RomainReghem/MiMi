import axios from '../api/axios';
import useAuth from './useAuth';
import useUserData from './useUserData'
import jwt_decode from "jwt-decode";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const { setUserData } = useUserData();
    let imageURL;
    let avatarURL;

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

        let binary = '';
        let bytes = new Uint8Array(response.data.image.data);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        imageURL = "data:image/png;base64," + window.btoa(binary)

        let binary2 = '';
        let bytes2 = new Uint8Array(response?.data?.avatarAsImg.data);
        for (let i = 0; i < bytes2.byteLength; i++) {
            binary2 += String.fromCharCode(bytes2[i]);
        }
        avatarURL = "data:image/png;base64," + window.btoa(binary2)


        // Si c'est un élève on aura besoin d'afficher son pseudo et ses images, la classe n'en a pas.
        response.data.role == "eleve" && setUserData(prev => {
            return {
                ...prev,
                image: response.data.image.data,
                avatar: response.data.avatar,
                pseudo: response.data.pseudo,
                avatarAsImage: response?.data?.avatarAsImg.data,
                imageURL: imageURL,
                avatarURL: avatarURL,
            }
        })

        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;