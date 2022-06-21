import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCheck, faPaperPlane, faDoorOpen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Avatar from 'react-nice-avatar';
import Invitations from "./Invitations";
import { useToast, InputGroup, Tooltip, FormLabel, IconButton, Input, InputRightElement, Text, Button, Heading, Stack, Image, InputRightAddon, Divider, Center, Spinner } from "@chakra-ui/react";
import useUserData from "../../hooks/useUserData";
import Compressor from 'compressorjs';

const CHANGEPSEUDO_URL = '/changePseudo';
const PSEUDO_REGEX = /^[A-z0-9-_]{3,24}$/;


const Identity = () => {
    const toast = useToast();
    const { auth, setAuth } = useAuth();
    const { userData, setUserData } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const [mail, setMail] = useState(auth?.user);
    const [newPseudo, setNewPseudo] = useState('');
    const [selectedPicture, setSelectedPicture] = useState(null);

    const [pictureWaitingToBeSent, setPictureWaitingToBeSent] = useState(false);
    const [pictureUploading, setPictureUploading] = useState(false);

    const [picture, setPicture] = useState("");

    useEffect(() => {
        // On reçoit la réponse en Buffer, on le converti en Blob puis en en crée une blob URL pour l'afficher
        // Les URL de blob ne fonctionnent que sur le navigateur du client ou il a été créé. C'est pourquoi on le recrée à chaque fois.
        // Les dataURL en base 64 étaient parfois trop lourdes pour les passer entre composants.
        async function image() {
            let blob = new Blob([new Uint8Array(userData?.image)], { type: 'image/jpg' });
            let url = URL.createObjectURL(blob)
            setPicture(url)
        }
        image();
    }, [userData?.image])

    // Submit du pseudo
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMail(auth?.user);
        if (!PSEUDO_REGEX.test(newPseudo)) {
            toast({ title: "Erreur", description: "Le pseudo doit comporter entre 4 et 24 caractères alphanumériques", status: "error", duration: 5000, isClosable: true, position: "top" })
            return;
        }
        try {
            const response = await axiosPrivate.post(CHANGEPSEUDO_URL,
                JSON.stringify({ mail, newPseudo }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            toast({ title: "Pseudo modifié", description: "Votre nouveau pseudo est : " + newPseudo, status: "success", duration: 5000, isClosable: true, position: "top" })
            // On update directement les userData, afin de ne pas avoir à refresh la page pour constater les changements
            setUserData({
                ...userData,
                pseudo: newPseudo
            })

        } catch (err) {
            if (!err?.response) {
                toast({ title: "Erreur", description: "Pas de réponse du serveur", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else if (err.response?.status === 407 || err.response?.status === 401) {
                toast({ title: "Erreur", description: "Problème d'authentification, reconnectez-vous", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
            else if (err.response?.status === 405) {
                toast({ title: "Erreur", description: "Pseudo incorrect", status: "error", duration: 5000, isClosable: true, position: "top" })
            } else {
                toast({ title: "Erreur", description: "Veuillez rééssayer", status: "error", duration: 5000, isClosable: true, position: "top" })
            }
            return;
        }
    }

    // Selection d'une image
    const handlePictureSelect = (event) => {
        setPictureWaitingToBeSent(true);
        const img = {
            preview: URL.createObjectURL(event.target.files[0]),
            data: event.target.files[0],
        }
        // PNG / JPEG / GIF only
        if (img.data.type != "image/png" && img.data.type != "image/jpeg" && img.data.type != "image/jpg" && img.data.type != "image/gif") {
            toast({ title: "Erreur type de fichier", description: "Les seules images acceptées sont les PNG, JPEG et GIF", status: "error", duration: 5000, isClosable: true, position: "top" })
            return;
        }
        // Fichiers < 10 Mo only
        if (img.data.size > 10_000_000) {
            toast({ title: "Erreur taille de fichier", description: "L'image séléctionnée doit faire moins de 10Mo", status: "error", duration: 5000, isClosable: true, position: "top" })
            return;
        }
        setSelectedPicture(img);
    }

    // Submit de l'image
    const pictureSubmit = async () => {
        setPictureUploading(true)
        console.log(selectedPicture.data)
        // On compresse l'image.
        new Compressor(selectedPicture.data, {
            quality: 0.6, // 0.6 can also be used, but its not recommended to go below.
            success: (compressedResult) => {
                sendImage(new File([compressedResult], selectedPicture.data.name, { type: selectedPicture.data.type }))
                console.log(new File([compressedResult], selectedPicture.data.name, { type: selectedPicture.data.type }))
            },
        });
    }

    const sendImage = async (compressedResult) => {
        try {
            let formData = new FormData()
            formData.append('file', compressedResult);
            formData.append("filename", selectedPicture.data.name);
            formData.append("mail", auth?.user);
            const response = await axiosPrivate.post("/saveImage", formData,
                {
                    headers: { "Content-Type": "image/*" },
                });

            setPictureWaitingToBeSent(false);
            // On update directement les userData, afin de ne pas avoir à refresh la page pour constater les changements
            setUserData({
                ...userData,
                image: response.data.data
            })
            toast({ title: "Image de profil sauvegardée", description: "", status: "success", duration: 5000, isClosable: true, position: "top" })
        } catch (error) {
            toast({ title: "Erreur", description: "Vérifiez le fichier", status: "error", duration: 5000, isClosable: true, position: "top" })
        }
        setPictureUploading(false)
    }

    // On pourrait ici sauvegarder les préférences sur le serveur.
    // Cependant , la solution simple et rapide du LocalStorage convient bien pour cette option peu importante
    const chooseImage = () => {
        setAuth({ ...auth, preference: "image" });
        localStorage.setItem("preference" + auth?.user, JSON.stringify("image"));
        toast({ title: "Profil changé !", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })
    }

    const chooseAvatar = () => {
        setAuth({ ...auth, preference: "avatar" });
        localStorage.setItem("preference" + auth?.user, JSON.stringify("avatar"));
        toast({ title: "Profil changé !", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })
    }

    return (
        <>
            <Stack spacing={4} w={'xs'}>
                <Heading fontSize={'2xl'}>Préférences</Heading>
                <InputGroup>
                    <Input placeholder='Nouveau pseudo' _focus={{ outline: 'none' }} onChange={(e) => setNewPseudo(e.target.value)} />
                    <InputRightElement>
                        <IconButton colorScheme={"green"} borderRadius={'0px 5px 5px 0px'} _focus={{ outline: 'none' }} onClick={handleSubmit} icon={<FontAwesomeIcon icon={faCheck} />}>
                        </IconButton>
                    </InputRightElement>
                </InputGroup>

                <Divider />

                <Stack direction={'row'} justify={'space-between'}>
                    <Stack align={'center'}>
                        <Image boxSize={'8.5rem'} objectFit={'cover'} src={picture}></Image>
                        <Button onClick={chooseImage} w="16ch" disabled={auth?.preference == 'image'} noOfLines='1'>Choisir l'image</Button>
                    </Stack>
                    <Stack align={'center'}>
                        <Avatar style={{ width: '8.5rem', height: '8.5rem' }}  {...userData?.avatar} />
                        <Button onClick={chooseAvatar} disabled={auth?.preference == 'avatar'}>Choisir l'avatar</Button>
                    </Stack>
                </Stack>

                <Stack w={'100%'} spacing={0} direction={'row'}>
                    <Input type="file" display={'none'} id="picture" onChange={handlePictureSelect} />
                    <FormLabel w={'90%'} htmlFor="picture" border={'0.5px solid'} borderRight={'none'} cursor={'pointer'} borderRadius={'3px 0px 0px 3px'}>
                        <Center h={'100%'}>
                            <FontAwesomeIcon icon={faUpload} />
                            <Text display={'inline'} fontFamily={'body'} ml={2}>{selectedPicture?.data && pictureWaitingToBeSent ? (selectedPicture?.data.name).substring(0, 10) + "..." : "Importer une image"}</Text>
                        </Center>
                    </FormLabel>
                    <Tooltip bg={'green.400'} label="Valider l'image" fontSize='md' placement="top">
                        <IconButton borderRadius={'0px 3px 3px 0px'} colorScheme={"green"} onClick={(e) => { !pictureUploading && pictureSubmit(e) }}>
                            {pictureUploading ? <Spinner size={'xs'} /> : <FontAwesomeIcon icon={faPaperPlane} bounce={pictureWaitingToBeSent ? true : false} />}
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Divider />
                <Invitations />
            </Stack>
        </>
    );
}
export default Identity;