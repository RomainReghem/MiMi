import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useToast,Stack, Center, FormControl, FormLabel, Input, Button, Text } from "@chakra-ui/react";

const PDFSender = (props) => {
    const toast = useToast()
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileWaitingToBeSent, setFileWaitingToBeSent] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    let saveFileURL = (auth?.role == "classe" ? "/saveFileClass" : "/saveFile");

    const handleSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData();
        // PDF only
        if (selectedFile.type != "application/pdf") {
            toast({ title: "Erreur de type de fichier", description: "Les seuls fichier acceptés sont les PDF", status: "error", duration: 3000, isClosable: true, position: "top" })
            return;
        }
        // Fichiers < 10 Mo
        if (selectedFile.size > 10_000_000) {
            toast({ title: "Erreur de taille de fichier", description: "Le fichier séléctionné doit faire moins de 10Mo", status: "error", duration: 3000, isClosable: true, position: "top" })
            return;
        }
        formData.append("file", selectedFile);
        formData.append("filename", selectedFile.name);
        formData.append("mail", auth?.user)
        console.log(selectedFile.name);
        try {
            const response = await axiosPrivate.post('file', {formData, mail:auth?.user},
                {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            toast({ title: "Fichier sauvegardé", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })

            // Pour l'UI on remet fileWaitingToBeSent à false
            setFileWaitingToBeSent(false);

            // On appelle LoadFiles pour actualiser les fichiers dans l'UI
            props.reload();

        } catch (error) {
            console.log(error)
        }
    }

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileWaitingToBeSent(true);
    }

    return (
            <Stack direction={"row"} spacing={'none'}>
            <Input type="file" display={'none'} id="file" onChange={handleFileSelect} />
            <FormLabel w={'75%'} p={1} htmlFor="file" border={'1px solid'} borderRight={'none'} cursor={'pointer'} borderRadius={'3px 0px 0px 3px'}>
                <Center h={'100%'}>
                    <FontAwesomeIcon icon={faUpload}/>
                    <Text display={'inline'} ml={2} noOfLines={1}>{fileWaitingToBeSent ? selectedFile?.name : "Choisir un fichier"}</Text>
                </Center>
            </FormLabel>
            <Button w={'25%'} borderRadius={'0px 3px 3px 0px'} onClick={handleSubmit} colorScheme={'green'} disabled={fileWaitingToBeSent ? false : true} leftIcon={<FontAwesomeIcon icon={faPaperPlane} bounce={fileWaitingToBeSent ? true : false} />}>
                <Text display={{base:'none', md:'inline'}}>Envoyer</Text>
            </Button>
            </Stack>
    )
};

export default PDFSender;