import { useJitsi } from 'react-jutsu'
import { Spinner, Center, Stack, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Text, Box, Progress } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHand } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useUserData from '../hooks/useUserData';
import io from "socket.io-client"

//const socket = io.connect("http://localhost:5555");
const socket = io("https://mimi.connected-health.fr", { path: '/api-cameras' });

const Jutsu = () => {
    const { auth } = useAuth()
    const { userData } = useUserData()
    const [handRaised, setHandRaised] = useState(false);
    const [selected, setSelected] = useState([false, false, false])
    localStorage.removeItem('jitsiLocalStorage');


    const jitsiConfig = {
        roomName: "MimiRooms" + auth?.idclasse,
        displayName: userData?.pseudo,
        password: "mimi",
        subject: 'cours',
        parentNode: 'jitsi-container',
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            HIDE_INVITE_MORE_HEADER: true,
            MOBILE_APP_PROMO: false,
        },
    };
    const { loading, error, jitsi } = useJitsi(jitsiConfig);

    const confJoined = () => {
        jitsi.executeCommand('avatarUrl', userData?.avatarURL);

        socket.emit("joinRoom", auth?.idclasse);

        socket.on("switchCamera", (whichOne) => {
            if (auth?.role == 'classe') {
                console.log('someone wants to switch to camera ' + whichOne)
                jitsi.getAvailableDevices().then(devices => {
                    console.log(devices.videoInput[0].label)
                    jitsi.setVideoInputDevice(devices.videoInput[whichOne].label, devices.videoInput[whichOne].deviceId);
                })
                console.log(jitsi)
            }
        })

        socket.on("raiseHand", () => {
            if (auth?.role == 'classe') {
                setHandRaised(true);
            }
        })

        socket.on("lowerHand", () => {
            if (auth?.role == 'classe') {
                setHandRaised(false);
            }
        })
    }

    useEffect(() => {
        if (jitsi) {
            jitsi.addEventListeners({
                videoConferenceJoined: confJoined,
            });
        }
    }, [jitsi])

    return (
        <>
            <Stack flexGrow={1}>
                <Spinner position={'absolute'} top='50%' left='50%' zIndex={1} />
                {
                    handRaised &&
                    <Alert onClick={() => setHandRaised(false)} p={10} status='success' variant='subtle' flexDirection='column' alignItems='center' justifyContent='space-between' textAlign='center' zIndex={99} >
                        <AlertIcon mr={0} />
                        <AlertTitle mt={4} fontSize='lg'>
                            Un élève souhaite prendre la parole
                        </AlertTitle>
                        <AlertDescription mb={'36'}>Cliquer pour fermer</AlertDescription>
                        <FontAwesomeIcon icon={faHand} size='10x' color='#F8AE1A' bounce />
                    </Alert>
                }
                {error && <p>{error}</p>}
                {loading && <Spinner />}
                <Stack flexGrow={1} h='xl' id={jitsiConfig.parentNode} zIndex={99} />
            </Stack>

        </>);
}

export default Jutsu;