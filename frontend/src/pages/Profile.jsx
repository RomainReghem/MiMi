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
                        <Users />
                </div>)}
        </>
    )
}

export default Profile;