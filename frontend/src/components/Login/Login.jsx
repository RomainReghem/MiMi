import { Center, Box, FormControl, FormLabel, Input, InputGroup, Spinner, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Link as ReactRouterLink } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from '../../api/axios'
import useAuth from '../../hooks/useAuth'
import useUserData from '../../hooks/useUserData';
import useSetURL from '../../hooks/useSetURL';


const LOGIN_URL = '/login';

export default function Login() {
    const toast = useToast();
    const { setAuth } = useAuth();
    const { setUserData } = useUserData();
    const setURL = useSetURL();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');

    const [displaySpinner, setDisplaySpinner] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisplaySpinner(true)
        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ user, pwd }),                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
                
            const accessToken = response?.data?.accessToken;
            // Eleve ou classe
            const role = response?.data?.role;
            // Acceptee, en attente, aucune
            const invitation = response?.data?.invitation;
            // Les classes le reçoivent toujours. L'élève le reçoit s'il est membre d'une classe
            const idclasse = response?.data?.idclasse;
            // Les classes ne le reçoivent jamais, correspond à leur user. L'élève le reçoit s'il est membre d'une classe
            const mailclasse = response?.data?.mailClasse;
            // Au login, si rien ne correspond dans le local storage, on attribue "avatar" à "préférence"
            // On ajoute aussi la variable au localstorage, default "avatar"
            let preference = JSON.parse(localStorage.getItem("preference" + user)) || "avatar";
            if (!localStorage.getItem("preference" + user)) {
                localStorage.setItem("preference" + user, JSON.stringify("avatar"));
            }
            setAuth({ user, accessToken, role, preference, invitation, idclasse, mailclasse });

            // Si c'est un élève on aura besoin d'afficher son pseudo et ses images, la classe n'en a pas.
            if (role == "eleve") {
                const image = response?.data?.image?.data;
                const avatar = response?.data?.avatar;
                const pseudo = response?.data?.pseudo;
                const avatarAsImage = response?.data?.avatarAsImg?.data;

                setUserData({ image, avatar, pseudo, avatarAsImage })

                // On appelle le hook qui permet de transformer les images en URL pour la visioconférence. 
                setURL(response.data.image.data, response?.data?.avatarAsImg.data)
            }

            setPwd('');
            setUser('');
            toast({ title: "Bienvenue !", description: "Vous êtes connecté", status: "success", duration: 4000, isClosable: true, position: "top" })
            navigate("/profile");

        } catch (err) {
            setDisplaySpinner(false)
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 4000, isClosable: true, position: "top" })
            } else if (err.response?.status === 400) {
                toast({ title: "Erreur", description: "Mot de passe erroné", status: "error", duration: 4000, isClosable: true, position: "top" })

            } else if (err.response?.status === 401) {
                toast({ title: "Erreur", description: "Adresse mail inconnue", status: "error", duration: 4000, isClosable: true, position: "top" })
            }
            else if (err.response?.status === 402) {
                toast({ title: "Erreur", description: "Remplissez tous les champs", status: "error", duration: 4000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Erreur", status: "error", duration: 3000, isClosable: true, position: "top" })

            }
        }
    }

    return (
        <Center flexGrow={1}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={6} mx={'auto'} w={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'3xl'} textAlign={'center'}>
                        Se connecter
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <FormControl id="email" isRequired>
                            <FormLabel>Mail</FormLabel>
                            <Input type="email" onChange={(e) => setUser(e.target.value)} />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Mot de passe</FormLabel>
                            <InputGroup>
                                <Input type={showPassword ? 'text' : 'password'} onChange={(e) => setPwd(e.target.value)} />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() =>
                                            setShowPassword((showPassword) => !showPassword)
                                        }>
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Submitting"
                                size="lg"
                                bg={'cyan.600'}
                                color={'white'}
                                _hover={{
                                    bg: 'cyan.700',
                                }} onClick={handleSubmit}>
                                {
                                 displaySpinner ? <Spinner/> : 'Connexion'
                                }

                            </Button>
                        </Stack>
                        <Stack direction={'row'}>
                        <Text align={'center'} >Pas encore de compte ? <Link to="/choice" as={ReactRouterLink} color={'cyan.600'}>S'inscrire</Link></Text>
                        <Text align={'center'} >Mot de passe oublié ? <Link to="/sendmail" as={ReactRouterLink} color={'cyan.600'}>Réinitialiser</Link></Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Center>
    );
}