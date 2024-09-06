//웹소켓을 아래 변수로 지정 후 백앤드로 socket으로 넘기고 있다.
const socket = io();

const welcome = document.getElementById("welcome");
const nickname = document.getElementById("nickname");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
welcome.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${value}`);
  });
  input.value = "";
}

function handleNickNameSubmit(event) {
  event.preventDefault();
  const input = nickname.querySelector("input");
  socket.emit("nickname", input.value);
  nickname.hidden = true;
  welcome.hidden = false;
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgFrm = room.querySelector("#msg");
  const nickname = room.querySelector("#nickname");
  msgFrm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  //socket.emit과 백앤드 socket.on은 "enter_room"과 같이 동일변수로 짝지어서 사용해야 한다.
  //마지막 인자(argument)는 반드시 function(함수)가 들어가야한다!!!
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

nickname.addEventListener("submit", handleNickNameSubmit);

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} just joined`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} just left😥`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
socket.on("disconnect", console.log("Disconnected from wsServer"));
