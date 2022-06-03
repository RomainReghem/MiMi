import useAuth from "./useAuth";
import axios from "../api/axios";
import useAxiosPrivate from "./useAxiosPrivate";


const useGetStudents = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const getStudents = async () => {
        try {
            const response = await axiosPrivate.get('/eleves', {
                params: { mail: auth?.user },
            });

            // On met ça dans le local storage pour la partie shared documents
            // a changer et faire par rapport à l'id de la classe + récupération de(s) eleve par l'api
            localStorage.setItem("mailEleve", response.data.eleves[0].courriel)
            return response.data.eleves;
        } catch (err) {
            console.log(err)
        }
    }

    return getStudents;
}

export default useGetStudents;