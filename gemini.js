// gemini.js
import fetch from "node-fetch";

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function fetchChatResponse(systemPrompt, userMessage) {
  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
          }
        ]
      })
    });

    const data = await res.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API Error:", data);
      return "ขอโทษนะ ตอนนี้ฉันตอบไม่ได้ 😅";
    }
  } catch (error) {
    console.error("fetchChatResponse error", error);
    return "มีปัญหาในการเชื่อมต่อกับ Gemini API 😢";
  }
}
