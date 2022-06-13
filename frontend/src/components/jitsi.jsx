import React, { Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { Button, Center, Spinner, Stack } from "@chakra-ui/react"
import useUserData from '../hooks/useUserData';

const JitsiComponent = () => {

    const navigate = useNavigate();
    const { userData } = useUserData();
    const { auth } = useAuth();
    console.log(userData)

    const domain = 'meet.jit.si';
    let api = {};

    const [room, setRoom] = useState("MimiRooms" + auth?.idclasse)
    const [user, setUser] = useState(userData?.pseudo || "classe")
    const [isAudioMuted, setIsAudioMuted] = useState(false)
    const [isVideoMuted, setIsVideoMuted] = useState(false)

    // useEffect(() => {
    //     let bytes = new Uint8Array(userData?.image);
    //     let blob = new Blob([bytes], {type: 'image/jpg'});
    //     console.log(URL.createObjectURL(blob));
    //     setImageURL(blob)
    // }, [userData?.image])

    // useEffect(() => {
    //     let bytes = new Uint8Array(userData?.avatarAsImage.data);
    //     let blob = new Blob([bytes], {type: 'image/png'});
    //     console.log(URL.createObjectURL(blob));
    //     setAvatarURL(blob)
    // }, [userData?.avatarAsImage])


    let startMeet = () => {
        if (auth?.idclasse) {
            const options = {
                roomName: room,
                configOverwrite: { prejoinPageEnabled: true },
                interfaceConfigOverwrite: {
                    // overwrite interface properties
                },
                parentNode: document.querySelector('#jitsi-iframe'),
                userInfo: {
                    displayName: user
                }

            }
            api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListeners({
                readyToClose: handleClose,
                participantLeft: handleParticipantLeft,
                participantJoined: handleParticipantJoined,
                videoConferenceJoined: handleVideoConferenceJoined,
                videoConferenceLeft: handleVideoConferenceLeft,
                audioMuteStatusChanged: handleMuteStatus,
                videoMuteStatusChanged: handleVideoStatus

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

    const getParticipants = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(api.getParticipantsInfo()); // get all participants
            }, 500)
        });
    }

    // custom events
    const executeCommand = (command) => {
        api.executeCommand(command);;
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

    
    const chooseImage = () => {
        api.executeCommand('avatarUrl', userData?.imageURL);
    }
    const chooseAvatar = () => {
        api.executeCommand('avatarUrl', userData?.avatarURL);
    }

    useEffect(() => {
        if (window.JitsiMeetExternalAPI) {
            startMeet();
            console.log("MEET STARTED ONCE")
        } else {
            alert('JitsiMeetExternalAPI not loaded');
        }

    }, [])


    return (
        <>
            {!auth?.idclasse
                ? <p> Rejoignez une classe pour accéder à la visioconférence </p>
                : <><Spinner position={'absolute'} top='50%' left='50%' zIndex={1} /><div id="jitsi-iframe"></div></>
            }


            <Stack direction={'row'} align='center' justify={'center'}>
                <Button colorScheme={'blue'} onClick={() => chooseImage()}>Choisir l'image</Button>
                <Button colorScheme={'blue'} onClick={() => chooseAvatar()}>Choisir l'avatar</Button>
            </Stack>
                
                {/* <i onClick={ () => executeCommand('toggleAudio') } className={`fas fa-2x grey-color ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`} aria-hidden="true" title="Mute / Unmute"></i>
                <i onClick={ () => executeCommand('hangup') } className="fas fa-phone-slash fa-2x red-color" aria-hidden="true" title="Leave"></i>
                <i onClick={ () => executeCommand('toggleVideo') } className={`fas fa-2x grey-color ${isVideoMuted ? 'fa-video-slash' : 'fa-video'}`} aria-hidden="true" title="Start / Stop camera"></i>
                <i onClick={ () => executeCommand('toggleShareScreen') } className="fas fa-film fa-2x grey-color" aria-hidden="true" title="Share your screen"></i> */}
            

        </>
    );
}

export default JitsiComponent;
