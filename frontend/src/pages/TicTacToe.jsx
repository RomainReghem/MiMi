import { useEffect, useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import * as React from 'react';
import Cell from "../components/Cell";
import "../styles/tictactoe.css";
import CircularProgress from '@mui/material/CircularProgress';
import io from "socket.io-client"
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faDiceThree } from "@fortawesome/free-solid-svg-icons";
import { axiosPrivate } from "../api/axios";
import useAuth from '../hooks/useAuth'

const socket = io.connect("http://localhost:5000");


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TicTacToe = () => {
    const { auth } = useAuth();

    const [roomCode, setRoomCode] = useState("53");
    const [roomJoined, setRoomJoined] = useState(false);
    const [waitingText, setWaitingText] = useState("");
    const [gameEnded, setGameEnded] = useState(false);
    const [showBoard, setShowBoard] = useState(false);
    const [win, setWin] = useState(false)
    const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
    const [UIboard, setUIboard] = useState([])
    const [canPlay, setCanPlay] = useState(true);
    const [score, setScore] = useState([0, 0])
    let winner = false;

    useEffect(() => {
        if (roomCode && !roomJoined) {
            socket.emit("joinRoom", roomCode);
            console.log("joining room...");
        }
        getScore();
    }, [roomCode]);

    useEffect(() => {
        socket.on("maxPlayersReached", (b, player1) => {
            setBoard(b);
            setUIboard([])
            setShowBoard(true);
            // Si ce socket est le premier joueur, il peut jouer en premier
            socket.id == player1 ? setCanPlay(true) : setCanPlay(false);
        });

        socket.on("YoureIn", () => {
            setRoomJoined(true);
            setWaitingText("En attente du second joueur...")
        });

        socket.on("gameIsFull", () => {
            console.log("Sorry, game is full");
            setWaitingText("Deux joueurs sont déjà en partie !")
        });

        socket.on("updateGame", (updatedBoard) => {
            setBoard(updatedBoard);

            // Making a new array to have nicer UI than just letters "X" and "O"
            let newUIboard = [];
            updatedBoard.forEach((cell) => {
                cell == "X" ? newUIboard.push(<FontAwesomeIcon className="cellX" icon={faXmark} />)
                    : cell == "O" ? newUIboard.push(<FontAwesomeIcon className="cellO" icon={faCircle} />)
                        : newUIboard.push("")
            })
            setUIboard(newUIboard)

        });

        socket.on("ennemyPlayed", () => {
            setCanPlay(true);
        });

        socket.on("victory", (player) => {
            if (socket.id == player) {
                winner = true
                setWin(true)
            } else {
                winner = false
                setWin(false)
            }
            setGameEnded(true);
            setRoomJoined(false);
            postScore();

        });
    })

    const postScore = async () => {
        try {
            await axiosPrivate.post("/score", JSON.stringify({ mail: auth?.user, win: winner }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            getScore();
        }
        catch (err) { console.log(err) }
    }

    const getScore = async () => {
        try {
            const response = await axiosPrivate.get("/score",
                {
                    params: { mail: auth?.user }
                }
            );
            setScore(response.data.scores)
            console.log(response.data)
            console.log(score)
        } catch (err) { console.log("Erreur du chargement du score"); }
    }

    const handleCellClick = (e) => {
        const id = e.currentTarget.id;
        if (canPlay && board[id] == "") {
            socket.emit("play", { id, roomCode });
            setCanPlay(false);
        }
    };

    const handleReplay = () => {
        // On remet la partie à 0
        setGameEnded(false);
        setShowBoard(false);
        setWin(false);
        socket.emit("joinRoom", roomCode);
    }

    return (
        <>
            {showBoard ? (
                <div className="tictactoe">
                    <section className="tictactoe-section">
                        <Cell handleCellClick={handleCellClick} id={"0"} text={UIboard[0]} />
                        <Cell handleCellClick={handleCellClick} id={"1"} text={UIboard[1]} />
                        <Cell handleCellClick={handleCellClick} id={"2"} text={UIboard[2]} />

                        <Cell handleCellClick={handleCellClick} id={"3"} text={UIboard[3]} />
                        <Cell handleCellClick={handleCellClick} id={"4"} text={UIboard[4]} />
                        <Cell handleCellClick={handleCellClick} id={"5"} text={UIboard[5]} />

                        <Cell handleCellClick={handleCellClick} id={"6"} text={UIboard[6]} />
                        <Cell handleCellClick={handleCellClick} id={"7"} text={UIboard[7]} />
                        <Cell handleCellClick={handleCellClick} id={"8"} text={UIboard[8]} />
                    </section>
                    {canPlay ? (<Button style={{ marginTop: "0.5rem" }} variant="contained" color="success">
                        <FontAwesomeIcon className="dice" icon={faDiceThree} style={{ marginRight: "0.5rem" }} /> A ton tour de jouer !
                    </Button>) : (<Button style={{ marginTop: "0.5rem" }} variant="outlined" color="error">
                        <CircularProgress style={{ marginRight: "0.5rem" }} size={10} color="error" />
                        Tour de l'adversaire...
                    </Button>)}
                    <p>Score : élève : {score[0]}, classe : {score[1]}</p>

                    {gameEnded ? <Dialog
                        open={gameEnded}
                        TransitionComponent={Transition}
                        keepMounted>
                        <center><DialogTitle>{win ? "Gagné !" : "Perdu :("}</DialogTitle></center>
                        <DialogActions>
                            <Button onClick={handleReplay} variant="outlined" color="success">Rejouer</Button>
                            <Link to="/jeux" style={{ textDecoration: 'none', marginLeft: "0.3rem" }} >
                                <Button variant="outlined" color="error">Quitter</Button>
                            </Link>
                        </DialogActions>
                    </Dialog> : <></>}
                </div>


            ) :
                (<div className="waitingRoom">
                    {roomJoined ? <CircularProgress /> : <></>}
                    <p>{waitingText}</p>
                </div>)
            }
        </>
    );
};

export default TicTacToe;