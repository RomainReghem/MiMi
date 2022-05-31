import PDFSender from "../components/PDFSender"
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useToast, Tooltip, Text, Button, IconButton, Wrap, Stack, Center, Heading, useBreakpointValue } from "@chakra-ui/react";
import PDFViewer from "../components/PDFViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faXmark } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";


const Documents = () => {
    // Hooks
    const { auth } = useAuth();
    const toast = useToast();
    const axiosPrivate = useAxiosPrivate();


    // Tableau de tous les noms des fichiers 
    const [myFiles, setMyFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);

    const [menuSelection, setMenuSelection] = useState(myFiles);
    const [selectedUI, setSelectedUI] = useState("my");

    // Le fichier actuellement séléctionné dans la liste. On le passera à PDFViewer.
    const [file, setFile] = useState(null);

    const [loadingFiles, setLoadingFiles] = useState(false);

    let myFilesURL = (auth?.role == "classe" ? "/getCoursClass" : "/getCours");
    let sharedFilesURL = (auth?.role == "classe" ? "/getCours" : "/getCoursClass");
    let myFilesParams = (auth?.role == "classe" ? { id: auth?.idclasse, cours: "maths" } : { mail: auth?.user, cours: "maths" })
    let sharedFilesParams = (auth?.role == "classe" ? { mail: localStorage.getItem("mailEleve"), cours: "maths" } : { id: auth?.idclasse, cours: "maths" })
    let deleteParams;
    let deleteFileURL;

    if (auth?.role == "classe") {
        deleteFileURL = "/coursClasse";
        deleteParams = { id: auth?.idclasse, matiere: "maths" }

    } else if (auth?.role == "eleve") {
        deleteFileURL = "/coursEleve";
        deleteParams = { mail: auth?.user, matiere: "maths" }
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

    return (
        <Center flexGrow={1}>
        <Wrap spacing={10} p={5} justify={'center'} align={'center'}>
            <Stack spacing={4} w={useBreakpointValue({base:"xs", md:"md"})}>
                <Heading fontSize={'2xl'}>Gestion des documents</Heading>
                <Stack w={'100%'} direction={'row'}>
                <Tooltip bg={'blue.500'} label="Charger les fichiers" fontSize='md' placement="top">
                    <Button onClick={loadFiles}><FontAwesomeIcon className="fileRefresh" icon={faRotate} spin={loadingFiles} /></Button>
                </Tooltip>
                <Button colorScheme={'blue'} onClick={() => { setMenuSelection(myFiles); setSelectedUI("my") }} style={selectedUI == "my" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}><Text noOfLines={1}>Mes documents partagés</Text></Button>
                <Button colorScheme={'blue'} onClick={() => { setMenuSelection(sharedFiles); setSelectedUI("shared") }} style={selectedUI == "shared" ? ({ textDecoration: "underline" }) : ({ textDecoration: "none" })}><Text noOfLines={1}>Partagés avec moi</Text></Button>
                </Stack>
                <Stack w={'100%'} h={'xs'} overflowY="auto" p={1}>
                    {Array.from(Array(menuSelection?.length), (e, i) => {
                        return <Stack key={i} direction={'row'} w={'100%'}><Button w={'100%'} justifyContent={'flex-start'} onClick={() => setFile(menuSelection[i])}><Text noOfLines={1}>{menuSelection[i]}</Text></Button>
                            {selectedUI == "my" ? <IconButton colorScheme={'red'} onClick={(e) => { deleteFile(menuSelection[i]); e.stopPropagation() }}><FontAwesomeIcon icon={faXmark} /></IconButton> : <></>}</Stack>
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