import "../styles/profile.css"
import useAuth from "../hooks/useAuth";
import ChangePwd from "../components/ChangePwd"

const Profile = () => {  

    const { auth } = useAuth();
    console.log(auth);

    return (
        <div className="profileMain">
            <section className="profileGraphics">
                <div className="profileInfos">
                    <div className="profileInfosPic"></div>
                    <div className="profileInfosText"></div>
                </div>
                <div className="profileAvatar">création avatar</div>
            </section>
            <section className="profileSettings">
                <div className="profileName">
                    
                <h3>Changer de pseudo</h3>
                    <input placeholder="Nouveau pseudo"></input>
                </div>                
                <ChangePwd />                
                <div className="profileMail">
                <h3>Changer d'adresse mail</h3>
                    <input placeholder="Nouveau mail"></input>
                </div>
            </section>
        </div>
    )
}

export default Profile;