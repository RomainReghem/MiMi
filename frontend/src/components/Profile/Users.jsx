import { useState, useEffect } from "react";
import { useToast, Tooltip, Heading, Text, Stack, Center, Button, Badge, IconButton, Input, Divider, InputRightElement, InputGroup, Popover, PopoverHeader, PopoverContent, PopoverBody, PopoverTrigger } from "@chakra-ui/react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";


//import Popup from 'reactjs-popup';
//import 'reactjs-popup/dist/index.css';

const Users = () => {
    const toast = useToast();
    const [users, setUsers] = useState();
    const [usersUpdated, setUsersUpdated] = useState();
    const { auth } = useAuth();
    const [newEleve, setNewEleve] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getUsers = async () => {
            try {
                const response = await axiosPrivate.get('/eleves', {
                    params: { mail: auth?.user },
                    signal: controller.signal
                });
                isMounted && setUsers(response.data.eleves);

                // On met ça dans le local storage pour la partie shared documents
                // a changer et faire par rapport à l'id de la classe + récupération de(s) eleve par l'api
                localStorage.setItem("mailEleve", response.data.eleves[0].courriel)
            } catch (err) {
                
                {/*navigate('/login', { state: { from: location }, replace: true });*/ }
            }
        }

        getUsers();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [usersUpdated])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.post("/inviteEleve", JSON.stringify({ classe: auth?.user, eleve: newEleve }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            toast({ title: "Elève invité", description: "", status: "success", duration: 5000, isClosable: true, position: "top" })

        }
        catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else if (err.response?.status === 404) {
                toast({ title: "Erreur", description: "Elève introuvable", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else if (err.response?.status === 403) {
                toast({ title: "Erreur", description: "L'élève est déjà dans une classe ou a déjà une invitation en attente", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Erreur", status: "error", duration: 5000, isClosable: true, position: "top" })

            }
        }
    }

    const deleteEleve = async (eleveToDelete) => {
        try {
            await axiosPrivate.post("/deleteEleve", JSON.stringify({ classe: auth?.user, eleve: eleveToDelete }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            toast({ title: "Elève supprimé", description: "", status: "success", duration: 5000, isClosable: true, position: "top" })
            setUsersUpdated(currValue => !currValue);
        }
        catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
            else {
                toast({ title: "Erreur", description: "Erreur", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
        }

    }

    return (
        <Center flexGrow={1} p={5}>
            <Stack spacing={5} maxW={'lg'}>
                <Heading fontSize={'2xl'}>Inviter un élève</Heading>
                <Text>Les élèves membres de la classe pourront voir vos <Link to={'/documents'}><Badge colorScheme={"blue"}>documents</Badge></Link> partagés et vous en partager d'autres,
                    accéder à la salle de <Link to={'/video'}><Badge colorScheme={"blue"}>visioconférence</Badge></Link>, et <Link to={'/games'}>
                        <Badge colorScheme={"blue"}>jouer</Badge></Link> en ligne avec vous</Text>

                <InputGroup>
                    <Input placeholder="Adresse mail de l'élève" _focus={{ outline: 'none' }} onChange={(e) => setNewEleve(e.target.value)} />
                    <InputRightElement>
                        <Tooltip bg={'green.400'} label="Inviter l'élève" fontSize='md' placement="top">
                            <IconButton colorScheme={'green'} borderRadius={'0px 5px 5px 0px'} _focus={{ outline: 'none' }} onClick={handleSubmit} icon={<FontAwesomeIcon icon={faCheck} />}>
                            </IconButton>
                        </Tooltip>
                    </InputRightElement>
                </InputGroup>
                <Divider my={5} />
                <Heading fontSize={'2xl'}>Eleve(s) de la classe :</Heading><Stack h={'sm'} >
                    {users?.length > 0
                        ? <>
                            {users.map((user, i) => <Stack key={i} align={'center'} justify={'flex-start'} direction={'row'}>
                                <Popover placement="left">
                                    <PopoverTrigger>
                                        <IconButton _focus={{outline:'none'}} mr={2} size={'sm'} colorScheme={'red'} icon={<FontAwesomeIcon icon={faXmark} />}></IconButton>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverBody><Stack><Text>Vous êtes sur le point de supprimer cet élève</Text><Button colorScheme={'red'} onClick={() => { deleteEleve(user?.courriel); setUsersUpdated(!usersUpdated) }}>Supprimer</Button></Stack></PopoverBody>
                                    </PopoverContent>
                                </Popover>
                                <Text fontSize={'lg'}>{user?.courriel}</Text>
                            </Stack>)}
                        </>
                        : <p>Invitez un élève pour le voir apparaître ici lorsqu'il acceptera</p>
                    }
                </Stack>
            </Stack>
        </Center>
    );
};

export default Users;