import React, { Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import io from "socket.io-client"
import { useState } from 'react';
import { Button, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Center, Text, Box, Spinner, Stack, Progress } from "@chakra-ui/react"
import useUserData from '../hooks/useUserData';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHand } from "@fortawesome/free-solid-svg-icons";


const socket = io.connect("http://localhost:3500");

const JitsiComponent = () => {

    const navigate = useNavigate();
    const { userData } = useUserData();
    const { auth } = useAuth();

    const domain = 'meet.jit.si';
    let api = {};

    const [room, setRoom] = useState("MimiRooms" + auth?.idclasse)
    const [user, setUser] = useState(userData?.pseudo || "classe")
    const [isAudioMuted, setIsAudioMuted] = useState(false)
    const [isVideoMuted, setIsVideoMuted] = useState(false)
    const [handRaised, setHandRaised] = useState(false);
    const [videoConfJoined, setVideoConfJoined] = useState(false);

    useEffect(() => {
        socket.emit("joinRoom", auth?.idclasse);

        socket.on("switchCamera", (whichOne) => {
            console.log('someone wants to switch to camera ' + whichOne)
            // api.setVideoInputDevice(devices.videoInput[whichOne].label, devices.videoInput[whichOne].deviceId);
            console.log(api)
            executeCommand('toggleCamera');

        })

    }, [videoConfJoined])

    let startMeet = () => {
        if (auth?.idclasse) {
            const options = {
                roomName: room,
                lang: 'fr',
                avatarURL: userData?.avatarURL,
                configOverwrite: { prejoinPageEnabled: true },
                interfaceConfigOverwrite: {
                    // overwrite interface properties
                },
                parentNode: document.querySelector('#jitsi-iframe'),
                userInfo: {
                    displayName: user
                },

            }
            api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListeners({
                readyToClose: handleClose,
                participantLeft: handleParticipantLeft,
                participantJoined: handleParticipantJoined,
                videoConferenceJoined: handleVideoConferenceJoined,
                videoConferenceLeft: handleVideoConferenceLeft,
                audioMuteStatusChanged: handleMuteStatus,
                videoMuteStatusChanged: handleVideoStatus,
                raiseHandUpdated: handleRaiseHandStatus,
            });
        }
    }

    const handleClose = () => {
        console.log("handleClose");
    }

    const handleParticipantLeft = async (participant) => {
        console.log("handleParticipantLeft", participant); // { id: "2baa184e" }
        const data = await getParticipants();
    }

    const handleParticipantJoined = async (participant) => {
        console.log("handleParticipantJoined", participant); // { id: "2baa184e", displayName: "Shanu Verma", formattedDisplayName: "Shanu Verma" }
        const data = await getParticipants();
    }

    const handleVideoConferenceJoined = async (participant) => {
        console.log("handleVideoConferenceJoined", participant); // { roomName: "bwb-bfqi-vmh", id: "8c35a951", displayName: "Akash Verma", formattedDisplayName: "Akash Verma (me)"}
        api.executeCommand('avatarUrl', userData?.avatarURL);
        setVideoConfJoined(true)
        const data = await getParticipants();
    }

    const handleVideoConferenceLeft = () => {
        console.log("handleVideoConferenceLeft");
        navigate({
            pathname: "/profile"
        });
    }

    const handleMuteStatus = (audio) => {
        console.log("handleMuteStatus", audio); // { muted: true }
    }

    const handleVideoStatus = (video) => {
        console.log("handleVideoStatus", video); // { muted: true }
    }

    const handleRaiseHandStatus = (e) => {
        e.handRaised === 0 ? setHandRaised(false) : setHandRaised(true)
    }

    const getParticipants = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(api.getParticipantsInfo()); // get all participants
            }, 500)
        });
    }

    // custom events
    const executeCommand = (command) => {
        api.executeCommand(command);
        if (command == 'hangup') {
            navigate({
                pathname: "/profile"
            });
        }

        if (command == 'toggleAudio') {
            setIsAudioMuted(!isAudioMuted);
        }

        if (command == 'toggleVideo') {
            setIsVideoMuted(!isVideoMuted);
        }
    }


    const switchCamera = (whichOne) => {
        switch (whichOne) {
            case 0:
                socket.emit('leftCamera')
                break;
            case 1:
                socket.emit('centerCamera')
                break;
            case 2:
                socket.emit('rightCamera')
                break;
            default:
                console.log('wrong argument');
        }
    }

    useEffect(() => {
        if (window.JitsiMeetExternalAPI) {
            startMeet();
        } else {
            alert('JitsiMeetExternalAPI not loaded');
        }

    }, [])


    return (
        <>
            {!auth?.idclasse
                ? <Center flexGrow={1}><Text>{auth?.role == "eleve" ? "Il faut être membre d'une classe pour accéder à la visioconférence" : "Il faut avoir au moins 1 élève membre de la classe pour accéder à la visioconférence"}</Text></Center>
                : <><Spinner position={'absolute'} top='50%' left='50%' zIndex={1} /><div id="jitsi-iframe"></div></>
            }

            {
                auth?.role == 'classe' && handRaised &&
                <Alert onClick={() => setHandRaised(false)} p={10} status='success' variant='subtle' flexDirection='column' alignItems='center' justifyContent='space-between' textAlign='center' zIndex={99} >
                    <AlertIcon mr={0} />
                    <AlertTitle mt={4} fontSize='lg'>
                        Un élève souhaite prendre la parole
                    </AlertTitle>
                    <AlertDescription mb={'36'}>Cliquer pour fermer</AlertDescription>
                    <FontAwesomeIcon icon={faHand} size='10x' color='#F8AE1A' bounce />
                </Alert>
            }


            {
                auth?.idclasse && auth?.role == "eleve" &&

                <Stack direction={'row'} align='center' justify={'center'} p={5}>
                    <Button colorScheme={'blue'} onClick={() => switchCamera(0)}>Caméra gauche</Button>
                    <Button colorScheme={'blue'} onClick={() => switchCamera(1)}>Caméra centre</Button>
                    <Button colorScheme={'blue'} onClick={() => switchCamera(2)}>Caméra droite</Button>
                </Stack>
            }

            {/* <i onClick={ () => executeCommand('toggleAudio') } className={`fas fa-2x grey-color ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`} aria-hidden="true" title="Mute / Unmute"></i>
                <i onClick={ () => executeCommand('hangup') } className="fas fa-phone-slash fa-2x red-color" aria-hidden="true" title="Leave"></i>
                <i onClick={ () => executeCommand('toggleVideo') } className={`fas fa-2x grey-color ${isVideoMuted ? 'fa-video-slash' : 'fa-video'}`} aria-hidden="true" title="Start / Stop camera"></i>
                <i onClick={ () => executeCommand('toggleShareScreen') } className="fas fa-film fa-2x grey-color" aria-hidden="true" title="Share your screen"></i> */}


        </>
    );
}

export default JitsiComponent;
