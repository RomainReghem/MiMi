import useAuth from './useAuth';
import useUserData from './useUserData'

const useSetURL = () => {
    const { auth } = useAuth();
    const { userData, setUserData } = useUserData();
    let imageURL;
    let avatarURL;
    
    const setURL = async (image, avatar) => {

        let binary = '';
        let bytes = new Uint8Array(image);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        imageURL = "data:image/png;base64," + window.btoa(binary)

        let binary2 = '';
        let bytes2 = new Uint8Array(avatar);
        for (let i = 0; i < bytes2.byteLength; i++) {
            binary2 += String.fromCharCode(bytes2[i]);
        }
        avatarURL = "data:image/png;base64," + window.btoa(binary2)

        await setUserData(prev => {
            return {
                ...prev,
                imageURL: imageURL,
                avatarURL: avatarURL,
            }
        })
        return;
    }
    return setURL;
}

export default useSetURL;