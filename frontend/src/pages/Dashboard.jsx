import styled from 'styled-components'

const Secret = styled.div`
display:flex;
justify-content:center;
align-items:center;
height:85%;
`
function Protected(){
    return(
        <Secret>
            <h1>Page très secrète...</h1>
        </Secret>
    )
}

export default Protected;