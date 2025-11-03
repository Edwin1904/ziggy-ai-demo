
let isSpeaking = false;
// Global voice/mic flags
let micEnabled = true;
let voiceEnabledFlag = true;
let recognizing = false;

let gameMode = "easy";
const modeSelect = document.getElementById("mode");

if (modeSelect) {
  modeSelect.addEventListener("change", () => {
    gameMode = modeSelect.value;
    const modeName = modeSelect.options[modeSelect.selectedIndex].text;
    playZiggyVoice(`Yeah man, cambiamos al modo ${modeName}, mi hermano!`);
  });
}

// 🎵 Sound effects
const waitingMusic = new Audio("mixkit-bell-tick-tock-timer-1046.wav");
waitingMusic.loop = true;
waitingMusic.volume = 0.3;

const bellDing = new Audio("mixkit-achievement-bell-600.wav"); // Correct answer
const failTone = new Audio("mixkit-funny-fail-low-tone-2876.wav"); // Wrong answer
const winChime = new Audio("mixkit-video-game-win-2016.wav"); // Game win chime

// Glow helpers
function setGlowColor(color, intensity = "40px 10px") {
  document.body.style.transition = "box-shadow 0.5s cubic-bezier(0.4, 0, 0.6, 1)";
  document.body.style.boxShadow = `0 0 ${intensity} ${color}, 0 0 ${parseInt(intensity) + 10}px ${color} inset`;
  // Add pulsing animation if not already present
  if (!document.body.classList.contains("ziggy-glow-pulse")) {
    document.body.classList.add("ziggy-glow-pulse");
  }
}

function clearGlow() {
  document.body.style.transition = "box-shadow 0.5s cubic-bezier(0.4, 0, 0.6, 1)";
  document.body.style.boxShadow = "none";
  document.body.classList.remove("ziggy-glow-pulse");
}

// Add pulsing effect CSS dynamically if not present
if (!document.getElementById("ziggy-glow-style")) {
  const style = document.createElement("style");
  style.id = "ziggy-glow-style";
  style.innerHTML = `
    .ziggy-glow-pulse {
      animation: ziggyPulse 1.3s infinite alternate;
    }
    @keyframes ziggyPulse {
      0% { box-shadow: 0 0 30px 7px var(--ziggy-glow-color, #f1c40f), 0 0 50px var(--ziggy-glow-color, #f1c40f) inset; }
      100% { box-shadow: 0 0 50px 15px var(--ziggy-glow-color, #f1c40f), 0 0 70px var(--ziggy-glow-color, #f1c40f) inset; }
    }
  `;
  document.head.appendChild(style);
}

function updateZiggyStatus(text, color = "#f1c40f") {
  const statusElem = document.getElementById("ziggy-status");
  if (statusElem) {
    statusElem.innerText = text || "";
    statusElem.style.color = color;
    statusElem.style.textShadow = `0 0 10px ${color}`;
  }
  // Set CSS variable for pulsing color
  document.body.style.setProperty("--ziggy-glow-color", color);
}

window.ziggyAction = async function(mode) {
  setZiggyThinking();
  const speechDiv = document.getElementById("speech");
  if (speechDiv) speechDiv.innerText = "Ziggy está pensando...";

  // Fast local responses for hello and goodbye
  if (mode === "saluda") {
    await playZiggyVoice("Yeah man, hola mis pequeños leones! Irie vibes!", true);
    return;
  }

  if (mode === "despedirse") {
    await playZiggyVoice("Adiós mis pequeños leones, hasta la próxima! Irie vibes!", true);
    return;
  }

  await new Promise(r => setTimeout(r, 500)); // Quick 0.5 second delay

  // 1️⃣ Get Ziggy's text reply

  let prompt;
  if (mode === "explicar") {
    const baseTone = `
    Eres Ziggy, un león rastafari alegre que enseña matemáticas a los niños.
    Usa frases como “yeah man”, “mi hermano” y “irie vibes”.
    Habla en español de forma clara, divertida y educativa.
    No saludes ni te despidas, solo explica el tema con energía positiva.
    `;

    switch (gameMode) {
      case "easy":
        prompt = `${baseTone}
        Enseña cómo multiplicar números enteros de manera sencilla y visual.
        Usa ejemplos como: “Si tengo 3 cajas con 4 pelotas, en total hay 12 pelotas.”
        Explica que multiplicar es sumar el mismo número varias veces.
        Termina con una frase como “Yeah man, tú puedes mi hermano!”`;
        break;

      case "medium":
        prompt = `${baseTone}
        Explica cómo sumar y restar números enteros, incluyendo los negativos.
        Usa ejemplos como: “Si tengo -3 grados y sube 5, ahora hay 2 grados.”
        Explica que sumar un número negativo es como restar y restar un negativo es sumar.
        Cierra con “Mantén las vibes positivas, mi hermano!”`;
        break;

      case "hard":
        prompt = `${baseTone}
        Explica cómo multiplicar una fracción por un número entero.
        Usa ejemplos como: “Un medio por cuatro es igual a dos porque 1×4 = 4 y 4/2 = 2.”
        Enseña que solo se multiplica el numerador y se mantiene el denominador.
        Cierra con “Yeah man, irie vibes!”`;
        break;

      case "bonus":
        prompt = `${baseTone}
        Explica cómo calcular porcentajes fácilmente.
        Usa ejemplos como: “El 10% de 50 es 5 porque movemos el punto decimal una posición.”
        Explica que el 25% es la cuarta parte, el 50% la mitad y el 20% una quinta parte.
        Termina con “Sigue así, mi hermano, keep di vibes!”`;
        break;
    }
  } else {
    prompt = mode;
  }

  const res = await fetch("/ziggy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, prompt })
  });
  const data = await res.json();
  const ziggyText = data.text || "No hubo respuesta.";
  if (speechDiv) speechDiv.innerText = ziggyText;

  // 2️⃣ Add random Rasta intro phrases for variety
  const intros = [
    "Yeah man, ",
    "Mi hermano, ",
    "Irie vibes, mi pequeño león, ",
    "Listen up, yeah man, ",
    "Mi likkle genius, ",
    "One love, yeah man, "
  ];
  const randomIntro = intros[Math.floor(Math.random() * intros.length)];

  const finalSpeech = randomIntro + ziggyText;

  // 3️⃣ Play Ziggy's voice and animation
  try {
    await playZiggyVoice(finalSpeech);
    setZiggyIdle();
  } catch (err) {
    console.error("Error al reproducir voz:", err);
  }
};

// 🎮 Juego del León
let score = 0;
let questionCount = 0;
let currentAnswer = 0;

const ziggyIdle = document.getElementById("ziggy-idle");
const ziggyTalking = document.getElementById("ziggy-talking");
const ziggyThinking = document.getElementById("ziggy-thinking");
const ziggyListening = document.getElementById("ziggy-listening");
const ziggyVideos = [ziggyIdle, ziggyTalking, ziggyThinking, ziggyListening];

let currentVideo = null;

function showVideo(videoToShow) {
  if (!videoToShow) return;

  // Hide all other videos first to prevent overlap
  ziggyVideos.forEach(v => {
    if (v && v !== videoToShow) {
      v.classList.remove("ziggy-fade-in");
      v.classList.add("ziggy-fade-out");
      v.style.visibility = "hidden";
      v.pause();
      v.style.zIndex = "1";
    }
  });

  // Ensure the selected video is visible and plays smoothly
  videoToShow.style.visibility = "visible";
  videoToShow.style.opacity = "1";
  videoToShow.classList.remove("ziggy-fade-out");
  videoToShow.classList.add("ziggy-fade-in");
  videoToShow.loop = true;
  videoToShow.muted = true;
  videoToShow.currentTime = 0;
  videoToShow.style.zIndex = "5"; // Bring video in front of background but behind UI

  // Force repaint to fix Chrome visibility issues
  void videoToShow.offsetWidth;

  const playPromise = videoToShow.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise.catch(err => {
      console.warn("Autoplay blocked, retrying muted:", err);
      videoToShow.muted = true;
      videoToShow.play().catch(() => {});
    });
  }

  currentVideo = videoToShow;
}

function setZiggyListening() {
  if (isSpeaking) return;
  showVideo(ziggyListening);
  updateZiggyStatus("👂 Escuchando...", "#00bfff"); // Bright blue glow for listening
  setGlowColor("#00bfff", "40px 10px");
}

function setZiggyIdle() {
  showVideo(ziggyIdle);
  updateZiggyStatus("", "#f1c40f");
  clearGlow();
}

function setZiggyThinking() {
  if (isSpeaking) return;
  showVideo(ziggyThinking);
  updateZiggyStatus("🧠 Pensando...", "#00ffff"); // Cyan glow
  setGlowColor("#00ffff", "40px 10px");
}

function setZiggyTalking() {
  try {
    if (ziggyThinking) { ziggyThinking.pause(); ziggyThinking.currentTime = 0; }
    if (ziggyListening) { ziggyListening.pause(); ziggyListening.currentTime = 0; }
    if (ziggyIdle) { ziggyIdle.pause(); ziggyIdle.currentTime = 0; }
    showVideo(ziggyTalking);
    ziggyTalking.currentTime = 0;
    ziggyTalking.loop = true;
    const playPromise = ziggyTalking.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        ziggyTalking.muted = true;
        ziggyTalking.play().catch(() => {});
      });
    }
    updateZiggyStatus("", "#00ff00");
    setGlowColor("#00ff00", "40px 10px");
  } catch (e) {
    console.warn("Error starting Ziggy talking video:", e);
  }
}

function startGame() {
  score = 0;
  questionCount = 0;
  document.getElementById("feedback").innerText = "";
  document.getElementById("game-area").style.display = "block";

  switch (gameMode) {
    case "easy":
      nextEasyQuestion();
      break;
    case "medium":
      nextMediumQuestion();
      break;
    case "hard":
      nextHardQuestion();
      break;
    case "bonus":
      nextBonusQuestion();
      break;
  }
}

window.startGame = startGame;

// 🎮 Multiplayer mode placeholder
function startMultiplayerGame() {
  const gameArea = document.getElementById("game-area");
  gameArea.style.display = "block";
  gameArea.innerHTML = `
    <div id="multiplayer-lobby">
      <h2>🐾 Esperando jugadores...</h2>
      <p>Comparte este código con tus amigos para unirse:</p>
      <h3>${Math.floor(Math.random() * 9000) + 1000}</h3>
      <p>El juego comenzará pronto, mi hermano. Irie vibes!</p>
    </div>
  `;
  playZiggyVoice("Yeah man, espera tus amigos para jugar juntos en la jungla!");
}
window.startMultiplayerGame = startMultiplayerGame;

document.getElementById("start-multiplayer")?.addEventListener("click", startMultiplayerGame);

async function nextEasyQuestion() {
  if (questionCount >= 5) {
    document.getElementById("question").innerText = "";
    document.getElementById("feedback").innerText = `Terminaste, mi hermano! 🦁 Tu puntuación final: ${score}/5. Irie vibes!`;
    await playZiggyVoice(`Yeah man, mi hermano, terminaste el juego. Tu puntuación es ${score} de 5. Irie vibes!`);
    winChime.play();
    document.getElementById("game-area").style.display = "none";
    setZiggyIdle();
    return;
  }

  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  currentAnswer = a * b;
  questionCount++;

  const questionElem = document.getElementById("question");
  questionElem.innerText = `Pregunta ${questionCount}: ¿Cuánto es ${a} × ${b}?`;
  questionElem.style.fontSize = "3rem";
  await playZiggyVoice(`Pregunta ${questionCount}, mi pequeño león: ¿Cuánto es ${a} por ${b}?`);
  updateZiggyStatus("👂 Escuchando...", "#ffae42"); // Orange glow while listening
  waitingMusic.play(); // Start waiting sound
}

// ➕➖ Medium Mode: Addition & Subtraction of Integers
async function nextMediumQuestion() {
  if (questionCount >= 5) {
    document.getElementById("question").innerText = "";
    document.getElementById("feedback").innerText = `¡Terminaste el modo medio! 🦁 Tu puntuación: ${score}/5`;
    await playZiggyVoice(`Yeah man, terminaste el modo medio. Tu puntuación es ${score} de 5. Irie vibes!`);
    winChime.play();
    document.getElementById("game-area").style.display = "none";
    setZiggyIdle();
    return;
  }

  const a = Math.floor(Math.random() * 21) - 10; // -10 to 10
  const b = Math.floor(Math.random() * 21) - 10;
  const op = Math.random() > 0.5 ? "+" : "-";
  const expression = `${a} ${op} ${b}`;
  currentAnswer = op === "+" ? a + b : a - b;
  questionCount++;

  const questionElem = document.getElementById("question");
  questionElem.innerText = `Pregunta ${questionCount}: ¿Cuánto es ${expression}?`;
  questionElem.style.fontSize = "3rem";

  await playZiggyVoice(`Pregunta ${questionCount}, mi hermano: ¿Cuánto es ${a} ${op === "+" ? "más" : "menos"} ${b}?`);
  updateZiggyStatus("👂 Escuchando...", "#ffae42");
  waitingMusic.play();
}

async function nextHardQuestion() {
  if (questionCount >= 5) {
    document.getElementById("question").innerText = "";
    document.getElementById("feedback").innerText = `¡Terminaste el modo difícil, mi hermano! 🦁 Tu puntuación: ${score}/5`;
    await playZiggyVoice(`Yeah man, terminaste el modo difícil. Tu puntuación es ${score} de 5. Irie vibes!`);
    winChime.play();
    document.getElementById("game-area").style.display = "none";
    setZiggyIdle();
    return;
  }

  let multiplier = Math.floor(Math.random() * 5) + 1;
  const den = Math.floor(Math.random() * 5) + 2;
  const num = Math.floor(Math.random() * (den - 1)) + 1;
  const whole = Math.round((multiplier * den) / num);
  const fractionQuestion = `(${num}/${den}) × ${whole}`;
  currentAnswer = multiplier;
  questionCount++;

  const questionElem = document.getElementById("question");
  questionElem.innerText = `Pregunta ${questionCount}: ¿Cuánto es ${fractionQuestion}?`;
  questionElem.style.fontSize = "2.5rem";

  const fractionVoice = `Pregunta ${questionCount}, mi hermano: ¿Cuánto es ${num} sobre ${den} multiplicado por ${whole}?`;
  await playZiggyVoice(fractionVoice);
  updateZiggyStatus("👂 Escuchando...", "#ffae42");
  waitingMusic.play();
}

// 💯 Bonus Mode: Percentages
async function nextBonusQuestion() {
  if (questionCount >= 5) {
    document.getElementById("question").innerText = "";
    document.getElementById("feedback").innerText = `¡Terminaste el modo desafío rápido! 🦁 Tu puntuación: ${score}/5`;
    await playZiggyVoice(`Yeah man, terminaste el modo rápido. Tu puntuación es ${score} de 5. Irie vibes!`);
    winChime.play();
    document.getElementById("game-area").style.display = "none";
    setZiggyIdle();
    return;
  }

  let multiplier = Math.floor(Math.random() * 9) + 1;
  const percents = [10, 20, 25, 50];
  const percent = percents[Math.floor(Math.random() * percents.length)];
  const base = (multiplier * 100) / percent;
  currentAnswer = multiplier;
  questionCount++;

  const questionElem = document.getElementById("question");
  questionElem.innerText = `Pregunta ${questionCount}: ¿Cuál es el ${percent}% de ${base}?`;
  questionElem.style.fontSize = "3rem";

  await playZiggyVoice(`Pregunta ${questionCount}, mi hermano: ¿Cuál es el ${percent} por ciento de ${base}?`);
  updateZiggyStatus("👂 Escuchando...", "#ffae42");
  waitingMusic.play();
}

document.getElementById("submit-answer").addEventListener("click", async () => {
  waitingMusic.pause();
  waitingMusic.currentTime = 0;

  const userAnswer = parseFloat(document.getElementById("answer").value);
  const feedback = document.getElementById("feedback");

  // For fraction and bonus modes, allow small tolerance for float comparison
  const isCorrect = (gameMode === "hard" || gameMode === "bonus")
    ? Math.abs(userAnswer - currentAnswer) < 0.01
    : userAnswer === currentAnswer;

  if (isCorrect) {
    score++;
    feedback.innerText = "¡Excelente, mi hermano! 🦁";
    bellDing.play(); // 🔔 Play sound instantly
    await playZiggyVoice("Yeah man, correcto, mi hermano! Excelente trabajo!");
  } else {
    feedback.innerText = `No exactamente. La respuesta era ${currentAnswer}.`;
    failTone.play(); // 💀 Play fail sound immediately
    await playZiggyVoice(`Casi, mi hermano. La respuesta correcta era ${currentAnswer}. Keep di irie vibes!`);
  }

  setTimeout(() => {
    switch (gameMode) {
      case "easy": nextEasyQuestion(); break;
      case "medium": nextMediumQuestion(); break;
      case "hard": nextHardQuestion(); break;
      case "bonus": nextBonusQuestion(); break;
    }
  }, 800);
});

// Allow pressing Enter to submit answer
const answerInput = document.getElementById("answer");
if (answerInput) {
  answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("submit-answer").click();
    }
  });
}

// 🎧 Pause mic while Ziggy talks
async function playZiggyVoice(text, forceTalk = false) {
  if (isSpeaking) return;
  isSpeaking = true;

  // Check if voice feedback is enabled
  let voiceEnabled = true;
  try {
    const v = localStorage.getItem("voiceEnabled");
    if (v !== null) voiceEnabled = v === "true";
    // If the toggle exists, use it
    const voiceToggle = document.getElementById("toggle-voice");
    if (voiceToggle && typeof voiceToggle.checked === "boolean") {
      voiceEnabled = voiceToggle.checked;
    }
  } catch (e) {}
  if (!voiceEnabled) {
    isSpeaking = false;
    setZiggyIdle();
    return;
  }

  try {
    if (typeof recognition !== "undefined") recognition.abort(); // stop listening while speaking
  } catch (err) {
    console.warn("Mic stop skipped:", err && err.message);
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // --- Ensure only one video is playing and talking mode is active ---
      try {
        // Always pause and reset all non-talking videos before talking
        if (ziggyThinking) { ziggyThinking.pause(); ziggyThinking.currentTime = 0; }
        if (ziggyListening) { ziggyListening.pause(); ziggyListening.currentTime = 0; }
        if (ziggyIdle) { ziggyIdle.pause(); ziggyIdle.currentTime = 0; }
        setZiggyTalking();
      } catch (e) { console.warn("Ziggy state switch failed:", e); }

      audio.onplay = () => {
        // Already set above, but keep for compatibility
      };

      audio.onended = () => {
        isSpeaking = false;
        // Pause talking video and reset to idle after talking
        try {
          if (ziggyTalking) {
            ziggyTalking.pause();
            ziggyTalking.currentTime = 0;
          }
        } catch (e) {}
        setTimeout(() => {
          setZiggyIdle();
        }, 500);

        // restart mic after voice finishes
        setTimeout(() => {
          try {
            if (micEnabled) recognition.start();
          } catch (err) {
            console.warn("Mic restart skipped:", err && err.message);
          }
        }, 800);

        resolve();
      };

      audio.onerror = (err) => {
        isSpeaking = false;
        reject(err);
      };

      // Call setZiggyTalking() before playing audio (already above)
      audio.play();
    } catch (err) {
      console.error("Error al reproducir voz:", err);
      isSpeaking = false;
      reject(err);
    }
  });
}

// 🎤 Unified Voice Recognition System (Ziggy AI Alexa-style)
let recognition;
let recognitionReady = true;
let isListeningActive = false;
let listeningTimer;
let audioContext, analyser, micSource;
let NOISE_THRESHOLD = 0.0002; // increased sensitivity for normal talking

async function setupNoiseGate() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    micSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    micSource.connect(analyser);
  } catch (err) {
    console.warn("Noise gate init failed:", err);
  }
}

setupNoiseGate();

function getMicVolume() {
  if (!analyser) return 0;
  analyser.smoothingTimeConstant = 0.8;
  const dataArray = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const value = (dataArray[i] - 128) / 128;
    sum += value * value;
  }
  return Math.sqrt(sum / dataArray.length);
}

// ⚙️ Settings Controls Fix
window.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.createElement("button");
  settingsBtn.id = "settings-btn";
  settingsBtn.innerText = "⚙️";
  document.body.appendChild(settingsBtn);

  const settingsMenu = document.createElement("div");
  settingsMenu.id = "settings-menu";
  settingsMenu.innerHTML = `
    <h4>🎛️ Configuración</h4>
    <label>Sensibilidad del micrófono: <span id="mic-sensitivity-label">${NOISE_THRESHOLD}</span></label>
    <input type="range" id="mic-sensitivity" min="0.0001" max="0.005" step="0.00005" value="${NOISE_THRESHOLD}">
    <br>
    <label><input type="checkbox" id="toggle-mic" checked> Micrófono activo</label><br>
    <label><input type="checkbox" id="toggle-voice" checked> Voz de Ziggy activa</label>
  `;
  document.body.appendChild(settingsMenu);

  settingsBtn.onclick = () => settingsMenu.classList.toggle("show");

  // 🛠 Event bindings
  const micSlider = document.getElementById("mic-sensitivity");
  const micToggle = document.getElementById("toggle-mic");
  const voiceToggle = document.getElementById("toggle-voice");

  micSlider.addEventListener("input", () => {
    NOISE_THRESHOLD = parseFloat(micSlider.value);
    localStorage.setItem("micSensitivity", micSlider.value);
    updateSensitivityDisplay(micSlider.value);
  });

  micToggle.addEventListener("change", () => {
    micEnabled = micToggle.checked;
    localStorage.setItem("micEnabled", micEnabled);
    if (micEnabled) {
      try { recognition.start(); } catch (e) {}
    } else {
      try { recognition.abort(); } catch (e) {}
    }
  });

  voiceToggle.addEventListener("change", () => {
    voiceEnabledFlag = voiceToggle.checked;
    localStorage.setItem("voiceEnabled", voiceEnabledFlag);
  });

  // 🧠 Restore saved settings
  const savedSens = localStorage.getItem("micSensitivity");
  const savedVoice = localStorage.getItem("voiceEnabled");
  const savedMic = localStorage.getItem("micEnabled");
  if (savedSens) {
    NOISE_THRESHOLD = parseFloat(savedSens);
    micSlider.value = savedSens;
    updateSensitivityDisplay(savedSens);
  } else {
    updateSensitivityDisplay(micSlider.value);
  }
  if (savedVoice !== null) {
    voiceToggle.checked = savedVoice === "true";
    voiceEnabledFlag = voiceToggle.checked;
  }
  if (savedMic !== null) {
    micToggle.checked = savedMic === "true";
    micEnabled = micToggle.checked;
  }
});

function activateListening() {
  isListeningActive = true;
  setZiggyListening();
  document.body.style.boxShadow = "0 0 60px 15px #00bfff inset";
  clearTimeout(listeningTimer);
  listeningTimer = setTimeout(async () => {
    if (isListeningActive) {
      isListeningActive = false;
      document.body.style.boxShadow = "none";
      setZiggyIdle();
      await playZiggyVoice("Yeah man, te escucho mi hermano. ¿Qué quieres hacer?");
    }
  }, 15000); // 15 seconds active listening
}

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = false;

  // Only one onstart handler
  recognition.onstart = () => {
    recognizing = true;
    updateZiggyStatus("🎙️ Micrófono activo — di 'Ziggy' para hablar", "#00ffff");
    // Removed direct call to setZiggyListening() to avoid always showing listening animation
  };

  // Only one onend handler, most complete version
  recognition.onend = () => {
    recognizing = false;
    // micEnabled is set by the settings menu checkbox or localStorage
    if (typeof micEnabled === "undefined") {
      // fallback: try to get from checkbox
      const micToggle = document.getElementById("toggle-mic");
      micEnabled = micToggle ? micToggle.checked : true;
    }
    if (micEnabled && !isSpeaking) {
      setTimeout(() => {
        try {
          recognition.start();
          recognizing = true;
          setZiggyIdle();
        } catch (err) {
          console.warn("Recognition restart skipped:", err.message);
        }
      }, 1000);
    }
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Heard:", transcript);
    if (transcript.length < 3) return; // ignore short noise fragments

    const micVolume = getMicVolume();
    if (micVolume < NOISE_THRESHOLD) return; // ignore low-volume background noise

    // 🗣️ Voice answer recognition during game
    if (document.getElementById("game-area") && document.getElementById("game-area").style.display === "block") {
      const numMatch = transcript.match(/\d+(\.\d+)?/);
      if (numMatch) {
        const voiceAnswer = parseFloat(numMatch[0]);
        document.getElementById("answer").value = voiceAnswer;
        document.getElementById("submit-answer").click();
        return;
      }
    }

    // Wake word detection (allow immediate command)
    if (
      transcript.includes("ziggy") ||
      transcript.includes("sigue") ||
      transcript.includes("sigui") ||
      transcript.includes("cigui") ||
      transcript.includes("ciggy") ||
      transcript.includes("tigre") ||
      transcript.includes("llegué") ||
      transcript.includes("león")
    ) {
      setZiggyListening();
      activateListening();

      // check for immediate follow-up command
      setTimeout(() => {
        const words = transcript.split(" ");
        // Find the first wake word in the transcript, then grab the words after
        const wakeWords = ["ziggy","sigue","sigui","cigui","ciggy","tigre","llegué","león","siri"];
        let foundIdx = -1;
        for (const w of wakeWords) {
          const idx = words.indexOf(w);
          if (idx >= 0 && (foundIdx === -1 || idx < foundIdx)) foundIdx = idx;
        }
        const lastWords = foundIdx >= 0 ? words.slice(foundIdx + 1).join(" ") : "";
        if (lastWords) {
          console.log("Immediate follow-up command detected:", lastWords);
          handleVoiceCommand(lastWords);
        }
      }, 1000); // allow 1 second pause after 'Ziggy'
      return;
    }

    // Command detection after wake word or during active listening
    if (isListeningActive || transcript.startsWith("ziggy")) {
      console.log("Command detected:", transcript);
      await handleVoiceCommand(transcript);
      // After executing command, reset listening state and animation
      isListeningActive = false;
      setZiggyIdle();
    }
  };

  // Helper for handling voice commands
  async function handleVoiceCommand(transcript) {
    clearTimeout(listeningTimer);
    isListeningActive = false;
    document.body.style.boxShadow = "none";
    setZiggyIdle();

    if (transcript.includes("explica") || transcript.includes("enseña")) {
      await ziggyAction("explicar");
    } else if (transcript.includes("juego") || transcript.includes("jugar")) {
      startGame();
    } else if (transcript.includes("hola") || transcript.includes("saluda")) {
      await ziggyAction("saluda");
    } else if (transcript.includes("adiós") || transcript.includes("chao")) {
      await ziggyAction("despedirse");
    } else {
      await playZiggyVoice("No entendí eso, mi hermano. Intenta otra vez.");
    }
  }

  recognition.onerror = (event) => {
    if (event.error === "no-speech" || event.error === "aborted") return;
    console.error("Recognition error:", event.error);
  };

recognition.onend = () => {
  recognizing = false;
  // micEnabled is set by the settings menu checkbox
  if (typeof micEnabled === "undefined") {
    // fallback: try to get from checkbox
    const micToggle = document.getElementById("toggle-mic");
    window.micEnabled = micToggle ? micToggle.checked : true;
  }
  if (micEnabled && !isSpeaking) {
    setTimeout(() => {
      try {
        recognition.start();
        recognizing = true;
        setZiggyIdle();
      } catch (err) {
        console.warn("Recognition restart skipped:", err.message);
      }
    }, 1000);
  }
};

  recognition.start();
} else {
  console.warn("Speech recognition not supported in this browser.");
}

// 🦁 Ensure Ziggy appears immediately when the page loads
window.addEventListener("DOMContentLoaded", () => {
  try {
    setZiggyIdle();
  } catch (e) {
    console.error("Error showing Ziggy idle on load:", e);
  }
  // Attempt autoplay on all Ziggy videos
  [ziggyIdle, ziggyTalking, ziggyThinking, ziggyListening].forEach(v => {
    if (v) {
      v.muted = true;
      v.loop = true;
      // Try to play, fallback if blocked
      v.play().catch(err => {
        // Try to re-enable autoplay if blocked
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  });
});

// Add fade CSS for video transitions if not present
if (!document.getElementById("ziggy-fade-style")) {
  const fadeStyle = document.createElement("style");
  fadeStyle.id = "ziggy-fade-style";
  fadeStyle.innerHTML = `
    video.ziggy-fade-in {
      opacity: 1 !important;
      transition: opacity 0.35s cubic-bezier(0.4,0,0.6,1);
      z-index: 2;
    }
    video.ziggy-fade-out {
      opacity: 0 !important;
      transition: opacity 0.35s cubic-bezier(0.4,0,0.6,1);
      z-index: 1;
    }
    video#ziggy-idle, video#ziggy-talking, video#ziggy-thinking, video#ziggy-listening {
      opacity: 0;
      visibility: hidden;
      position: absolute;
      left: 0; top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      background: transparent;
    }
    video.ziggy-fade-in {
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto;
      z-index: 2;
    }
  `;
  document.head.appendChild(fadeStyle);
}
function updateSensitivityDisplay(value) {
  const label = document.querySelector("#mic-sensitivity-label");
  if (label) label.innerText = `Sensibilidad actual: ${parseFloat(value).toFixed(4)}`;
}