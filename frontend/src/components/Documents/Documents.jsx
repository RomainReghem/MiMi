import PDFSender from "../Documents/PDFSender"
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast, Tooltip, Text, Button, useDisclosure, ModalOverlay, Modal, ModalHeader, ModalCloseButton, ModalContent, ModalBody, ModalFooter, Input, IconButton, Wrap, Stack, Center, Heading, useBreakpointValue, Editable, EditablePreview, EditableInput, useEditableControls, Badge, Kbd } from "@chakra-ui/react";
import PDFViewer from "../Documents/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faXmark, faPencil, faEye } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import useGetStudents from "../../hooks/useGetStudents";


const Documents = () => {
    // Hooks
    const { auth } = useAuth();
    const toast = useToast();
    const axiosPrivate = useAxiosPrivate();
    const { onOpen, onClose, isOpen } = useDisclosure()

    const getStudents = useGetStudents();
    const [students, setStudents] = useState([]);

    // Tableau de tous les noms des fichiers 
    const [myFiles, setMyFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState();

    const [menuSelection, setMenuSelection] = useState(myFiles);
    const [selectedUI, setSelectedUI] = useState("my");

    // Le fichier actuellement séléctionné dans la liste. On le passera à PDFViewer.
    const [file, setFile] = useState(null);

    const [loadingFiles, setLoadingFiles] = useState(false);
    const [renaming, setRenaming] = useState('')
    const [renamedName, setRenamedName] = useState('')

    let myFilesParams = (auth?.role == "classe" ? { mail: auth?.user, findMail: auth?.user } : { mail: auth?.user, findMail: auth?.user })
    let sharedFilesParams = (auth?.role == "classe" ? { mail: auth?.user, findMail: localStorage.getItem("mailEleve") } : { mail: auth?.user, findMail: auth?.mailclasse })

    let editFileParams;

    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const myFilesResponse = await axiosPrivate.get('files', {
                params: { ...myFilesParams }
            });
            setMyFiles(myFilesResponse.data.files)
            if (selectedUI == "my")
                setMenuSelection(myFilesResponse.data.files)

            // Si la classe possède un élève ou si l'éleve possède une classe, on load aussi les docs partagés
            if (sharedFilesParams.findMail) {
                const sharedFilesResponse = await axiosPrivate.get('files', {
                    params: { ...sharedFilesParams }
                });
                console.log(sharedFilesResponse.data.files)
                setSharedFiles(sharedFilesResponse.data.files)
                if (selectedUI == "shared")
                    setMenuSelection(sharedFilesResponse.data.files)
            }
        }

        catch (error) {
            console.log(error)

        }

        setLoadingFiles(false);
    }

    const deleteFile = async (fileName) => {
        try {
            const response = await axiosPrivate.delete('file', {
                data: { mail: auth?.user, name: fileName },
            });
            loadFiles()
            toast({ title: "Fichier supprimé", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })

        }
        catch (err) {
            console.log(err);
        }
    }

    const editFileName = async (newName, currentName) => {
        if (!newName) {
            return;
        }
        try {
            await axiosPrivate.put('file', JSON.stringify({ mail: auth?.user, newName, currentName }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            toast({ title: "Fichier renommé !", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })
            loadFiles()
            setRenamedName('')
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <Center flexGrow={1}>
            <Wrap spacing={10} p={5} justify={'center'} >
                <Stack spacing={4} w={useBreakpointValue({ base: "xs", md: "md" })}>
                    <Heading fontSize={'2xl'}>Gestion des documents</Heading>
                    <Text fontSize={'xs'} fontFamily={'mono'}><Kbd colorScheme={'green'}>Clic</Kbd> sur le nom d'un document pour le visualiser</Text>
                    <Stack w={'100%'} direction={'row'}>
                        <Tooltip label="Charger les fichiers" fontSize='md' placement="top">
                            <Button onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></Button>
                        </Tooltip>
                        <Button colorScheme={selectedUI == "my" ? 'darkblue' : 'blue'} onClick={() => { setMenuSelection(myFiles); setSelectedUI("my") }}><Text noOfLines={1} fontFamily='heading' fontWeight={'600'} fontSize={'sm'}>Mes documents partagés</Text></Button>
                        <Button colorScheme={selectedUI == "shared" ? 'darkblue' : 'blue'} onClick={() => { setMenuSelection(sharedFiles); setSelectedUI("shared") }}><Text noOfLines={1} fontFamily='heading' fontWeight={'600'} fontSize={'sm'}>Partagés avec moi</Text></Button>
                    </Stack>
                    <Stack w={'100%'} h={'xs'} overflowY="auto" p={1}>
                        {menuSelection?.length > 0 ? Array.from(Array(menuSelection?.length), (e, i) => {
                            return <Stack key={i} direction={'row'} w={'100%'}>

                                <Button w={'100%'} onClick={() => setFile(menuSelection[i])} noOfLines={1}>
                                    {menuSelection[i]}
                                </Button>
                                {selectedUI == "my" && <>
                                    <Tooltip label="Renommer" fontSize='md' placement="top">
                                        <IconButton colorScheme={'teal'} onClick={() => { onOpen(); setRenaming(menuSelection[i]) }} icon={<FontAwesomeIcon icon={faPencil} />}></IconButton>
                                    </Tooltip>
                                    <Tooltip bg={'red.400'} label="Supprimer" fontSize='md' placement="top">
                                        <IconButton colorScheme={'red'} onClick={(e) => { deleteFile(menuSelection[i]) }} icon={<FontAwesomeIcon icon={faXmark} />}></IconButton>
                                    </Tooltip></>}</Stack>
                        }) : <Text fontFamily={'mono'}>Aucun document à charger</Text>}
                    </Stack>
                    <Stack w={'100%'}>
                        <PDFSender reload={loadFiles} />
                    </Stack>
                </Stack>
                <Stack h={'34rem'} overflow={'scroll'} w='xl'>
                    <PDFViewer clickedFile={file} selected={selectedUI} />
                </Stack>
            </Wrap>
            <Modal isOpen={isOpen} onClose={() => {onClose(); setRenamedName('')}} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader noOfLines={1}>Renommer {renaming}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={2}>
                        <Input onChange={(e) => setRenamedName(e.target.value)} placeholder='Nouveau nom' />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => {onClose(); setRenamedName('')}} mr={3}>Cancel</Button>
                        <Button onClick={() => { editFileName(renamedName, renaming); onClose() }} colorScheme='green' >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Center>

    )
}

export default Documents;