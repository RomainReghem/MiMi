import styled from 'styled-components'

const MiMi = styled.div`
display:flex;
justify-content:center;
align-items:center;
height:85%;
`

function Home(){
    return(
        <MiMi>
            <h1>Projet MiMi</h1>
        </MiMi>
    )
}

export default Home;