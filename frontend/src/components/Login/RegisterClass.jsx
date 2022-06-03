import { Flex, Box, useToast, FormControl, FormLabel, Input, InputGroup, HStack, FormErrorMessage, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, FormHelperText, } from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from '../../api/axios'

export default function RegisterClass() {
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();

    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const REGISTER_URL = '/registerClass';

    const navigate = useNavigate();

    const [mail, setMail] = useState('');
    const [validMail, setValidMail] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);

    useEffect(() => {
        setValidMail(MAIL_REGEX.test(mail));
    }, [mail])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const v2 = MAIL_REGEX.test(mail);
        const v1 = PWD_REGEX.test(pwd);
        if (!v2) {
            toast({ title: "Erreur", description: "Mail incorrect", status: "error", duration: 3000, isClosable: true, position: "top" })
            return;
        }
        if (!v1) {
            toast({ title: "Erreur", description: "Mot de passe incorrect", status: "error", duration: 3000, isClosable: true, position: "top" })
            return;
        }

        if (!validMatch) {
            toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", status: "error", duration: 5000, isClosable: true, position: "top" })
            return
        }

        handleRegister();
    }

    const handleRegister = async () => {

        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ mail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            setPwd('');
            setMatchPwd('');
            navigate("/login")
            toast({ title: "Inscription réussie", description: "Connectez-vous avec vos identifiants", status: "success", duration: 5000, isClosable: true, position: "top" })
        } catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position: "top" })

            } else if (err.response?.status === 409) {
                toast({ title: "Erreur", description: "Un compte est déjà associé à cette adresse mail", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
            else if (err.response?.status === 411) {
                toast({ title: "Erreur", description: "Un compte d'élève est déjà associé à cette adresse mail", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Veuillez rééssayer", status: "error", duration: 5000, isClosable: true, position: "top" })

            }
        }
    }

    return (
        <Flex
            grow={1}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={6} mx={'auto'} w={'lg'} py={6} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'3xl'} textAlign={'center'}>
                        S'inscrire
                    </Heading>
                    <Text fontSize={'md'} color={'gray.500'}>
                        Formulaire d'inscription de la classe
                    </Text>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <FormControl id="email" isInvalid={mail && !validMail} isRequired>
                            <FormLabel>Mail</FormLabel>
                            <Input type="email" onChange={(e) => setMail(e.target.value)} />
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
                            <FormHelperText>Entre 8 et 24 caractères, majuscule et caractère spécial (!@#$%) obligatoires</FormHelperText>
                        </FormControl>

                        <FormControl id="confirm-password" isInvalid={matchPwd && !validMatch} isRequired>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <InputGroup>
                                <Input type={showPassword ? 'text' : 'password'} onChange={(e) => setMatchPwd(e.target.value)} />
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
                                Inscription
                            </Button>
                        </Stack>
                        <Stack>
                            <Text align={'center'}>
                                Vous avez déjà un compte ? <Link color={'blue.400'} as={ReactRouterLink} to="/login">Se connecter</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}