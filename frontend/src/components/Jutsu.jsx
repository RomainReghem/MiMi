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

    const switchCamera = (whichOne) => {
        switch (whichOne) {
            case 0:
                socket.emit('leftCamera')
                setSelected([true, false, false])
                break;
            case 1:
                socket.emit('centerCamera')
                setSelected([false, true, false])
                break;
            case 2:
                socket.emit('rightCamera')
                setSelected([false, false, true])
                break;
            default:
                console.log('wrong argument');
        }
    }

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
    }

    const handleRaiseHandStatus = (e) => {
        e.handRaised === 0 ? setHandRaised(false) : setHandRaised(true)
    }

    useEffect(() => {
        if (jitsi) {
            jitsi.addEventListeners({
                videoConferenceJoined: confJoined,
                raiseHandUpdated: handleRaiseHandStatus,
            });
        }
    }, [jitsi])

    return (
        <>
            <Stack flexGrow={1}>
                <Spinner position={'absolute'} top='50%' left='50%' zIndex={1} />
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
                {error && <p>{error}</p>}
                {loading && <Spinner />}
                <Stack flexGrow={1} h='xl' id={jitsiConfig.parentNode} zIndex={99} />
                {auth?.role == 'eleve' && <Stack direction={'row'} justify='center'pb='2'>
                    <Button colorScheme={selected[0] ? 'darkblue' : 'blue'} onClick={() => switchCamera(0)}>Cam1</Button>
                    <Button colorScheme={selected[1] ? 'darkblue' : 'blue'} onClick={() => switchCamera(1)}>Cam2</Button>
                    <Button colorScheme={selected[2] ? 'darkblue' : 'blue'} onClick={() => switchCamera(2)}>Cam3</Button>
                </Stack>}
            </Stack>

        </>);
}

export default Jutsu;