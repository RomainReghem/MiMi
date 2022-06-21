import { Center, Box, FormControl, FormHelperText, Input, InputGroup, Spinner, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from '../../api/axios'

export default function PwdReset() {
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [displaySpinner, setDisplaySpinner] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pwd, setPwd] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!PWD_REGEX.test(pwd)) {
            toast({ title: "Mot de passe invalide", description: "Le mot de passe doit comporter entre 8 et 24 caractères, majuscule et caractère spécial (!@#$%) obligatoires", status: "error", duration: 5000, isClosable: true, position: "top" })
            return;
        }
        
        let token = searchParams.get("token")
        setDisplaySpinner(true)
        try {
            const response = await axios.post('/resetPwd', JSON.stringify({ pwd, token }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            toast({ title: "Mot de passe modifié !", description: "Reconnectez-vous", status: "success", duration: 5000, isClosable: true, position: "top" })
            navigate('/login')


        } catch (err) {
            setDisplaySpinner(false)
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 4000, isClosable: true, position: "top" })
            } else if (err.response?.status === 400) {
                toast({ title: "Erreur", description: "Mot de passe erroné", status: "error", duration: 4000, isClosable: true, position: "top" })

            }
        }
    }

    return (
        <Center flexGrow={1}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={6} mx={'auto'} w={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'3xl'} textAlign={'center'}>
                        Nouveau mot de passe
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <Text fontFamily={'mono'} align='center'>Entrez votre nouveau mot de passe</Text>
                        <FormControl id="password" isRequired>
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
                                    displaySpinner ? <Spinner /> : 'Réinitialiser'
                                }
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Center>
    );
}