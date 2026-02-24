const express = require("express");
const cors = require("cors");

const app = express();

/* ===============================
   CONFIG
=================================*/
const REGION = "euw1"; // ⚠️ change ici si besoin
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const PORT = process.env.PORT || 3001;

/* ===============================
   MIDDLEWARE
=================================*/
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/* ===============================
   DEBUG ENV
=================================*/
console.log("🔐 RIOT KEY:", RIOT_API_KEY);

if (!RIOT_API_KEY) {
  console.error("❌ RIOT_API_KEY is missing in environment variables");
}

/* ===============================
   ROOT TEST
=================================*/
app.get("/", (req, res) => {
  res.json({ message: "Riot Proxy API is running 🚀" });
});

/* ===============================
   TEST RIOT PLATFORM ACCESS
=================================*/
app.get("/test-rank", async (req, res) => {
  try {
    const test = await fetch(
      `https://${REGION}.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${RIOT_API_KEY}`
    );

    const data = await test.json();

    if (!test.ok) {
      console.error("❌ Test rank error:", data);
      return res.status(test.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error("Server error /test-rank:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   IMPORT (RiotID → PUUID)
=================================*/
app.post("/import", async (req, res) => {
  try {
    const { riotId } = req.body;

    if (!riotId) {
      return res.status(400).json({ error: "Missing riotId" });
    }

    const [gameName, tagLine] = riotId.split("#");

    if (!gameName || !tagLine) {
      return res.status(400).json({
        error: "Invalid Riot ID format. Use gameName#tagLine"
      });
    }

    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${RIOT_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Import error:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error("Server error /import:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   RANK (PUUID → Rank)
=================================*/
app.post("/rank", async (req, res) => {
  try {
    const { puuid } = req.body;

    if (!puuid) {
      return res.status(400).json({ error: "Missing puuid" });
    }

    const summonerRes = await fetch(
      `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    );

    const summonerData = await summonerRes.json();

    if (!summonerRes.ok) {
      console.error("❌ Summoner fetch error:", summonerData);
      return res.status(summonerRes.status).json(summonerData);
    }

    const summonerId = summonerData.id;

    const rankRes = await fetch(
      `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${RIOT_API_KEY}`
    );

    const rankData = await rankRes.json();

    if (!rankRes.ok) {
      console.error("❌ Rank fetch error:", rankData);
      return res.status(rankRes.status).json(rankData);
    }

    res.json(rankData);

  } catch (error) {
    console.error("Server error /rank:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   MATCH HISTORY
=================================*/
app.post("/matches", async (req, res) => {
  try {
    const { puuid } = req.body;

    if (!puuid) {
      return res.status(400).json({ error: "Missing puuid" });
    }

    const matchRes = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10&api_key=${RIOT_API_KEY}`
    );

    const matchData = await matchRes.json();

    if (!matchRes.ok) {
      console.error("❌ Match history error:", matchData);
      return res.status(matchRes.status).json(matchData);
    }

    res.json(matchData);

  } catch (error) {
    console.error("Server error /matches:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   MATCH DETAIL
=================================*/
app.post("/match-detail", async (req, res) => {
  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: "Missing matchId" });
    }

    const detailRes = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`
    );

    const detailData = await detailRes.json();

    if (!detailRes.ok) {
      console.error("❌ Match detail error:", detailData);
      return res.status(detailRes.status).json(detailData);
    }

    res.json(detailData);

  } catch (error) {
    console.error("Server error /match-detail:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   START SERVER
=================================*/
app.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});
app.get("/debug-key", (req, res) => {
  if (!RIOT_API_KEY) {
    return res.json({ error: "NO KEY FOUND" });
  }

  res.json({
    keyStart: RIOT_API_KEY.substring(0, 10),
    length: RIOT_API_KEY.length
  });
});