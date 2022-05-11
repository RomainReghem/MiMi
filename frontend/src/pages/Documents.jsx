import Form from "../components/Form"
import FileList from "../components/FileList"

const Documents = () => {
    return (
        <div className="fileMain">
            <section className="fileManager">
                <FileList/>
                <div className="fileUploadFormContainer">
                    <Form />
                </div>
            </section>
            <section>

            </section>
        </div>

    )
}

export default Documents;