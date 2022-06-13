import * as htmlToImage from 'html-to-image';
import useAuth from './useAuth';
import useUserData from './useUserData';
import { axiosPrivate } from '../api/axios';

const useSaveAvatarAsImage = () => {
    const { auth } = useAuth();
    const { userData, setUserData } = useUserData();
    let file;

    // htmlToImage permet de transformer un composant dont on passe l'id en Blob
    // On transforme ensuite ce blob en File pour pouvoir l'envoyer au serveur de la même manière que dans 'Identity.jsx'
    const saveAvatarAsImage = (id) => {
        try {
            htmlToImage.toBlob(document.getElementById(id))
                .then(function (blob) {
                    file = new File([blob], "avatar.png");
                    send(file).then(
                        // console.log(URL.createObjectURL(blob))
                    )

                });
        }
        catch (err) {
            console.log(err)
        }
    }

    const send = async (file) => {
        let formData = new FormData()
        formData.append('file', file);
        formData.append("filename", "avatar.png");
        formData.append("mail", auth?.user);
        const response = await axiosPrivate.post("/avatarAsImage", formData,
            {
                headers: { "Content-Type": "image/png" },
            });
    }
    return saveAvatarAsImage;
}

export default useSaveAvatarAsImage;