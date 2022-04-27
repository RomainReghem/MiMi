import {Link} from 'react-router-dom'


function Connexion(props) {

    return (
        <div className="formBody">
        <div className = "formContainer">
            <h2>Connectez-vous</h2>
            <input type="text" placeholder="Adresse e-mail"></input>
            <input type="text" placeholder="Mot de passe"></input>
            <button onClick={() => props.log()}>→</button>
        </div>

        <p>Pas encore de compte ? <Link to="/inscription" style={{ color: '#ab9471'}}>Inscrivez-vous.</Link></p>
        </div>
    )
}

export default Connexion;