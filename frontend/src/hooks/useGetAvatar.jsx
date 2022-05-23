import useAuth from "./useAuth";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


const useGetAvatar = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();


    const getAvatar = async () => {
        if (auth?.role == "classe")
            return;
        try {
            const response = await axiosPrivate.get("/avatar",
                {
                    params: { mail: auth?.user }
                });
            return JSON.parse(response.data.avatar);
        } catch (err) { console.log("Erreur du chargement de l'avatar"); }

    }
    return getAvatar;

}
export default useGetAvatar;