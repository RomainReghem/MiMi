import useAuth from "./useAuth";
import axios from "../api/axios";

const useGetImage = () => {
    const { auth } = useAuth();

    const getImage = async () => {
        try {
            const response = await axios.get("/getImage",
                {
                    params: { mail: auth?.user },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            return response.data.image.data;
        } catch (err) { console.log("Erreur du chargement de l'image de profil"); }
    }

    return getImage;
}

export default useGetImage;