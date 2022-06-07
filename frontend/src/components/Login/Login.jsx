import { Flex, Box, FormControl, FormLabel, Input, InputGroup, HStack, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Link as ReactRouterLink } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from '../../api/axios'
import useAuth from '../../hooks/useAuth'
import useUserData from '../../hooks/useUserData';


const LOGIN_URL = '/login';

export default function Login() {
    const toast = useToast();
    const { setAuth } = useAuth();
    const { setUserData } = useUserData();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            const accessToken = response?.data?.accessToken;
            const role = response?.data?.role;
            const invitation = response?.data?.invitation;
            const idclasse = response?.data?.idclasse;
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
                setUserData({ image, avatar, pseudo })
            }

            setPwd('');
            setUser('');
            toast({ title: "Bienvenue !", description: "Vous êtes connecté", status: "success", duration: 9000, isClosable: true, position: "top" })
            navigate("/profile");


        } catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else if (err.response?.status === 400) {
                toast({ title: "Erreur", description: "Mot de passe erroné", status: "error", duration: 5000, isClosable: true, position: "top" })

            } else if (err.response?.status === 401) {
                toast({ title: "Erreur", description: "Adresse mail inconnue", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
            else if (err.response?.status === 402) {
                toast({ title: "Erreur", description: "Remplissez tous les champs", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Erreur", status: "error", duration: 3000, isClosable: true, position: "top" })

            }
        }
    }

    return (
        <Flex
            grow={1}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={8} mx={'auto'} w={'md'} py={12} px={6}>
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
                                Connexion
                            </Button>                            
                        </Stack>
                        <Text align={'center'} >Pas encore de compte ? <Link to="/choice" as={ReactRouterLink} color={'cyan.600'}>S'inscrire</Link></Text>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}