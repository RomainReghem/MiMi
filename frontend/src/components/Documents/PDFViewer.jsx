import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react"
import { Text, Spinner, Center, AlertIcon, Alert } from "@chakra-ui/react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = (props) => {

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [numPages, setNumPages] = useState(null);
    const [file, setFile] = useState(null);

    // Spinner du chargement d'un fichier
    const [displaySpinner, setDisplaySpinner] = useState(false)

    let parameters;

    if (props.selected == "my") {
        parameters = { findMail: auth?.user }

    } else if (auth?.role == "classe" && props.selected == "shared") {
        parameters = { findMail: localStorage.getItem("mailEleve") }

    } else if (auth?.role == "eleve" && props.selected == "shared") {
        parameters = { findMail: auth?.mailclasse }
    }


    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log("success")
        setNumPages(numPages);
    }

    useEffect(() => {
        async function convertingFile() {
            setFile(null)
            setDisplaySpinner(true)

            // On convertit le Buffer en Blob pour pouvoir l'afficher
            let data = await getFile(props.clickedFile)
            let blob = new Blob([new Uint8Array(data)], { type: 'pdf' });
            setFile(URL.createObjectURL(blob))

            setDisplaySpinner(false)
        }
        if (props.clickedFile)
            convertingFile();
    }, [props.clickedFile])

    const getFile = async (filename) => {
        try {
            const response = await axiosPrivate.get('file', {
                params: { ...parameters, mail: auth?.user, name: filename },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            return response.data.file.data;

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        props.downloadThis && downloadFile(props.downloadThis)
    }, [props.downloadThis])

    const downloadFile = async (filename) => {
        console.log('starting')
        let data = await getFile(filename)
        console.log('got file !')
        let blob = new Blob([new Uint8Array(data)], { type: 'pdf' });
        let url = URL.createObjectURL(blob);
        let tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.setAttribute('download', `${filename}`);
        tempLink.click();

        // On callback le parent pour stopper le spinner
        props.onDownloadFinished();
    }


    return (
        <>
            {file ?
                (<Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(Array(numPages), (e, i) => {
                        return <Page width={600} key={i} pageNumber={i + 1} />
                    })}
                </Document>)
                : displaySpinner ?
                    <Alert status='info' justifyContent='center'>
                        <Spinner mr={3} />
                        Chargement du fichier...
                    </Alert> :

                    <Alert status='info' justifyContent='center'>
                        <AlertIcon />
                        Cliquez sur un document pour le visualiser ici !
                    </Alert>
            }

        </>
    );
}

export default PDFViewer;