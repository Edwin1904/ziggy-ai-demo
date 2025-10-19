import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/ziggy", async (req, res) => {
  const { mode } = req.body;
  let prompt = "";

  // Common intro tone for all modes
  const baseTone = `
  Eres Ziggy, un león rastafari amistoso y divertido. 
  Habla con los niños en español usando expresiones caribeñas como 
  “yeah man”, “mi hermano”, “irie vibes” o “mi pequeño león”. 
  Usa un tono alegre, relajado y educativo. 
  No traduzcas esas frases al español — déjalas tal cual. 
  Mantén una vibra positiva, divertida y de maestro sabio.
  `;

  if (mode === "saluda") {
    prompt = `${baseTone}
    Saluda a los niños con energía y entusiasmo, 
    dales la bienvenida a la jungla de las matemáticas.`;
  } else if (mode === "multiplicar") {
    prompt = `${baseTone}
    Explica cómo multiplicar de forma sencilla, con ejemplos usando frutas o juguetes.
    Termina animándolos con un “yeah man” o “irie vibes”.`;
  } else if (mode === "jugar") {
    prompt = `${baseTone}
    Juega al “Juego del León” con cinco preguntas de multiplicación. 
    Espera unos segundos antes de decir la respuesta. 
    Después de cada acierto, anima con frases como “¡Excelente, mi hermano!” o “¡Yeah man, irie vibes!”`;
  } else if (mode === "despedirse") {
    prompt = `${baseTone}
    Despídete con cariño y alegría, 
    diciéndoles que sigan estudiando con irie vibes.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const answer = completion?.choices?.[0]?.message?.content || "No response.";
    res.json({ text: answer });
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    res.status(500).json({ text: "Error: " + err.message });
  }
});

// 🗣️ TTS endpoint for Ziggy's Rasta-style voice
app.post("/tts", async (req, res) => {
  const { text } = req.body;

  // ✅ Just pass the message itself to TTS
  // We’ll give the voice style using the "voice" parameter only
  try {
    const ttsResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "verse", // deep, raspy male tone
      input: text,    // only Ziggy's message, no instructions
      format: "mp3"
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length
    });
    res.send(audioBuffer);
  } catch (err) {
    console.error("❌ TTS Error:", err);
    res.status(500).send("TTS failed");
  }
});

// ✅ Server start
app.listen(3000, () => console.log("✅ Ziggy running at http://localhost:3000"));