import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import "../styles/success.css"


const Success = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const from = searchParams.get("from");
    return (
        <> {from == 1 ? (
            <div className="successMain">
                <div className="successContainer">
                    <h2>🎉</h2>
                    <h2>Vous êtes bien connecté !</h2>
                    <Link to="/dashboard"><button className="successButton">Accéder au tableau de bord</button></Link>
                </div></div>) :
            from == 2 ? (
                <div className="successMain">
                    <div className="successContainer">
                        <h2>🎉</h2>
                        <h2>Vous êtes bien inscrit !</h2>
                        <Link to="/login"><button className="successButton">Connectez-vous avec vos identifiants</button></Link>
                    </div></div>
            ) :
                <div className="successMain">
                    <div className="successContainer">
                        <h2>🧐</h2>
                        <h2>Perdu ?</h2>
                        <Link to="/choice"><button className="successButton">Inscrivez-vous !</button></Link>
                    </div></div>}

        </>

    );


}

export default Success;