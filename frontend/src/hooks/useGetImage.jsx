import useAuth from "./useAuth";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


const useGetImage = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();


    const getImage = async () => {
        if (auth?.role == "classe")
            return;
        try {
            const response = await axiosPrivate.get("/getImage",
                {
                    params: { mail: auth?.user }
                });
            return response.data.image.data;
        } catch (err) { console.log("Erreur du chargement de l'image de profil"); }
    }

    return getImage;
}

export default useGetImage;