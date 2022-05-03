import "../styles/profile.css"
const Profile = () => {
    return (
        <div className="profileMain">
            <section className="profileGraphics">
                <div className="profileInfos">Infos
                    <div className="profileInfosPic"></div>
                    <div className="profileInfosText"></div>
                </div>
                <div className="profileAvatar">création avatar</div>
            </section>
            <section className="profileSettings">Settings
                <div className="profilePwd"></div>
                <div className="profileName"></div>
                <div className="profileMail"></div>
            </section>
        </div>
    )
}

export default Profile;