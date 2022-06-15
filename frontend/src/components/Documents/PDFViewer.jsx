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
            let data = await getFile()
            let binary = '';
            let bytes = new Uint8Array(data)
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            let b64 = window.btoa(binary)
            let byteChar = window.atob(b64)
            const byteNumbers = new Array(byteChar.length);
            for (let i = 0; i < byteChar.length; i++) {
                byteNumbers[i] = byteChar.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "pdf" });

            setFile(URL.createObjectURL(blob))
            setDisplaySpinner(false)
        }
        if (props.clickedFile)
            convertingFile();
    }, [props.clickedFile])

    const getFile = async () => {
        try {
            const response = await axiosPrivate.get('file', {
                params: { ...parameters, mail: auth?.user, name: props.clickedFile },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            return response.data.file.data;

        } catch (error) {
            console.log(error)
        }
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
                        <Spinner mr={3}/>
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