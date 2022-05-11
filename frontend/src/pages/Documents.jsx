import Form from "../components/Form"
import FileList from "../components/FileList"
import PDFViewer from "../components/PDFViewer";

const Documents = () => {

    return (
        <div className="fileMain">
            <section className="fileManager">
                <FileList />
                <div className="fileUploadFormContainer">
                    <Form />
                </div>
            </section>
            <section className="fileViewer">                
            <PDFViewer />
            </section>
        </div>

    )
}

export default Documents;