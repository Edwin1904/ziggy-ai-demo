async function ziggyAction(mode) {
    const speechDiv = document.getElementById("speech");
    speechDiv.innerText = "Ziggy está pensando...";
  
    // 1️⃣ Get Ziggy's text reply
    const res = await fetch("/ziggy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    const data = await res.json();
    const ziggyText = data.text || "No hubo respuesta.";
    speechDiv.innerText = ziggyText;
  
    // 2️⃣ Add random Rasta intro phrases for variety
    const intros = [
      "Yeah man, ",
      "Mi hermano, ",
      "Irie vibes, mi pequeño león, ",
      "Listen up, yeah man, ",
      "Mi likkle genius, ",
      "Bless up, mi hermano, ",
      "One love, yeah man, ",
      "Keep learning strong, mi pequeño león, "
    ];
    const randomIntro = intros[Math.floor(Math.random() * intros.length)];
  
    // Combine intro + Ziggy text
    const finalSpeech = randomIntro + ziggyText;
  
    // 3️⃣ Send to TTS route and play audio
    try {
      const audioResponse = await fetch("/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalSpeech })
      });
  
      const blob = await audioResponse.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const ziggyImg = document.getElementById("ziggy");

    // 🦁 Reset Ziggy’s animation before each new line
    ziggyImg.classList.remove("talking");

    // Wait until audio is fully ready
    audio.addEventListener("canplay", () => {
    // Start animation when playback begins
    audio.addEventListener("play", () => {
        ziggyImg.classList.add("talking");
    });

    // Stop animation when paused or finished
    audio.addEventListener("pause", () => {
        ziggyImg.classList.remove("talking");
    });

    audio.addEventListener("ended", () => {
        ziggyImg.classList.remove("talking");
    });

    // Start playing
    audio.play();
    });

    // Safety: stop animation if something goes wrong
    setTimeout(() => ziggyImg.classList.remove("talking"), 30000);
    
            } catch (err) {
            console.error("Error al reproducir voz:", err);
            }
        }