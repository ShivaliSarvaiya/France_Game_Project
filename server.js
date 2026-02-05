const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let players = {}; // stores all player profiles

const buildingTypes = {
  house: { cost: 50, income: 5 },
  cafe: { cost: 120, income: 12 },
  hotel: { cost: 300, income: 30 },
  bridge: { cost: 500, income: 55 },
  eiffel: { cost: 2000, income: 0 }
};

function getPlayer(name) {
  if (!players[name]) {
    players[name] = {
      name,
      money: 200,
      theme: "light",
      buildings: [],
      nextId: 1
    };
  }
  return players[name];
}

// PLAYER DATA
app.get("/api/player/:name", (req, res) => {
  res.json(getPlayer(req.params.name));
});

app.put("/api/player/:name/theme", (req, res) => {
  const player = getPlayer(req.params.name);
  player.theme = req.body.theme;
  res.json(player);
});

app.put("/api/player/:name/money", (req, res) => {
  const player = getPlayer(req.params.name);
  player.money = req.body.money;
  res.json(player);
});

// BUILDINGS
app.get("/api/player/:name/buildings", (req, res) => {
  res.json(getPlayer(req.params.name).buildings);
});

app.post("/api/player/:name/buildings", (req, res) => {
  const player = getPlayer(req.params.name);
  const { type, x, y } = req.body;
  const info = buildingTypes[type];

  if (!info) return res.status(400).json({ error: "Invalid building type" });
  if (player.money < info.cost)
    return res.status(400).json({ error: "Not enough money" });

  player.money -= info.cost;

  const building = {
    id: player.nextId++,
    type,
    level: 1,
    x,
    y
  };

  player.buildings.push(building);
  res.status(201).json({ building, money: player.money });
});

app.put("/api/player/:name/buildings/:id", (req, res) => {
  const player = getPlayer(req.params.name);
  const building = player.buildings.find(b => b.id == req.params.id);

  if (!building) return res.status(404).json({ error: "Not found" });
  if (building.level >= 2)
    return res.status(400).json({ error: "Max level reached" });

  const cost = buildingTypes[building.type].cost;
  if (player.money < cost)
    return res.status(400).json({ error: "Not enough money" });

  player.money -= cost;
  building.level = 2;

  res.json({ building, money: player.money });
});

app.listen(PORT, () => console.log("Server running at http://localhost:" + PORT));

