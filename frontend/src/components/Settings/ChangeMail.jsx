import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "@chakra-ui/react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Heading, Stack, Input, Button, IconButton, InputGroup, InputRightElement, Badge, Text } from "@chakra-ui/react"
import { ViewIcon, ViewOffIcon, CheckIcon } from '@chakra-ui/icons';
import useLogout from "../../hooks/useLogout";

const MAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const LOGIN_URL = '/login';


const ChangeMail = () => {
    const logout = useLogout();
    const toast = useToast();
    const { auth } = useAuth();
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [showPassword, setShowPassword] = useState(false);
    const CHANGEMAIL_URL = auth?.role == "eleve" ? '/changeMailEleve' : "/changeMailClasse";

    const [mail, setMail] = useState(auth?.user);

    const newMailRef = useRef();
    const [newMail, setnewMail] = useState('');
    const [validnewMail, setValidnewMail] = useState(false);

    const [pwd, setPwd] = useState('');
    const [pwdFocus, setPwdFocus] = useState(false);

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setValidnewMail(MAIL_REGEX.test(newMail));
    }, [newMail])

    useEffect(() => {
        setErrMsg('');
    }, [newMail, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);

        if (!MAIL_REGEX.test(newMail)) {
            setErrMsg("Invalid Entry");
            return;
        }

        try {
            const response = await axiosPrivate.post(CHANGEMAIL_URL,
                JSON.stringify({ mail, newMail, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            if(response.status == 204){
                toast({ title: "Mail inchangé", description: "Ce mail est déjà votre mail actuel :" + newMail, status: "warning", duration: 3000, isClosable: true, position: "top" })
                return;
            }
            setMail(newMail);
            toast({ title: "Mail modifié !", description: "Votre nouvelle adresse mail est : " + newMail, status: "success", duration: 3000, isClosable: true, position: "top" })
            logout();

        } catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 3000, isClosable: true, position: "top" })
            } else if (err.response?.status === 407) {
                toast({ title: "Erreur", description: "Mauvais format de mail", status: "error", duration: 3000, isClosable: true, position: "top" })
            } else if (err.response?.status === 406) {
                toast({ title: "Erreur", description: "Mot de passe invalide", status: "error", duration: 3000, isClosable: true, position: "top" })
            }
            else if (err.response?.status === 400) {
                toast({ title: "Erreur", description: "Mauvais mot de passe", status: "error", duration: 3000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Veuillez réessayer", status: "error", duration: 3000, isClosable: true, position: "top" })
            }
            errRef.current.focus();
            return;
        }
    }

    return (
        <Stack spacing={4}>
            <Heading fontSize={'2xl'}>Changer d'adresse mail</Heading>
            <Text fontFamily={'mono'} fontSize={'xs'}>Vous devrez vous reconnecter après le changement de mail</Text>
            <Input mb={2} placeholder="Nouveau mail" onChange={(e) => setnewMail(e.target.value)} />
            <InputGroup mb={2}>
                <Input placeholder="Mot de passe actuel" type={showPassword ? 'text' : 'password'} onChange={(e) => setPwd(e.target.value)} />
                <InputRightElement h={'full'}>
                    <Button
                        _focus={{ outline: "none" }}
                        variant={'ghost'}
                        onClick={() =>
                            setShowPassword((showPassword) => !showPassword)
                        }>
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                </InputRightElement>
            </InputGroup>
            {validnewMail ?
                <Button onClick={handleSubmit} colorScheme={'blue'} leftIcon={<CheckIcon />}>Valider</Button>
                :
                <Button colorScheme={'blue'} disabled><Text noOfLines={1} >Veuillez entrer un mail valide</Text></Button>
            }
        </Stack>


    );

}

export default ChangeMail;