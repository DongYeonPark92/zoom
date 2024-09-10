//웹소켓을 아래 변수로 지정 후 백앤드로 socket으로 넘기고 있다.
const socket = io();

const myFace = document.getElementById("myFace");
const btnMute = document.getElementById("mute");
const btnCamera = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let camera = false;
let roomName = "";
let myPeerConnection;

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((devices) => devices.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? initialConstrains : cameraConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCamera();
    }
  } catch (e) {
    console.log(e);
  }
}
function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  if (!muted) {
    btnMute.innerText = "Unmute";
    muted = true;
  } else {
    btnMute.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!camera) {
    btnCamera.innerText = "Turn On Camera";
    camera = true;
  } else {
    btnCamera.innerText = "Turn Off Camera";
    camera = false;
  }
}

async function handleCameraChange() {
  await getMedia(cameraSelect.value);
}

btnMute.addEventListener("click", handleMuteClick);
btnCamera.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

//welcome Form (join_room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

//채팅방에 입장하는
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//socket code(다른 사용자가 방에 입장할 경우 당사자 브라우저에서 실행)
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("Sent the offer");
  socket.emit("offer", offer, roomName);
});

//다른 사용자 브라우저에서 실행되는 코드
socket.on("offer", async (offer) => {
  console.log("Received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("Sent the answer");
});

socket.on("answer", (answer) => {
  console.log("Received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("Received candidate");
  myPeerConnection.addIceCandidate(ice);
});
//RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("Sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}
