import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import { useEffect, useState } from "react"
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = (props) => {

    const [numPages, setNumPages] = useState(null);
    const [file, setFile] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    }

    useEffect(() => {
        console.log(props.clickedFile)
        setFile(props.clickedFile)
    }, [props.clickedFile])


    return (
        <>
            {file ?
                (<Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(Array(numPages), (e, i) => {
                        return <Page key={i} pageNumber={i + 1} />
                    })}
                </Document>)
                : <p>Séléctionnez un document pour l'afficher...</p>}

        </>
    );
}

export default PDFViewer;