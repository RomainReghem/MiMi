import "../styles/profile.css"
import useAuth from "../hooks/useAuth";
import ChangePwd from "../components/ChangePwd"
import ChangeMail from "../components/ChangeMail"
import Identity from "../components/Identity";
import AvatarComponent from "../components/AvatarComponent"
import Users from "../components/Users"


const Profile = () => {

    const { auth } = useAuth();
    const role = auth?.role;

    return (
        <>
            {role == "eleve" ? (
                <div className="profileMain">
                    <section className="profileSettings">
                        <Identity/>
                    </section>
                    <AvatarComponent/>
                </div>) : (
                <div className="pcMain">
                    <h2>Tableau de bord classe #4234</h2>
                    <div className="pcChild">
                        <section className="pcSettings">
                        <ChangePwd /><br />
                        <ChangeMail />
                        </section>
                        <section className="pcUsers">
                            <Users />
                        </section>
                    </div>
                </div>)}
        </>
    )
}

export default Profile;