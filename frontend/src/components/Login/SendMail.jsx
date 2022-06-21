import { Center, Box, FormControl, FormLabel, Input, InputGroup, Spinner, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link, } from '@chakra-ui/react';
import { createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from '../../api/axios'

export default function PwdReset() {
    const toast = useToast();

    const [displaySpinner, setDisplaySpinner] = useState(false);
    const [mail, setMail] = useState('')
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(mail)
        setDisplaySpinner(true)
        try {
            const response = await axios.post('/sendMail', JSON.stringify({ mail }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            
            toast({ title: "Mail envoyé", description: "Cliquez sur le lien présent dans le mail", status: "success", duration: 5000, isClosable: true, position: "top" })

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
                        Réinitialisation
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <Text fontFamily={'mono'} align='center'>Un mail va vous être envoyé avec un lien permettant de réinitialiser votre mot de passe</Text>
                        <FormControl id="email" isRequired>
                            <FormLabel>Mail</FormLabel>
                            <Input type="email" onChange={(e) => setMail(e.target.value)} />
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
                                 displaySpinner ? <Spinner/> : 'Envoyer'
                                }
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Center>
    );
}