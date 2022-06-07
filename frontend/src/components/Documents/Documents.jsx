import PDFSender from "../Documents/PDFSender"
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast, Tooltip, Text, Button, Container, IconButton, Wrap, Stack, Center, Heading, useBreakpointValue, Editable, EditablePreview, EditableInput, useEditableControls, Badge, Kbd } from "@chakra-ui/react";
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
                data: { mail:auth?.user, name:fileName },
            });
            loadFiles()
            toast({ title: "Fichier supprimé", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })

        }
        catch (err) {
            console.log(err);
        }
    }

    const editFileName = async (newName, currentName) => {
        try {
            console.log(newName, currentName)
            await axiosPrivate.put('file', JSON.stringify({ ...editFileParams, newName, currentName }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            toast({ title: "Fichier modifié", description: "", status: "success", duration: 3000, isClosable: true, position: "top" })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <Center flexGrow={1}>
            <Wrap spacing={10} p={5} justify={'center'} align={'center'}>
                <Stack spacing={4} w={useBreakpointValue({ base: "xs", md: "md" })}>
                    <Heading fontSize={'2xl'}>Gestion des documents</Heading>
                    <Text fontSize={'xs'} fontFamily={'mono'}><Kbd colorScheme={'green'}>Clic</Kbd> sur le nom d'un document pour le renommer</Text>
                    <Stack w={'100%'} direction={'row'}>
                        <Tooltip label="Charger les fichiers" fontSize='md' placement="top">
                            <Button onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></Button>
                        </Tooltip>
                        <Button colorScheme={'blue'} onClick={() => { setMenuSelection(myFiles); setSelectedUI("my") }} style={selectedUI == "my" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}><Text noOfLines={1}>Mes documents partagés</Text></Button>
                        <Button colorScheme={'blue'} onClick={() => { setMenuSelection(sharedFiles); setSelectedUI("shared") }} style={selectedUI == "shared" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}><Text noOfLines={1}>Partagés avec moi</Text></Button>
                    </Stack>
                    <Stack w={'100%'} h={'xs'} overflowY="auto" p={1}>
                        {menuSelection?.length > 0 && Array.from(Array(menuSelection?.length), (e, i) => {
                            return <Stack key={i} direction={'row'} w={'100%'}>

                                <Button w={'100%'} justifyContent={'flex-start'}>
                                    <Text>{menuSelection[i]}</Text>
                                    {/* <Editable defaultValue={menuSelection[i]} noOfLines={1} onSubmit={(e) => { editFileName(e, menuSelection[i]) }}>
                                        <EditablePreview />
                                        <EditableInput />
                                    </Editable> */}
                                </Button>
                                <Tooltip label="Voir le fichier" fontSize='md' placement="top">
                                    <IconButton colorScheme={'gray'} onClick={() => setFile(menuSelection[i])} icon={<FontAwesomeIcon icon={faEye} />}></IconButton>
                                </Tooltip>

                                {selectedUI == "my" ? <>

                                    <Tooltip bg={'red.400'} label="Supprimer le fichier" fontSize='md' placement="top">
                                        <IconButton colorScheme={'red'} onClick={(e) => { deleteFile(menuSelection[i]) }} icon={<FontAwesomeIcon icon={faXmark} />}></IconButton>
                                    </Tooltip></> : <></>}</Stack>
                        })}
                    </Stack>
                    <Stack w={'100%'}>
                        <PDFSender reload={loadFiles} />
                    </Stack>
                </Stack>
                <Stack h={'34rem'} overflow={'scroll'} w='xl'>
                    <PDFViewer clickedFile={file} selected={selectedUI} />
                </Stack>
            </Wrap>
        </Center>

    )
}

export default Documents;