import { Link } from 'react-router-dom'

function Inscription() {
    return (
        <div className="formBody">
            <div className="formContainer">
                <h2>Inscrivez-vous</h2>
                <div className="formNames">
                    <input type="text" placeholder="Prénom"></input>
                    <input type="text" placeholder="Nom"></input>
                </div>

                <input type="text" placeholder="Adresse e-mail"></input>
                <input type="text" placeholder="Mot de passe"></input>
                <input type="text" placeholder="Confirmer mot de passe"></input>
                <button>→</button>
            </div>

            <p>Déjà un compte ? <Link to="/connexion" style={{ color: '#ab9471' }}>Connectez-vous.</Link></p>
        </div>
    )
}

export default Inscription;