import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FormHelperText, useToast } from "@chakra-ui/react";
import { Heading, Stack, Input, Button, IconButton, InputGroup, InputRightElement, Text, FormControl, FormErrorMessage } from "@chakra-ui/react"
import { ViewIcon, ViewOffIcon, CheckIcon } from '@chakra-ui/icons';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;


const ChangePwd = () => {

    const { auth } = useAuth();
    const toast = useToast();
    const axiosPrivate = useAxiosPrivate();
    const [showPassword, setShowPassword] = useState(false);
    const CHANGEPWD_URL = auth?.role == "eleve" ? '/changePwdEleve' : "/changePwdClasse" ;


    const [mail, setMail] = useState(auth?.user);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [newPwd, setNewPwd] = useState('');
    const [validNewPwd, setValidNewPwd] = useState(false);
    const [newPwdFocus, setNewPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setValidNewPwd(PWD_REGEX.test(newPwd));
        setValidMatch(newPwd === matchPwd);
    }, [newPwd, matchPwd]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
    }, [pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);
        
        
        if (!PWD_REGEX.test(newPwd)) {
            setErrMsg("Invalid Entry");
            return;
        }
        
        try {
            console.log("Voici le mail :" + auth?.user)
            const response = await axiosPrivate.post(CHANGEPWD_URL,
                JSON.stringify({ mail, pwd, newPwd }),
                {
                    params:{
                        mail:mail
                    },
                    headers: { 'Content-Type': 'application/json' },
                }
            );  
            toast({ title: "Mot de passe modifié", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })

        } catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 3000, isClosable: true, position: "top" })
            } else if (err.response?.status === 400) {
                toast({ title: "Erreur", description: "Mot de passe actuel erroné", status: "error", duration: 3000, isClosable: true, position: "top" })
            } 
            else if (err.response?.status === 404) {
                toast({ title: "Erreur", description: "Problème d'authentification, reconnectez-vous", status: "error", duration: 3000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Veuillez réessayer", status: "error", duration: 3000, isClosable: true, position: "top" })
            }
        }
    }

    return (
        <Stack spacing={4}>
            <Heading fontSize={'2xl'}>Changer de mot de passe</Heading>

            <InputGroup mb={2}>
                    <Input placeholder="Mot de passe actuel" type={showPassword ? 'text' : 'password'} onChange={(e) => setPwd(e.target.value)} />
                    <InputRightElement h={'full'}>
                        <Button
                        _focus={{outline:"none"}}
                            variant={'ghost'}
                            onClick={() =>
                                setShowPassword((showPassword) => !showPassword)
                            }>
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>

            <FormControl isInvalid={matchPwd && !validMatch}>
                <InputGroup mb={2}>
                    <Input placeholder="Nouveau mot de passe" type={showPassword ? 'text' : 'password'} onChange={(e) => setNewPwd(e.target.value)} />
                    <InputRightElement h={'full'}>
                        <Button
                        _focus={{outline:"none"}}
                            variant={'ghost'}
                            onClick={() =>
                                setShowPassword((showPassword) => !showPassword)
                            }>
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <FormHelperText p={1} mb={3}>Entre 8 et 24 caractères, majuscule et caractère spécial (!@#$%) obligatoires</FormHelperText>

                <InputGroup mb={2}>
                    <Input placeholder="Confirmer nouveau mot de passe" type={showPassword ? 'text' : 'password'} onChange={(e) => setMatchPwd(e.target.value)} />
                    <InputRightElement h={'full'}>
                        <Button
                        _focus={{outline:"none"}}
                            variant={'ghost'}
                            onClick={() =>
                                setShowPassword((showPassword) => !showPassword)
                            }>
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <FormErrorMessage>Les nouveaux mots de passe ne correspondent pas !</FormErrorMessage>
                </FormControl>

                {validNewPwd && validMatch ? 
                <Button onClick={handleSubmit} colorScheme={'blue'} leftIcon={<CheckIcon/>}>Valider</Button>
                :
                <Button colorScheme={'blue'} disabled><Text noOfLines={1} >Veuillez entrer un mot de passe valide</Text></Button>
            }
        </Stack> 
    );
}

export default ChangePwd;