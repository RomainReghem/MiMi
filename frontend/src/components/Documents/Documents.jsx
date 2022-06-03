import PDFSender from "../Documents/PDFSender"
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast, Tooltip, Text, Button, IconButton, Wrap, Stack, Center, Heading, useBreakpointValue, Editable, EditablePreview, EditableInput, useEditableControls, Badge, Kbd } from "@chakra-ui/react";
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

    let myFilesURL = (auth?.role == "classe" ? "/getCoursClass" : "/getCours");
    let sharedFilesURL = (auth?.role == "classe" ? "/getCours" : "/getCoursClass");
    let myFilesParams = (auth?.role == "classe" ? { id: auth?.idclasse } : { mail: auth?.user })
    let sharedFilesParams = (auth?.role == "classe" ? { mail: localStorage.getItem("mailEleve") } : { id: auth?.idclasse })

    let deleteParams;
    let deleteFileURL;
    let editFileURL;
    let editFileParams;

    if (auth?.role == "classe") {
        deleteFileURL = "/coursClasse";
        editFileURL = "/editFileClasse"
        editFileParams = { id: auth?.idclasse }
        deleteParams = { id: auth?.idclasse }

    } else if (auth?.role == "eleve") {
        deleteFileURL = "/coursEleve";
        editFileURL = "/editFileEleve"
        editFileParams = { mail: auth?.user }
        deleteParams = { mail: auth?.user }
    }

    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const myFilesResponse = await axiosPrivate.get(myFilesURL, {
                params: { ...myFilesParams }
            });
            setMyFiles(myFilesResponse.data.files)
            if (selectedUI == "my")
                setMenuSelection(myFilesResponse.data.files)

            // Si la classe possède un élève ou si l'éleve possède une classe, on load aussi les docs partagés
            if (sharedFilesParams.id || sharedFilesParams.mail) {
                const sharedFilesResponse = await axiosPrivate.get(sharedFilesURL, {
                    params: { ...sharedFilesParams }
                });
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


    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    const deleteFile = async (f) => {
        try {
            const response = await axiosPrivate.delete(deleteFileURL, {
                data: { ...deleteParams, cours: f },
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
            await axiosPrivate.post(editFileURL, JSON.stringify({ ...editFileParams, newName, currentName }),
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
                                    <Editable defaultValue={menuSelection[i]} noOfLines={1} onSubmit={(e) => { editFileName(e, menuSelection[i]) }}>
                                        <EditablePreview />
                                        <EditableInput />
                                    </Editable>
                                </Button>

                                {selectedUI == "my" ? <>
                                    <Tooltip label="Voir le fichier" fontSize='md' placement="top">
                                        <IconButton colorScheme={'gray'} onClick={() => setFile(menuSelection[i])} icon={<FontAwesomeIcon icon={faEye} />}></IconButton>
                                    </Tooltip>

                                    <Tooltip bg={'red.400'} label="Supprimer le fichier" fontSize='md' placement="top">
                                        <IconButton colorScheme={'red'} onClick={(e) => { deleteFile(menuSelection[i]) }} icon={<FontAwesomeIcon icon={faXmark} />}></IconButton>
                                    </Tooltip></> : <></>}</Stack>
                        })}
                    </Stack>
                    <Stack w={'100%'}>
                        <PDFSender reload={loadFiles} />
                    </Stack>
                </Stack>
                <section className="fileViewer">
                    <PDFViewer clickedFile={file} selected={selectedUI} />
                </section>
            </Wrap>
        </Center>

    )
}

export default Documents;