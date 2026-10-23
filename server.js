require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Player = require("./models/Players");
const Game = require("./models/Game");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (!MONGODB_URI) {
  console.error("Configuration error: MONGODB_URI is missing from .env");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL.split(",").map((url) => url.trim()),
  })
);

app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// API error helper
function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ error: message });
}

// Validate request body fields
function validatePlayer(body) {
  const { username, game, level } = body;

  if (typeof username !== "string" || !username.trim()) {
    return "Username is required.";
  }

  if (typeof game !== "string" || !game.trim()) {
    return "Game is required.";
  }

  if (
    level === undefined ||
    level === null ||
    level === "" ||
    !Number.isFinite(Number(level)) ||
    Number(level) < 0
  ) {
    return "Level must be a non-negative number.";
  }

  return null;
}

function validateGame(body) {
  const { name, genre } = body;

  if (typeof name !== "string" || !name.trim()) {
    return "Game name is required.";
  }

  if (typeof genre !== "string" || !genre.trim()) {
    return "Genre is required.";
  }

  return null;
}

function cleanPlayer(body) {
  return {
    username: body.username.trim(),
    game: body.game.trim(),
    level: Number(body.level),
  };
}

function cleanGame(body) {
  return {
    name: body.name.trim(),
    genre: body.genre.trim(),
  };
}

// Validate MongoDB document IDs before database operations
function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Online Gaming Record System API",
    status: "online",
  });
});

// Health check: distinguishes server availability from DB connectivity
app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    server: "online",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Existing status route — playersOnline remains demo data
app.get("/api/status", (req, res) => {
  res.json({
    server: "Online",
    playersOnline: 1250,
    maintenance: false,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    playersOnlineIsDemoValue: true,
  });
});

// ==================== PLAYERS ====================

// Get all players
app.get("/api/players", async (req, res, next) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    next(error);
  }
});

// Create player
app.post("/api/players", async (req, res, next) => {
  try {
    const validationError = validatePlayer(req.body);

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const player = await Player.create(cleanPlayer(req.body));
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
});

// Update player
app.put("/api/players/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid player ID.");
    }

    const validationError = validatePlayer(req.body);

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      cleanPlayer(req.body),
      { new: true, runValidators: true }
    );

    if (!player) {
      return sendError(res, 404, "Player not found.");
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
});

// Delete player
app.delete("/api/players/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid player ID.");
    }

    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return sendError(res, 404, "Player not found.");
    }

    res.json({ message: "Player deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// ==================== GAMES ====================

// Get all games
app.get("/api/games", async (req, res, next) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    next(error);
  }
});

// Create game
app.post("/api/games", async (req, res, next) => {
  try {
    const validationError = validateGame(req.body);

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const game = await Game.create(cleanGame(req.body));
    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
});

// Update game
app.put("/api/games/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid game ID.");
    }

    const validationError = validateGame(req.body);

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      cleanGame(req.body),
      { new: true, runValidators: true }
    );

    if (!game) {
      return sendError(res, 404, "Game not found.");
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
});

// Delete game
app.delete("/api/games/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid game ID.");
    }

    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return sendError(res, 404, "Game not found.");
    }

    res.json({ message: "Game deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// Unknown route handler
app.use((req, res) => {
  sendError(res, 404, "API route not found.");
});

// Centralized error handler
app.use((error, req, res, next) => {
  console.error("Request error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return sendError(res, 400, "Invalid JSON request body.");
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return sendError(res, 400, "Invalid data supplied.");
  }

  if (error.code === 11000) {
    return sendError(res, 409, "A record with that value already exists.");
  }

  return sendError(res, 500, "An unexpected server error occurred.");
});

// Start server only after connecting to MongoDB
let server;

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}.`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await mongoose.disconnect();
  } finally {
    process.exit(0);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();
