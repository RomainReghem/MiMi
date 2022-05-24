import { useEffect, useState } from "react";
import Cell from "../components/Cell";
import "../styles/tictactoe.css";
import CircularProgress from '@mui/material/CircularProgress';
import io from "socket.io-client"

const socket = io.connect("http://localhost:5000")

const TicTacToe = () => {
    const [roomCode, setRoomCode] = useState("53");
    const [roomFull, setRoomFull] = useState(false);
    const [roomJoined, setRoomJoined] = useState(false);
    const [waitingText, setWaitingText] = useState("");
    useEffect(() => {
        console.log(roomCode);
        if (roomCode && !roomJoined) {
            socket.emit("joinRoom", roomCode);
        }
    }, [roomCode]);

    const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
    const [canPlay, setCanPlay] = useState(true);

    useEffect(() => {
        socket.on("updateGame", (id) => {
            console.log("use Effect", id);
            setBoard((data) => ({ ...data, [id]: "O" }));
            setCanPlay(true);
        });
        return () => socket.off("updateGame");
    });

    useEffect(() => {
        socket.on("maxPlayersReached", (b) => {
            setRoomFull(true);
            console.log(b)
        });

        socket.on("YoureIn", () => {
            setRoomJoined(true);
            setWaitingText("En attente du second joueur...")
        });

        socket.on("gameIsFull", () => {
            console.log("Sorry, game is full");
            setWaitingText("Deux joueurs sont déjà en partie !")
        });
    })

    useEffect(() => {
        for (let i = 0; i <= 3; i += 3) {
            if (board[i] == "X" && board[i + 1] == "X" && board[i + 2] == "X") {
                console.log("gagné ligne !")
            }
        }

    }, [board])

    const handleCellClick = (e) => {
        const id = e.currentTarget.id;
        if (canPlay && board[id] == "") {
            setBoard((data) => ({ ...data, [id]: "X" }));
            socket.emit("play", { id, roomCode });
            setCanPlay(false);
        }

        if (
            (board[0] == "X" && board[1] == "X" && board[2] == "X") ||
            (board[0] == "O" && board[1] == "O" && board[2] == "O")
        ) {
            setBoard(["", "", "", "", "", "", "", "", ""]);
        }
    };

    return (
        <>
            {roomFull && roomJoined ? (
                <div className="tictactoe">
                    <section className="tictactoe-section">
                        <Cell handleCellClick={handleCellClick} id={"0"} text={board[0]} />
                        <Cell handleCellClick={handleCellClick} id={"1"} text={board[1]} />
                        <Cell handleCellClick={handleCellClick} id={"2"} text={board[2]} />

                        <Cell handleCellClick={handleCellClick} id={"3"} text={board[3]} />
                        <Cell handleCellClick={handleCellClick} id={"4"} text={board[4]} />
                        <Cell handleCellClick={handleCellClick} id={"5"} text={board[5]} />

                        <Cell handleCellClick={handleCellClick} id={"6"} text={board[6]} />
                        <Cell handleCellClick={handleCellClick} id={"7"} text={board[7]} />
                        <Cell handleCellClick={handleCellClick} id={"8"} text={board[8]} />
                    </section>
                </div>) :
                <div className="waitingRoom">
                    {roomJoined ? <CircularProgress /> : <></>}
                    <p>{waitingText}</p>
                </div>
            }
        </>
    );
};

export default TicTacToe;