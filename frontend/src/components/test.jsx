const test = () => {
    const meeting = new window.VideoSDKMeeting();
  
    const config = {
      name: "RomainReghem",
      apiKey: "4a7841d4-6393-47bf-87b8-80f9331008e5", 
      meetingId: "EDTECH_DEMO", 

      redirectOnLeave: "https://www.videosdk.live/",

      micEnabled: true,
      webcamEnabled: true,
      participantCanToggleSelfWebcam: true,
      participantCanToggleSelfMic: true,
      screenShareEnabled:true,


      joinScreen: {
        visible: true, // Show the join screen ?
        title: "EdTech Quick start", // Meeting title
        meetingUrl: window.location.href, // Meeting joining url
      },
    };

    meeting.init(config);
    return (
        <p>test</p>
    )
}

export default test;