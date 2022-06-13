// Globalement la même chose que l'AuthProvider.
// Le but est juste de séparer sémantiquement les informations d'authentification et les informations 'd'apparence' de l'utilisateur

import { createContext, useState } from "react";

const UserDataContext = createContext({})


export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState({});

    return (
        <UserDataContext.Provider value = {{userData, setUserData}}>
            {children}
        </UserDataContext.Provider>
    )
}

export default UserDataContext;