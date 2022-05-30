import { Link } from "react-router-dom";


const Jeux = () => {
    return (
        <div className="games">
            
            <Link to="/tictactoe" style={{textDecoration:"none", color:"black"}}>
            <div className="game">
                <img src="https://i.pinimg.com/originals/ce/6f/7f/ce6f7ffd885e477efa2110437ab779dd.gif"></img>
                <h3>Tic Tac Toe</h3>
            </div>
            </Link>
            <div className="game">
                <img src="https://cdn.dribbble.com/users/1159713/screenshots/3397424/game-box-gif.gif"></img>
                <h3>En développement...</h3>
            </div>
            <div className="game">
                <img src="https://cdn.dribbble.com/users/1159713/screenshots/3397424/game-box-gif.gif"></img>
                <h3>En développement...</h3>
            </div>
        </div>
    );
}

export default Jeux;
