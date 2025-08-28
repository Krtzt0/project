// index.js
import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import fetch from "node-fetch";
import { fetchChatResponse } from "./gemini.js";

const app = express();
app.use(bodyParser.json());

// ENV
const PORT = process.env.PORT || 3000;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// ✅ ตรวจสอบ signature จาก LINE
function validateSignature(req) {
  const body = JSON.stringify(req.body);
  const signature = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");

  return signature === req.headers["x-line-signature"];
}

// ✅ ส่งข้อความกลับไปที่ LINE
async function replyMessage(replyToken, text) {
  const url = "https://api.line.me/v2/bot/message/reply";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
  };
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: "text", text }],
  });

  await fetch(url, { method: "POST", headers, body });
}

// ✅ Webhook
app.post("/webhook", async (req, res) => {
  if (!validateSignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  const events = req.body.events;
  if (!events || events.length === 0) return res.sendStatus(200);

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      const systemPrompt =
        "คุณคือ Mochi แชทบอทผู้ช่วยสุดน่ารัก ตอบแบบสั้น กระชับ และเป็นกันเอง";

      const reply = await fetchChatResponse(systemPrompt, userMessage);

      await replyMessage(event.replyToken, reply);
    }
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
