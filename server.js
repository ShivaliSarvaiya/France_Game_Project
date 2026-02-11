const express = require("express");
const app = express();
const PORT = 3001;

app.use(express.json());

let players = {};

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

/* ========= API ROUTES ========= */

app.put("/api/player/:name/money", (req, res) => {
  const player = getPlayer(req.params.name);
  const { money } = req.body;

  if (typeof money !== "number") {
    return res.status(400).json({ error: "Invalid money value" });
  }

  player.money = money; 
  res.json({ money: player.money });
});

app.get("/api/player/:name", (req, res) => {
  res.json(getPlayer(req.params.name));
});

app.put("/api/player/:name/theme", (req, res) => {
  const player = getPlayer(req.params.name);
  if (!req.body.theme) return res.status(400).json({ error: "Theme required" });

  player.theme = req.body.theme;
  res.json(player);
});

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

app.delete("/api/player/:name/buildings/:id", (req, res) => {
  const player = getPlayer(req.params.name);
  const index = player.buildings.findIndex(b => b.id == req.params.id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  player.buildings.splice(index, 1);
  res.json({ message: "Building deleted" });
});

/* ========= STATIC FILES (LAST) ========= */
app.use(express.static("public"));

app.listen(PORT, () => console.log("Server running at http://localhost:" + PORT));
