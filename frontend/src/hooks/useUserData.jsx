import { useContext } from "react";
import UserDataContext from "../context/UserDataProvider";

const useUserData = () => {
    const { userData } = useContext(UserDataContext);
    return useContext(UserDataContext);
}

export default useUserData;