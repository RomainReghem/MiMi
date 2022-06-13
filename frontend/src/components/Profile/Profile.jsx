import useAuth from "../../hooks/useAuth";
import Identity from "./Identity";
import AvatarComponent from "./AvatarComponent"
import Students from "./Students"
import { Wrap, Center, Divider, useBreakpointValue } from "@chakra-ui/react"


const Profile = () => {
    const orientation = useBreakpointValue({ xs: "horizontal", md: "vertical" })
    const height = useBreakpointValue({ xs: "", md: "25rem" })
    const { auth } = useAuth();
    const role = auth?.role;

    // La classe n'a pas besoin d'avoir de quoi créer son avatar, changer son pseudo etc.
    // On crée donc différents dashboards selon le role de la personne authentifiée.
    return (
        <>
            {role == "eleve" ? (
                <Center flexGrow={1}>                    
                    <Wrap spacing={10} p={5} justify={'center'} align={'center'}>
                        <Identity />
                        <Divider orientation={orientation} height={height} />
                        <AvatarComponent />
                    </Wrap>
                </Center>) :
                <Students />
            }
        </>
    )
}

export default Profile;