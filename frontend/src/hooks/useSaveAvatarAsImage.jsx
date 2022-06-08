import * as htmlToImage from 'html-to-image';
import useAuth from './useAuth';
import useUserData from './useUserData';
import { axiosPrivate } from '../api/axios';

const useSaveAvatarAsImage = () => {
    const { auth } = useAuth();
    const { userData, setUserData } = useUserData();
    let file;

    const saveAvatarAsImage = async (id) => {
        try {
            htmlToImage.toBlob(document.getElementById(id))
                .then(function (blob) {
                    file = new File([blob], "avatar.png");
                });

                let formData = new FormData()
                formData.append('file', file);
                formData.append("filename", "avatar.png");
                formData.append("mail", auth?.user);
                const response = await axiosPrivate.post("/avatarAsImage", formData,
                    {
                        headers: { "Content-Type": "image/png" },
                    });
                setUserData({
                    ...userData,
                    avatarImage: response.data.data
                })
        }
        catch (err) {
            console.log(err)
        }
    }
    return saveAvatarAsImage;
}

export default useSaveAvatarAsImage;