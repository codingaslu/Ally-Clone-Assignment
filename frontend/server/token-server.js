import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AccessToken } from "livekit-server-sdk";

dotenv.config({ path: "../.env" });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());

app.get("/api/token", async (req, res) => {
  try {
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET",
      });
    }

    const roomName = String(req.query.room || "shals-vision-room");
    const participantName = String(
      req.query.name || `student-${Math.floor(Math.random() * 10000)}`
    );

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    res.json({
      token: await token.toJwt(),
      url: livekitUrl,
      room: roomName,
      identity: participantName,
    });
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).json({ error: "Unable to create LiveKit token" });
  }
});

app.listen(port, () => {
  console.log(`Token server running at http://localhost:${port}`);
});
