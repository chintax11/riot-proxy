const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Utilise la clé depuis Render (Environment Variables)
const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.post("/import", async (req, res) => {
  try {
    const { riotId } = req.body;

    if (!riotId) {
      return res.status(400).json({ error: "Missing riotId" });
    }

    const [gameName, tagLine] = riotId.split("#");

    if (!gameName || !tagLine) {
      return res.status(400).json({ error: "Invalid Riot ID format. Use gameName#tagLine" });
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

// IMPORTANT pour Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});