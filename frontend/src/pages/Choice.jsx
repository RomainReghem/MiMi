import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`

`;

const Sdiv = styled.div`
display:flex;
justify-content:center;
flex-direction:column;
width:600px;
@media (max-width: 768px) {
    width:400px;
}
height:85%;
margin:auto;
`;

const H3 = styled.h3`
align-self:flex-start;
margin-bottom:0px;
`;
const Choices = styled.div`

`;

const Choice = styled.div`
display:flex;
align-items:center;
justify-content:center;
background-color:white;
height:80px;
width:100%;
padding:12px 20px;
margin-top:20px;
border: 1px solid black;
box-shadow: 7px 7px #ffc3ae;
box-sizing:border-box;
cursor:pointer;
&:hover{
    border: 2px solid black;
    transition-duration: 100ms;
    transition-property: border;
}

`;

const Choix = () => {
    return (
        <Sdiv>
            <H3>Vous êtes :</H3>
            <Choices>
                <Link to="/register-student">
                    <Choice>
                        <p>Un élève 🧑‍🎓</p>
                    </Choice>
                </Link>
                <Link to="/register-class">
                <Choice>
                    <p>
                        L'administration de l'établissement scolaire, un représentant de la classe...
                    </p>
                </Choice>
                </Link>
            </Choices>
        </Sdiv>
    )
}

export default Choix;