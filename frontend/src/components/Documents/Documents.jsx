import PDFSender from "../Documents/PDFSender"
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import { useToast, Tooltip, Text, Button, useDisclosure, Divider, ModalOverlay, Modal, ModalHeader, ModalCloseButton, ModalContent, ModalBody, ModalFooter, Input, IconButton, Wrap, Stack, Center, Heading, useBreakpointValue, Editable, EditablePreview, EditableInput, useEditableControls, Badge, Kbd, Spinner } from "@chakra-ui/react";
import PDFViewer from "../Documents/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faXmark, faPencil, faDownload } from "@fortawesome/free-solid-svg-icons";
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

    const [selectedUI, setSelectedUI] = useState("my");

    // Le fichier actuellement séléctionné dans la liste. On le passera à PDFViewer.
    const [file, setFile] = useState(null);
    // Le fichier à télécharger, on le passe aussi à PDFViewer qui possède les bonnes fonctions pour le faire
    const [fileToDownload, setFileToDownload] = useState(null);
    // Spinner du téléchargement d'un fichier
    const [isDownloading, setIsDownloading] = useState(false);

    const [loadingFiles, setLoadingFiles] = useState(false);
    const [renaming, setRenaming] = useState('')
    const [renamedName, setRenamedName] = useState('')

    useEffect(() => {
        loadFiles()
        if (auth?.role == "classe") {
            getStudents().then((response) => {
                setStudents(response?.eleves)
            })
        }
    }, [])

    useEffect(() => {
        loadFiles()
    }, [students])

    const loadFiles = async () => {
        setLoadingFiles(true);
        try {
            const my = await axiosPrivate.get('files', {
                params: { mail: auth?.user, findMail: auth?.user }
            });

            setMyFiles(my.data.files)

            // Si la classe possède au moins un élève.
            // Promise.all boucle les requêtes axios avec chaque mail d'élève.
            if (students.length > 0) {
                Promise.all(students.map((student) => axiosPrivate.get('files',
                    { params: { mail: auth?.user, findMail: student.courriel } }))).then(
                        ((datas) => {
                            let array = [];
                            datas.map((data, i) =>
                                array.push({ mail: students[i].courriel, files: data.data.files })
                            )
                            setSharedFiles(array)
                            console.log(array)
                        }))
            }
            // Si l'élève possède une classe
            else if (auth?.mailclasse) {
                const shared = await axiosPrivate.get('files', {
                    params: { mail: auth?.user, findMail: auth?.mailclasse }
                });
                setSharedFiles([{ mail: auth?.mailclasse, files: shared.data.files }])
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

    const handleDownloadFinished = () => {
        setIsDownloading(false);
        setFileToDownload(null);
    }

    return (
        <Center flexGrow={1}>
            <Wrap w={'100%'} spacing={10} p={5} justify={'space-evenly'} >
                <Stack spacing={4} w={useBreakpointValue({ base: "xs", md: "md" })}>
                    <Heading fontSize={'2xl'}>Gestion des documents</Heading>
                    <Text fontSize={'xs'} fontFamily={'mono'}><Kbd colorScheme={'green'}>Clic</Kbd> sur le nom d'un document pour le visualiser</Text>
                    <Stack w={'100%'} direction={'row'}>
                        <Tooltip label="Charger les fichiers" fontSize='md' placement="top">
                            <Button onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></Button>
                        </Tooltip>
                        <Button colorScheme={selectedUI == "my" ? 'darkblue' : 'blue'} onClick={() => { setSelectedUI("my") }}><Text noOfLines={1} fontFamily='heading' fontWeight={'600'} fontSize={'sm'}>Mes documents partagés</Text></Button>
                        <Button colorScheme={selectedUI == "shared" ? 'darkblue' : 'blue'} onClick={() => { setSelectedUI("shared") }}><Text noOfLines={1} fontFamily='heading' fontWeight={'600'} fontSize={'sm'}>Partagés avec moi</Text></Button>
                    </Stack>
                    <Stack w={'100%'} h={'xs'} overflowY="auto" p={1}>

                        {selectedUI == "my" &&
                            <>
                                {myFiles?.length > 0 ? Array.from(Array(myFiles?.length), (e, i) => {
                                    return <Stack key={i} direction={'row'} w={'100%'}>
                                        <Button w={'100%'} onClick={() => setFile(myFiles[i])} noOfLines={1}>
                                            {myFiles[i]}
                                        </Button>
                                        <Tooltip label="Télécharger" fontSize='md' placement="top">
                                            <IconButton onClick={() => { setFileToDownload(myFiles[i]); setIsDownloading(true) }} colorScheme={'teal'} icon={isDownloading ? <Spinner size={'xs'} /> : <FontAwesomeIcon icon={faDownload} />} disabled={isDownloading}></IconButton>
                                        </Tooltip>
                                        <Tooltip label="Renommer" fontSize='md' placement="top">
                                            <IconButton colorScheme={'teal'} onClick={() => { onOpen(); setRenaming(myFiles[i]) }} icon={<FontAwesomeIcon icon={faPencil} />}></IconButton>
                                        </Tooltip>
                                        <Tooltip bg={'red.400'} label="Supprimer" fontSize='md' placement="top">
                                            <IconButton colorScheme={'red'} onClick={(e) => { deleteFile(myFiles[i]) }} icon={<FontAwesomeIcon icon={faXmark} />}></IconButton>
                                        </Tooltip>
                                    </Stack>
                                }) : <Text fontFamily={'mono'} fontSize='xs'>Aucun document</Text>} </>
                        }

                        {selectedUI == "shared" &&
                            (sharedFiles?.length > 0 ? sharedFiles.map((stud, i) =>
                                <Stack key={i} w={'100%'} mb={3}>
                                    <Text>Documents de <Badge colorScheme={'blue'}>{stud.mail}</Badge></Text>
                                    {stud.files.length > 0 ? stud.files.map((file, i) =>
                                        <Stack direction={'row'} key={i} w={'100%'}>
                                            <Button w={'100%'} onClick={() => setFile(file)} noOfLines={1}>
                                                {file}
                                            </Button>
                                            <Tooltip label="Télécharger" fontSize='md' placement="top">
                                                <IconButton onClick={() => { setFileToDownload(file); setIsDownloading(true) }} colorScheme={'teal'} icon={isDownloading ? <Spinner size={'xs'} /> : <FontAwesomeIcon icon={faDownload} />} disabled={isDownloading}></IconButton>
                                            </Tooltip>
                                        </Stack>
                                    ) : <Text fontFamily={'mono'} fontSize='xs'>Aucun document</Text>}
                                </Stack>
                            ) : <Text fontFamily={'mono'} fontSize='xs'>Aucun document</Text>)
                        }

                    </Stack>
                    <Stack w={'100%'}>
                        <PDFSender reload={loadFiles} />
                    </Stack>
                </Stack>
                <Stack h={'34rem'} overflow={'scroll'} w='xl'>
                    <PDFViewer clickedFile={file} selected={selectedUI} downloadThis={fileToDownload} onDownloadFinished={handleDownloadFinished} />
                </Stack>
            </Wrap>
            <Modal isOpen={isOpen} onClose={() => { onClose(); setRenamedName('') }} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader noOfLines={1}>Renommer {renaming}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={2}>
                        <Input onChange={(e) => setRenamedName(e.target.value)} placeholder='Nouveau nom' />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => { onClose(); setRenamedName('') }} mr={3}>Cancel</Button>
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