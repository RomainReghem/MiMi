import useAuth from "./useAuth";
import axios from "../api/axios";

const useGetAvatar = () => {
    const { auth } = useAuth();

    const getAvatar = async () => {
        try {
            const response = await axios.get("/avatar",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            return JSON.parse(response.data.avatar);
        } catch (err) { console.log("Erreur du chargement de l'avatar"); }

    }
    return getAvatar;

}
export default useGetAvatar;