import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const PORT = 3001;
const DATA_DIR = path.resolve("server/data");
const PLAYERS_PATH = path.join(DATA_DIR, "players.json");

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(body));
}

function createToken() {
  return `luma-${crypto.randomUUID()}`;
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function sanitizeUsername(username) {
  return username.trim().toLowerCase();
}

async function fetchDndBeyondSheet(urlString) {
  const response = await fetch(urlString, {
    headers: {
      "User-Agent": "LumaPrimeMarketplace/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to load D&D Beyond sheet (${response.status}).`);
  }

  return response.text();
}

function parseDndBeyondGold(html) {
  const patterns = [
    /"gold"\s*:\s*(\d+(?:\.\d+)?)/i,
    /"gp"\s*:\s*(\d+(?:\.\d+)?)/i,
    /gold[^0-9]{0,12}(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*gp\b/i,
    /(\d+(?:\.\d+)?)\s*gold\b/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const value = Number.parseFloat(match[1]);
      if (Number.isFinite(value) && value >= 0) {
        return Math.round(value);
      }
    }
  }

  return null;
}

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PLAYERS_PATH);
  } catch {
    await fs.writeFile(PLAYERS_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function readPlayers() {
  const raw = await fs.readFile(PLAYERS_PATH, "utf8");
  return JSON.parse(raw);
}

async function writePlayers(players) {
  await fs.writeFile(PLAYERS_PATH, JSON.stringify(players, null, 2), "utf8");
}

function normalizePlayer(player) {
  return {
    id: player.id,
    username: player.username,
    loginCount: player.loginCount || 0,
    favorites: Array.isArray(player.favorites) ? player.favorites : [],
    createdAt: player.createdAt,
    lastLoginAt: player.lastLoginAt,
    badges: player.badges || []
  };
}

function buildProfile(player) {
  return {
    player: normalizePlayer(player),
    favorites: Array.isArray(player.favorites) ? player.favorites : []
  };
}

async function findPlayerByToken(token) {
  const players = await readPlayers();
  return players.find((player) => player.tokens?.includes(token)) || null;
}

async function authenticatePlayer(username, password) {
  const players = await readPlayers();
  const normalizedUsername = sanitizeUsername(username);
  const player = players.find((entry) => entry.username === normalizedUsername);

  if (!player) {
    return null;
  }

  const candidateHash = hashPassword(password, player.salt);
  if (candidateHash !== player.passwordHash) {
    return null;
  }

  return player;
}

async function createPlayer(username, password) {
  const normalizedUsername = sanitizeUsername(username);
  const players = await readPlayers();

  if (players.some((entry) => entry.username === normalizedUsername)) {
    throw new Error("Username already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const token = createToken();
  const player = {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    salt,
    passwordHash: hashPassword(password, salt),
    favorites: [],
    loginCount: 1,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    tokens: [token]
  };

  players.push(player);
  await writePlayers(players);

  return { token, player: buildProfile(player) };
}

async function loginPlayer(username, password) {
  const player = await authenticatePlayer(username, password);
  if (!player) {
    throw new Error("Invalid username or password.");
  }

  const token = createToken();
  player.tokens = Array.from(new Set([...(player.tokens || []), token]));
  player.loginCount = (player.loginCount || 0) + 1;
  player.lastLoginAt = new Date().toISOString();

  const players = await readPlayers();
  const index = players.findIndex((entry) => entry.id === player.id);
  if (index >= 0) {
    players[index] = player;
    await writePlayers(players);
  }

  return { token, player: buildProfile(player) };
}

async function logoutToken(token) {
  const players = await readPlayers();
  const index = players.findIndex((entry) => entry.tokens?.includes(token));

  if (index >= 0) {
    players[index].tokens = (players[index].tokens || []).filter((entry) => entry !== token);
    await writePlayers(players);
  }
}

async function toggleFavorite(token, itemId) {
  const player = await findPlayerByToken(token);
  if (!player) {
    throw new Error("Not authenticated.");
  }

  const favorites = Array.isArray(player.favorites) ? [...player.favorites] : [];
  const existing = favorites.includes(itemId);
  const nextFavorites = existing ? favorites.filter((entry) => entry !== itemId) : [...favorites, itemId];

  const players = await readPlayers();
  const index = players.findIndex((entry) => entry.id === player.id);
  if (index >= 0) {
    players[index].favorites = nextFavorites;
    await writePlayers(players);
  }

  return nextFavorites;
}

async function getFavorites(token) {
  const player = await findPlayerByToken(token);
  if (!player) {
    throw new Error("Not authenticated.");
  }

  return Array.isArray(player.favorites) ? player.favorites : [];
}

async function getProfile(token) {
  const player = await findPlayerByToken(token);
  if (!player) {
    throw new Error("Not authenticated.");
  }

  return buildProfile(player);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    jsonResponse(res, 204, {});
    return;
  }

  if (!req.url) {
    jsonResponse(res, 400, { error: "Missing URL" });
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathName = url.pathname;

    if (pathName === "/api/auth/register" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const { username, password } = payload;

          if (!username || !password) {
            jsonResponse(res, 400, { error: "Username and password are required." });
            return;
          }

          if (password.length < 6) {
            jsonResponse(res, 400, { error: "Password must be at least 6 characters." });
            return;
          }

          const result = await createPlayer(username, password);
          jsonResponse(res, 201, result);
        } catch (error) {
          jsonResponse(res, 400, { error: error.message || "Unable to register player." });
        }
      });
      return;
    }

    if (pathName === "/api/auth/login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const { username, password } = payload;

          if (!username || !password) {
            jsonResponse(res, 400, { error: "Username and password are required." });
            return;
          }

          const result = await loginPlayer(username, password);
          jsonResponse(res, 200, result);
        } catch (error) {
          jsonResponse(res, 401, { error: error.message || "Unable to log in." });
        }
      });
      return;
    }

    if (pathName === "/api/auth/logout" && req.method === "POST") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : url.searchParams.get("token");

      if (!token) {
        jsonResponse(res, 401, { error: "Missing token." });
        return;
      }

      await logoutToken(token);
      jsonResponse(res, 200, { ok: true });
      return;
    }

    if (pathName === "/api/player/me" && req.method === "GET") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : url.searchParams.get("token");

      if (!token) {
        jsonResponse(res, 401, { error: "Missing token." });
        return;
      }

      const data = await getProfile(token);
      jsonResponse(res, 200, data);
      return;
    }

    if (pathName === "/api/player/favorites" && req.method === "GET") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : url.searchParams.get("token");

      if (!token) {
        jsonResponse(res, 401, { error: "Missing token." });
        return;
      }

      const favorites = await getFavorites(token);
      jsonResponse(res, 200, { favorites });
      return;
    }

    if (pathName === "/api/dndbeyond/sync" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const sheetUrl = payload.sheetUrl?.trim();

          if (!sheetUrl) {
            jsonResponse(res, 400, { error: "A public D&D Beyond character sheet URL is required." });
            return;
          }

          const normalizedUrl = new URL(sheetUrl);
          if (!["www.dndbeyond.com", "dndbeyond.com"].includes(normalizedUrl.hostname)) {
            jsonResponse(res, 400, { error: "Please provide a public D&D Beyond character sheet URL." });
            return;
          }

          const html = await fetchDndBeyondSheet(normalizedUrl.toString());
          const gold = parseDndBeyondGold(html);

          if (gold === null) {
            jsonResponse(res, 422, { error: "Could not find gold on the provided character sheet." });
            return;
          }

          jsonResponse(res, 200, {
            gold,
            sourceUrl: normalizedUrl.toString(),
            syncedAt: new Date().toISOString()
          });
        } catch (error) {
          jsonResponse(res, 400, { error: error.message || "Unable to sync D&D Beyond gold." });
        }
      });
      return;
    }

    if (pathName === "/api/player/favorites" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const authHeader = req.headers.authorization || "";
          const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : payload.token;

          if (!token) {
            jsonResponse(res, 401, { error: "Missing token." });
            return;
          }

          const favorites = await toggleFavorite(token, payload.itemId);
          jsonResponse(res, 200, { favorites });
        } catch (error) {
          jsonResponse(res, 400, { error: error.message || "Unable to update favorites." });
        }
      });
      return;
    }

    jsonResponse(res, 404, { error: "Not found" });
  } catch (error) {
    jsonResponse(res, 500, { error: error.message || "Server error" });
  }
});

await ensureStorage();
server.listen(PORT, () => {
  console.log(`LumaPrime API running on http://localhost:${PORT}`);
});
