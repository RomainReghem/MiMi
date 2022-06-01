import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { faCheck, faXmark, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { useToast, Stack, Text, IconButton, Tooltip, useColorModeValue } from "@chakra-ui/react";

const Invitations = () => {
    const toast = useToast();
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const classe = auth?.idclasse;
    const user = auth?.user;
    console.log(auth);

    const acceptInvite = async () => {
        try {
            await axiosPrivate.post("/acceptInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            await setAuth({
                ...auth,
                invitation: "acceptee"
            })
            toast({ title: "Invitation acceptée !", description: "Vous faites maintenant partie de la classe #" + classe, status: "success", duration: 5000, isClosable: true, position: "top" })
        }
        catch (err) {
            console.log(err)
        }
    }

    const refuseInvite = async () => {
        try {
            await axiosPrivate.post("/refuseInvite", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            await setAuth({
                ...auth,
                invitation: "aucune"
            })
            toast({ title: "Invitation refusée", description: "", status: "info", duration: 5000, isClosable: true, position: "top" })
        }
        catch (err) {
            console.log(err)
        }
    }

    const quitClass = async () => {
        try {
            await axiosPrivate.post("/quitClass", JSON.stringify({ user }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            toast({ title: "Classe quittée", description: "", status: "info", duration: 5000, isClosable: true, position: "top" })
            await setAuth({
                ...auth,
                invitation: "aucune"
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        auth?.invitation == "aucune" ? (
            <Stack p={3} backgroundColor={'red.300'}>
                <Text>Aucune invitation de classe en attente</Text>
            </Stack>)
            : auth?.invitation == "en attente" ? (
                <Stack w={'100%'} p={3} borderRadius={5} justify={'space-between'} align={'center'} direction={'row'} bg={"blackAlpha.100"}>
                    <Text>La classe #{classe} vous a invité !</Text>
                    <Stack direction={'row'}>
                        <Tooltip bg={'green.400'} label='Accepter' fontSize='md' placement="top">
                            <IconButton size={"sm"} colorScheme={"green"} _hover={{ bg: 'green.400' }} onClick={acceptInvite} icon={<FontAwesomeIcon icon={faCheck} />}>
                            </IconButton>
                        </Tooltip>
                        <Tooltip bg={'red.400'} label='Refuser' fontSize='md' placement="top">
                            <IconButton size={"sm"} colorScheme={"red"} _hover={{ bg: 'red.400' }} onClick={refuseInvite} icon={<FontAwesomeIcon className="inviteIcons" icon={faXmark} />}>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>)
                : auth?.invitation == "acceptee" ? (
                    <Stack justify={'space-between'} w={'100%'} borderRadius={5} p={3} direction={"row"} align={'center'} bg={"blackAlpha.100"}>
                        <p>Vous êtes membre de la classe #{classe}</p>
                        <Tooltip bg={'red.400'} label='Quitter la classe' fontSize='md' placement="top">
                        <IconButton size={"sm"} colorScheme={"red"} onClick={quitClass} icon={<FontAwesomeIcon icon={faDoorOpen}/>}>                            
                        </IconButton>
                        </Tooltip>
                    </Stack>) : <></>);
}

export default Invitations;