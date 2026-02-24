const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const RIOT_API_KEY = "RGAPI-5889fd04-2a8b-4233-bfca-e27687a0026a";

app.post("/import", async (req, res) => {
  try {
    const { riotId } = req.body;

    if (!riotId) {
      return res.status(400).json({ error: "Missing riotId" });
    }

    const [gameName, tagLine] = riotId.split("#");

    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${RIOT_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Proxy running on http://localhost:3001");
});