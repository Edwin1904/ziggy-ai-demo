// 🎮 Ziggy Multiplayer Client Script
const socket = io();
const nameInput = document.getElementById("name");
const joinBtn = document.getElementById("join");
const questionDiv = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const statusDiv = document.getElementById("status");

let playerName = null;

// Player joins game
joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) {
    statusDiv.innerText = "Por favor, escribe tu nombre.";
    return;
  }
  playerName = name;
  socket.emit("joinGame", playerName);
  nameInput.style.display = "none";
  joinBtn.style.display = "none";
  statusDiv.innerText = `¡Bienvenido, ${playerName}! Espera a que comience el juego...`;
};

// Receive questions from the server
socket.on("question", q => {
  questionDiv.innerText = q.text;
  answersDiv.innerHTML = "";
  statusDiv.innerText = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => {
      socket.emit("answer", opt);
      answersDiv.innerHTML = "";
      statusDiv.innerText = "Respuesta enviada 🦁";
    };
    answersDiv.appendChild(btn);
  });
});

// Update player progress
socket.on("updatePlayers", players => {
  const player = players[socket.id];
  if (player) {
    statusDiv.innerText = `Progreso: ${player.progress}% | Puntuación: ${player.score}`;
  }
});

// Notify if disconnected
socket.on("disconnect", () => {
  statusDiv.innerText = "❌ Conexión perdida con el servidor.";
});

// Connection confirmation
socket.on("connect", () => {
  console.log("Conectado al servidor del juego de Ziggy");
});
