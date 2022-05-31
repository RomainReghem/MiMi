import { Flex, Box, FormControl, FormErrorMessage, useToast, FormLabel, Input, InputGroup, HStack, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, } from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {createSearchParams, useNavigate } from 'react-router-dom'
import {useState, useEffect } from 'react';
import axios from '../../api/axios'

export default function RegisterStudent() {
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();

    const USER_REGEX = /^[A-z0-9-_]{3,24}$/;
    const NAME_REGEX = /^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$/;
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const REGISTER_URL = '/registerStudent';

    const navigate = useNavigate();

    const [user, setUser] = useState('');
    const [validUser, setvalidUser] = useState(false);

    const [name, setName] = useState('');
    const [validName, setValidName] = useState(false);

    const [mail, setMail] = useState('');
    const [validMail, setValidMail] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [validFirstName, setValidFirstName] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);

    useEffect(() => {
        setvalidUser(USER_REGEX.test(user));
    }, [user])


    useEffect(() => {
        setValidName(NAME_REGEX.test(name));
    }, [name])

    useEffect(() => {
        setValidFirstName(NAME_REGEX.test(firstName));
    }, [firstName])

    useEffect(() => {
        setValidMail(MAIL_REGEX.test(mail));
    }, [mail])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        // recheck les pwd et user in case of JS hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        const v3 = MAIL_REGEX.test(mail);
        const v4 = NAME_REGEX.test(name)
        const v5 = NAME_REGEX.test(firstName)
        if (!v1 || !v2 || !v3 || !v4 || !v5) {
            toast({title: "Erreur", description: "Au moins un champ est invalide", status: "error", duration: 5000, isClosable: true, position:"top"})

            return;
        }

        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, firstName, name, mail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(response?.data);
            console.log(response?.accessToken);
            console.log(JSON.stringify(response))
            localStorage.setItem("pseudo", user);
            setUser('');
            setPwd('');
            setMatchPwd('');
            navigate("/login")
            toast({title: "Inscription réussie", description: "Connectez-vous avec vos identifiants", status: "success", duration: 5000, isClosable: true, position:"top"})

        } catch (err) {
            if (!err?.response) {
                toast({title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position:"top"})
            } else if (err.response?.status === 409) {
                toast({title: "Erreur", description: "Un compte est déjà associé à cette adresse mail", status: "error", duration: 5000, isClosable: true, position:"top"})
            }
            else if (err.response?.status === 410) {
                toast({title: "Erreur", description: "Un compte de classe est déjà associé à cette adresse mail", status: "error", duration: 5000, isClosable: true, position:"top"})
            } else {
                toast({title: "Erreur", description: "Veuillez rééssayer", status: "error", duration: 5000, isClosable: true, position:"top"})
            }
        }
    }

    return (
        <Flex
            grow={1}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={6} mx={'auto'} maxW={'lg'} py={6} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'3xl'} textAlign={'center'}>
                        S'inscrire
                    </Heading>
                    <Text fontSize={'md'} color={'gray.500'}>
                        Formulaire d'inscription de l'élève à distance
                    </Text>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <HStack>
                            <Box>
                                <FormControl id="firstName" isRequired>
                                    <FormLabel>Prénom</FormLabel>
                                    <Input type="text" onChange={(e) => setFirstName(e.target.value)}/>
                                </FormControl>
                            </Box>
                            <Box>
                                <FormControl id="lastName" isRequired>
                                    <FormLabel>Nom</FormLabel>
                                    <Input type="text" onChange={(e) => setName(e.target.value)}/>
                                </FormControl>
                            </Box>
                        </HStack>
                        <FormControl id="email" isRequired>
                            <FormLabel>Mail</FormLabel>
                            <Input type="email" onChange={(e) => setMail(e.target.value)}/>
                        </FormControl>
                        <FormControl id="pseudo" isRequired>
                            <FormLabel>Pseudo</FormLabel>
                            <Input type="text" onChange={(e) => setUser(e.target.value)}/>
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

                        <FormControl id="confirm-password" isInvalid={matchPwd && !validMatch} isRequired>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <InputGroup>
                                <Input type={showPassword ? 'text' : 'password'} onChange={(e) => setMatchPwd(e.target.value)}/>
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
                            <FormErrorMessage>Les mots de passe ne correspondent pas</FormErrorMessage>
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
                                Sign up
                            </Button>
                        </Stack>
                        <Stack>
                            <Text align={'center'}>
                                Vous avez déjà un compte ? <Link color={'blue.400'} as={ReactRouterLink} to="/login">Login</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}