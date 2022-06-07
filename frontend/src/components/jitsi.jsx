import React, { Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import {Center, Spinner, Stack} from "@chakra-ui/react"

const JitsiComponent = () => {

    const navigate = useNavigate();
    const { auth } = useAuth();

    const domain = 'meet.jit.si';
    let api = {};

    const [room, setRoom] = useState("MimiRooms" + auth?.idclasse)
    const [user, setUser] = useState(localStorage.getItem("pseudo") || "classe")
    const [isAudioMuted, setIsAudioMuted] = useState(false)
    const [isVideoMuted, setIsVideoMuted] = useState(false)

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
            : <><Spinner position={'absolute'} top='50%' left='50%' zIndex={1}/><div id="jitsi-iframe"></div></>
        }
        

            {/*<div className="item-center">
                <span>Custom Controls</span>
            </div>
            <div className="item-center">
                <span>&nbsp;&nbsp;</span>
                <i onClick={ () => executeCommand('toggleAudio') } className={`fas fa-2x grey-color ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`} aria-hidden="true" title="Mute / Unmute"></i>
                <i onClick={ () => executeCommand('hangup') } className="fas fa-phone-slash fa-2x red-color" aria-hidden="true" title="Leave"></i>
                <i onClick={ () => executeCommand('toggleVideo') } className={`fas fa-2x grey-color ${isVideoMuted ? 'fa-video-slash' : 'fa-video'}`} aria-hidden="true" title="Start / Stop camera"></i>
                <i onClick={ () => executeCommand('toggleShareScreen') } className="fas fa-film fa-2x grey-color" aria-hidden="true" title="Share your screen"></i>
        </div>*/}

        </>
    );
}

export default JitsiComponent;
