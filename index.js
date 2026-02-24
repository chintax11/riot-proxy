const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Clé Riot depuis Render (Environment Variable)
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// 🌍 Port dynamique pour Render
const PORT = process.env.PORT || 3001;

/* ===============================
   TEST ROOT ROUTE
=================================*/
app.get("/", (req, res) => {
  res.json({ message: "Riot Proxy API is running 🚀" });
});

/* ===============================
   1️⃣ IMPORT (RiotID → PUUID)
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
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   2️⃣ RANK (PUUID → Rank)
=================================*/
app.post("/rank", async (req, res) => {
  try {
    const { puuid } = req.body;

    if (!puuid) {
      return res.status(400).json({ error: "Missing puuid" });
    }

    // 🔎 Get Summoner ID
    const summonerRes = await fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    );

    const summonerData = await summonerRes.json();

    if (!summonerRes.ok) {
      return res.status(summonerRes.status).json(summonerData);
    }

    // 🏆 Get Rank
    const rankRes = await fetch(
      `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${RIOT_API_KEY}`
    );

    const rankData = await rankRes.json();

    res.json(rankData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   3️⃣ MATCH HISTORY (PUUID → IDs)
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
      return res.status(matchRes.status).json(matchData);
    }

    res.json(matchData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   4️⃣ MATCH DETAIL
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
      return res.status(detailRes.status).json(detailData);
    }

    res.json(detailData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   START SERVER
=================================*/
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});