import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import Notifs from "../components/Notifs"
import { useEffect } from "react";

const FileList = () => {

    const { auth } = useAuth();

    /*useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        try {
            const response = await axios.get("/getFiles", {
                params: { mail: auth.mail }
            });
            console.log("Réponse loadFiles : " + response.data)
        } catch (error) {
            console.log(error)
        }
    }*/

        return (
            <div className="fileList">
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
                <div className="file">Maths</div>
                <div className="file">Fr</div>
                <div className="file">Géo</div>
            </div>
        );
}

export default FileList;