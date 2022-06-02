import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as React from 'react';
import Cell from "./Cell";
import "../../styles/tictactoe.css";
import io from "socket.io-client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faDiceThree } from "@fortawesome/free-solid-svg-icons";
import { axiosPrivate } from "../../api/axios";
import useAuth from '../../hooks/useAuth'
import { CircularProgress, Center, Button, Text, Stack, AlertDialogFooter, AlertDialogOverlay, AlertDialog, AlertDialogHeader, AlertDialogContent, Wrap, Grid, Divider, Heading, Badge, StackDivider, Box } from "@chakra-ui/react";


const socket = io.connect("http://localhost:5000");

const TicTacToe = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const cancelRef = useRef();

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
            socket.emit("joinRoom", roomCode, auth?.user);
            getScore();
            console.log("joining room...");
        }
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
        });
    })

    const getScore = async () => {
        try {
            const response = await axiosPrivate.get("/score",
                {
                    params: { mail: auth?.user }
                }
            );
            setScore(response.data.scores)
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
            {showBoard ? <>
                <Center flexGrow={1}>
                    <Wrap spacing={10} justify={'center'} p={5}>
                        <Grid templateRows='repeat(3, 1fr)' templateColumns='repeat(3, 1fr)' gap={2}>
                            <Cell handleCellClick={handleCellClick} id={"0"} text={UIboard[0]} />
                            <Cell handleCellClick={handleCellClick} id={"1"} text={UIboard[1]} />
                            <Cell handleCellClick={handleCellClick} id={"2"} text={UIboard[2]} />

                            <Cell handleCellClick={handleCellClick} id={"3"} text={UIboard[3]} />
                            <Cell handleCellClick={handleCellClick} id={"4"} text={UIboard[4]} />
                            <Cell handleCellClick={handleCellClick} id={"5"} text={UIboard[5]} />

                            <Cell handleCellClick={handleCellClick} id={"6"} text={UIboard[6]} />
                            <Cell handleCellClick={handleCellClick} id={"7"} text={UIboard[7]} />
                            <Cell handleCellClick={handleCellClick} id={"8"} text={UIboard[8]} />
                        </Grid >

                        <Stack direction={'column'} w={'md'} spacing={10} >
                            <Heading alignSelf={'center'} fontSize={'2xl'}>Scores</Heading>
                            <Stack direction={'row'} justify={'space-evenly'}>
                                <Stack align={'center'} >
                                    <Badge fontSize={'md'} align={'center'} w={'10ch'} colorScheme='green'>ELEVE</Badge>
                                    <Text fontSize={'xl'} fontFamily={'mono'}>{score[0]}</Text>
                                </Stack>
                                <Divider orientation="vertical" h={'3rem'} />
                                <Stack align={'center'}>
                                    <Badge fontSize={'md'} w={'10ch'} align={'center'} colorScheme='red'>CLASSE</Badge>
                                    <Text fontSize={'xl'} fontFamily={'mono'}>{score[1]}</Text>
                                </Stack>
                            </Stack>
                            {canPlay ? (<Button alignSelf={'center'} _focus={{ outline: 'none' }} bg='green.200' _hover={{ bg: 'green.300' }} variant={'outline'} leftIcon={<FontAwesomeIcon className="dice" icon={faDiceThree} />}>
                                A ton tour de jouer !
                            </Button>) : (<Button alignSelf={'center'} _focus={{ outline: 'none' }} w='xs' colorScheme="red" leftIcon={<CircularProgress size={'1.5rem'} isIndeterminate color='red.300' />}>
                                Au tour de l'adversaire...
                            </Button>)}
                        </Stack>
                    </Wrap>

                    {gameEnded ? <AlertDialog motionPreset='slideInBottom' leastDestructiveRef={cancelRef} isOpen={gameEnded} isCentered>
                        <AlertDialogOverlay />
                        <AlertDialogContent>
                            <AlertDialogHeader>{win ? "Gagné !" : "Perdu :("}</AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={handleReplay}>
                                    Rejouer
                                </Button>
                                <Button onClick={() => { navigate("/games") }} colorScheme='red' ml={3}>
                                    Quitter
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog> : <></>}
                </Center>

            </> :
                (<div className="waitingRoom">
                    {roomJoined ? <CircularProgress isIndeterminate color='green.300' /> : <></>}
                    <p>{waitingText}</p>
                </div>)
            }
        </>
    );
};

export default TicTacToe;