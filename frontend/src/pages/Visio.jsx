import { JitsiMeeting } from '@jitsi/react-sdk';
import useAuth from '../hooks/useAuth';
import React, { useRef, useState } from 'react';

const Visio = () => {
    const apiRef = useRef();
    const { auth } = useAuth();
    const [logItems, updateLog] = useState([]);
    const [knockingParticipants, updateKnockingParticipants] = useState([]);

    const printEventOutput = payload => {
        updateLog(items => [...items, JSON.stringify(payload)]);
    };

    const handleAudioStatusChange = (payload, feature) => {
        if (payload.muted) {
            updateLog(items => [...items, `${feature} off`])
        } else {
            updateLog(items => [...items, `${feature} on`])
        }
    };

    const handleChatUpdates = payload => {
        if (payload.isOpen || !payload.unreadCount) {
            return;
        }
        apiRef.current.executeCommand('toggleChat');
        updateLog(items => [...items, `you have ${payload.unreadCount} unread messages`])
    };

    const handleKnockingParticipant = payload => {
        updateLog(items => [...items, JSON.stringify(payload)]);
        updateKnockingParticipants(participants => [...participants, payload?.participant])
    };

    const resolveKnockingParticipants = condition => {
        knockingParticipants.forEach(participant => {
            apiRef.current.executeCommand('answerKnockingParticipant', participant?.id, condition(participant));
            updateKnockingParticipants(participants => participants.filter(item => item.id === participant.id));
        });
    };

    const handleJitsiIFrameRef1 = iframeRef => {
        iframeRef.style.border = '10px solid #3d3d3d';
        iframeRef.style.background = '#3d3d3d';
        iframeRef.style.height = '100%';
    };

    const handleApiReady = apiObj => {
        console.log(apiObj)
        apiRef.current = apiObj;
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
        apiRef.current.on('audioMuteStatusChanged', payload => handleAudioStatusChange(payload, 'audio'));
        apiRef.current.on('videoMuteStatusChanged', payload => handleAudioStatusChange(payload, 'video'));
        apiRef.current.on('raiseHandUpdated', printEventOutput);
        apiRef.current.on('titleViewChanged', printEventOutput);
        apiRef.current.on('chatUpdated', handleChatUpdates);
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
    };

    const handleReadyToClose = () => {
        /* eslint-disable-next-line no-alert */
        alert('Ready to close...');
    };

    const generateRoomName = () => auth?.idclasse;

    const renderButtons = () => (
        <div style={{ margin: '15px 0' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    type='text'
                    title='Click to execute toggle raise hand command'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#f8ae1a',
                        color: '#040404',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => apiRef.current.executeCommand('toggleRaiseHand')}>
                    Raise hand
                </button>
                <button
                    type='text'
                    title='Click to approve/reject knocking participant'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => resolveKnockingParticipants(({ name }) => !name.includes('test'))}>
                    Resolve lobby
                </button>
                <button
                    type='text'
                    title='Click to execute subject command'
                    style={{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#df486f',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick={() => apiRef.current.executeCommand('subject', 'New Subject')}>
                    Change subject
                </button>
            </div>
        </div>
    );

    const renderLog = () => logItems.map(
        (item, index) => (
            <div
                style={{
                    fontFamily: 'monospace',
                    padding: '5px'
                }}
                key={index}>
                {item}
            </div>
        )
    );

    const renderSpinner = () => (
        <div style={{
            fontFamily: 'sans-serif',
            textAlign: 'center'
        }}>
            Loading..
        </div>
    );


    return (
        <>
            {auth?.idclasse ? (
                <>
                    <JitsiMeeting
                        roomName={generateRoomName()}
                        spinner={renderSpinner}
                        config={{
                            subject: 'lalalala',
                            hideConferenceSubject: false
                        }}
                        userInfo={{
                            displayName: "Nestor"
                        }}

                        onApiReady={externalApi => handleApiReady(externalApi)}
                        onReadyToClose={handleReadyToClose}
                        getIFrameRef={handleJitsiIFrameRef1} />
                    {/*renderButtons()*/}
                    {/*renderLog()*/}
                </>
            ) :
                <p>Rejoignez une classe pour participer à une visioconférence.</p>
            }
        </>
    );
};

export default Visio;