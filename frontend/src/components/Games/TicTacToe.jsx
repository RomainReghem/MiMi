import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as React from 'react';
import io from "socket.io-client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faZ } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faDiceThree, faHand } from "@fortawesome/free-solid-svg-icons";
import { axiosPrivate } from "../../api/axios";
import useAuth from '../../hooks/useAuth'
import { useToast } from "@chakra-ui/react";
import { CircularProgress, Center, Button, Text, Stack, AlertDialogFooter, AlertDialogOverlay, AlertDialog, AlertDialogHeader, AlertDialogContent, Wrap, Grid, Divider, Heading, Badge, StackDivider, Box, GridItem } from "@chakra-ui/react";


//const socket = io.connect("http://localhost:5000");
const socket = io("https://mimi.connected-health.fr", { path:'/api-games' });

const TicTacToe = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const cancelRef = useRef();
    const toast = useToast();
    const [roomCode, setRoomCode] = useState(auth?.idclasse);
    const [roomJoined, setRoomJoined] = useState(false);
    const [waitingText, setWaitingText] = useState("");
    const [gameEnded, setGameEnded] = useState(false);
    const [showBoard, setShowBoard] = useState(false);
    const [win, setWin] = useState(false)
    const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
    const [UIboard, setUIboard] = useState([])
    const [canPlay, setCanPlay] = useState(false);
    const [score, setScore] = useState([0, 0])
    const [gamesPlayed, setGamesPlayed] = useState(0);

    useEffect(() => {
        if (!auth?.idclasse) {
            auth?.role == "eleve" ? toast({ title: "Problème...", description: "Il faut avoir rejoint une classe pour jouer", status: "warning", duration: 5000, isClosable: true, position: "top" })
                : toast({ title: "Problème...", description: "Invitez un élève dans la classe avant de pouvoir jouer", status: "warning", duration: 5000, isClosable: true, position: "top" })
        } else if (roomCode && !roomJoined) {
            socket.emit("joinRoom", roomCode, auth?.user);
            getScore();
            console.log("joining room...");
        }
    }, [roomCode]);

    useEffect(() => {
        socket.on("maxPlayersReached", (b) => {
            setBoard(b);
            updateUIBoard(b);
            setShowBoard(true);
        });

        socket.on("YoureIn", () => {
            setRoomJoined(true);
            setWaitingText("En attente du second joueur...")
        });

        socket.on("gameIsFull", () => {
            console.log("Sorry, game is full");
            setWaitingText("Deux joueurs sont déjà en partie !")
        });

        socket.on('canPlay', (turn) => {
            auth?.user == turn ? setCanPlay(true) : setCanPlay(false)
        })

        socket.on("updateGame", (updatedBoard) => {
            setBoard(updatedBoard);
            updateUIBoard(updatedBoard);
        });

        socket.on("victory", (mailOfTheWinner) => {
            if (auth?.user == mailOfTheWinner) {
                setWin(true)
            } else {
                setWin(false)
            }
            setGameEnded(true);
            setRoomJoined(false);
        });
    })

    const updateUIBoard = (b) => {
        let newUIboard = [];
        b.forEach((cell) => {
            cell == "X" ? newUIboard.push(<FontAwesomeIcon className="cellX" icon={faXmark} />)
                : cell == "O" ? newUIboard.push(<FontAwesomeIcon className="cellO" icon={faCircle} />)
                    : newUIboard.push("")
        })
        setUIboard(newUIboard)
    }

    const getScore = async () => {
        try {
            const response = await axiosPrivate.get("/score",
                {
                    params: { mail: auth?.user }
                }
            );
            console.log(response.data)
            setScore(response.data.scores)
            setGamesPlayed(response.data.partie)
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
        setCanPlay(false);
        setWin(false);
        socket.emit("joinRoom", roomCode, auth?.user);
        getScore();
    }

    return (
        <>
            {showBoard ? <>
                <Center flexGrow={1}>
                    <Wrap spacing={10} justify={'center'} p={5}>
                        <Grid minH={{ base: 'xs', md: 'md' }} minW={{ base: 'xs', md: 'md' }} templateRows='repeat(3, 1fr)' templateColumns='repeat(3, 1fr)' gap={2}>
                            {
                                board.map((board, i) =>
                                    <GridItem key={i} animation={`floating${i * 5} 1s ease-out`} className='cell' cursor={'pointer'} colSpan={1} rowSpan={1} bg={'teal.500'} align={'center'} onClick={handleCellClick} id={i}>
                                        <Center h={'100%'} ><Heading>{UIboard[i]}</Heading></Center>
                                    </GridItem>
                                )}
                        </Grid >
                        <Stack direction={'column'} w={'md'} spacing={10} >
                            <Stack align={'center'}><Heading fontSize={'2xl'}>Scores</Heading>
                            <Text fontFamily={'mono'}>{gamesPlayed} parties jouées</Text></Stack>
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
                    {roomJoined ? <><CircularProgress isIndeterminate color='green.300' /><p>{waitingText}</p></> :
                        auth?.idclasse ? <Text>Impossible de rejoindre la salle essayez d'actualiser la page</Text> :
                            <Text>{auth?.role == "eleve" ? "Il faut être membre d'une classe pour accéder aux jeux" : "Il faut avoir au moins 1 élève membre de la classe pour accéder aux jeux"}</Text>}
                </div>)
            }
        </>
    );
};

export default TicTacToe;