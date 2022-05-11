
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import { useState } from "react"
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = () => {

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    }


    return (
        <Document file="https://uniswap.org/whitepaper.pdf" onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(Array(numPages), (e, i) => {
                return <Page width={600} key={i} pageNumber={i}/>
            })}
        </Document>
    );
}

export default PDFViewer;