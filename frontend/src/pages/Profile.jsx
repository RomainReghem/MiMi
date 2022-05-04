import "../styles/profile.css"
import useAuth from "../hooks/useAuth";
import ChangePwd from "../components/ChangePwd"
import ChangeMail from "../components/ChangeMail"
import avatar from "../images/avatar.jpg";

const Profile = () => {  

    const { auth } = useAuth();
    console.log(auth);

    return (
        <div className="profileMain">
            <section className="profileGraphics">
                <div className="profileInfos">
                    <div className="profileInfosPic">
                        <img src={avatar}></img>
                    </div>
                    <div className="profileInfosText">
                        <h2>Classe #2347</h2>
                        <h3>{auth?.user}</h3>
                    </div>
                </div>
                <div className="profileAvatar">création avatar</div>
            </section>
            <section className="profileSettings">
                <div className="profileName">
                    
                <h3>Changer de pseudo</h3>
                    <input placeholder="Nouveau pseudo"></input>
                </div><br/>                
                <ChangePwd /><br/>                 
                <ChangeMail />
            </section>
        </div>
    )
}

export default Profile;