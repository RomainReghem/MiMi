import * as htmlToImage from 'html-to-image';
import useAuth from './useAuth';
import useUserData from './useUserData';
import { axiosPrivate } from '../api/axios';

const useSaveAvatarAsImage = () => {
    const { auth } = useAuth();
    const { userData, setUserData } = useUserData();
    let file;

    const saveAvatarAsImage = (id) => {
        try {
            htmlToImage.toBlob(document.getElementById(id))
                .then(function (blob) {
                    file = new File([blob], "avatar.png");
                    send(file).then(
                        console.log(URL.createObjectURL(blob))
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
        console.log(file)
        formData.append("filename", "avatar.png");
        formData.append("mail", auth?.user);
        const response = await axiosPrivate.post("/avatarAsImage", formData,
            {
                headers: { "Content-Type": "image/png" },
            });
        // setUserData({
        //     ...userData,
        //     avatarImage: response.data.data
        // })
    }
    return saveAvatarAsImage;
}

export default useSaveAvatarAsImage;