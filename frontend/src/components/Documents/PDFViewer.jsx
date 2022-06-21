import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react"
import { Text, Spinner, Center, AlertIcon, Alert, Link } from "@chakra-ui/react";
import { useRef } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = (props) => {

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [numPages, setNumPages] = useState(null);
    const [file, setFile] = useState(null);

    const [urlToDownload, setUrlToDownload] = useState(null)
    const [fileNameToDownload, setFileNameToDownload] = useState('')
    const downloadRef = useRef(null)

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
        let data = await getFile(filename)
        let blob = new Blob([new Uint8Array(data)], { type: 'pdf' });
        let url = URL.createObjectURL(blob);
        setUrlToDownload(url)
        setFileNameToDownload(filename)
        // (1)
        // On callback le parent pour stopper le spinner
        props.onDownloadFinished();
    }

    // useState est asynchrone, s'il y a changement d'url c'est forcément qu'on est passés par download file
    // mais le state ne sera pas encore update si on clique au (1). Obligé d'utiliser un useEffect pour écouter.
    useEffect(() => {
        urlToDownload && downloadRef.current.click();
    }, [urlToDownload])


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
            <Link href={urlToDownload} ref={downloadRef} display='none' download={fileNameToDownload}></Link>

        </>
    );
}

export default PDFViewer;