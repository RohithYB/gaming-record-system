const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let body;
  const text = await response.text();

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

test("Gaming Record System API", async (t) => {
  let playerId;
  let gameId;

  // The backend must already be running.
  const health = await request("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.server, "online");
  assert.equal(health.body.database, "connected");

  await t.test("returns player and game lists", async () => {
    const players = await request("/api/players");
    const games = await request("/api/games");

    assert.equal(players.response.status, 200);
    assert.ok(Array.isArray(players.body));

    assert.equal(games.response.status, 200);
    assert.ok(Array.isArray(games.body));
  });

  await t.test("rejects invalid player input", async () => {
    const result = await request("/api/players", {
      method: "POST",
      body: JSON.stringify({
        username: "",
        game: "Test Game",
        level: 1,
      }),
    });

    assert.equal(result.response.status, 400);
    assert.match(result.body.error, /username/i);
  });

  await t.test("rejects invalid game input", async () => {
    const result = await request("/api/games", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        genre: "Adventure",
      }),
    });

    assert.equal(result.response.status, 400);
    assert.match(result.body.error, /name/i);
  });

  await t.test("rejects malformed document IDs", async () => {
    const player = await request("/api/players/not-a-valid-id", {
      method: "PUT",
      body: JSON.stringify({
        username: "Test",
        game: "Test Game",
        level: 1,
      }),
    });

    const game = await request("/api/games/not-a-valid-id", {
      method: "DELETE",
    });

    assert.equal(player.response.status, 400);
    assert.equal(game.response.status, 400);
  });

  try {
    await t.test("creates, updates, and deletes a player", async () => {
      const created = await request("/api/players", {
        method: "POST",
        body: JSON.stringify({
          username: `API_Test_${Date.now()}`,
          game: "Test Game",
          level: 1,
        }),
      });

      assert.equal(created.response.status, 201);
      assert.ok(created.body._id);
      playerId = created.body._id;

      const updated = await request(`/api/players/${playerId}`, {
        method: "PUT",
        body: JSON.stringify({
          username: created.body.username,
          game: "Updated Test Game",
          level: 2,
        }),
      });

      assert.equal(updated.response.status, 200);
      assert.equal(updated.body.game, "Updated Test Game");
      assert.equal(updated.body.level, 2);

      const deleted = await request(`/api/players/${playerId}`, {
        method: "DELETE",
      });

      assert.equal(deleted.response.status, 200);
      playerId = undefined;
    });
  } finally {
    // Clean up test records if a test fails partway through.
    if (playerId) {
      await request(`/api/players/${playerId}`, { method: "DELETE" });
    }
  }

  try {
    await t.test("creates, updates, and deletes a game", async () => {
      const created = await request("/api/games", {
        method: "POST",
        body: JSON.stringify({
          name: `API_Test_Game_${Date.now()}`,
          genre: "Adventure",
        }),
      });

      assert.equal(created.response.status, 201);
      assert.ok(created.body._id);
      gameId = created.body._id;

      const updated = await request(`/api/games/${gameId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: created.body.name,
          genre: "Puzzle",
        }),
      });

      assert.equal(updated.response.status, 200);
      assert.equal(updated.body.genre, "Puzzle");

      const deleted = await request(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      assert.equal(deleted.response.status, 200);
      gameId = undefined;
    });
  } finally {
    if (gameId) {
      await request(`/api/games/${gameId}`, { method: "DELETE" });
    }
  }
});