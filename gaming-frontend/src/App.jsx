import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const EMPTY_PLAYER = { username: "", game: "", level: "" };
const EMPTY_GAME = { name: "", genre: "" };

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }

  return data;
}

function App() {
  const [activeTab, setActiveTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PLAYER);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [playerData, gameData, statusData] = await Promise.all([
        apiRequest("/api/players"),
        apiRequest("/api/games"),
        apiRequest("/api/status"),
      ]);

      setPlayers(playerData);
      setGames(gameData);
      setStatus(statusData);
    } catch (err) {
      setError(`${err.message}. Check that the backend and MongoDB are running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return players.filter((player) =>
      [player.username, player.game, String(player.level)]
        .some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [players, search]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return games.filter((game) =>
      [game.name, game.genre]
        .some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [games, search]);

  function openCreateForm() {
    setEditing(null);
    setForm(activeTab === "games" ? { ...EMPTY_GAME } : { ...EMPTY_PLAYER });
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(record) {
    setEditing(record);
    setForm(
      activeTab === "games"
        ? { name: record.name, genre: record.genre }
        : {
            username: record.username,
            game: record.game,
            level: String(record.level),
          }
    );
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setSearch("");
    setFormOpen(false);
    setEditing(null);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const isGame = activeTab === "games";
    const payload = isGame
      ? { name: form.name.trim(), genre: form.genre.trim() }
      : {
          username: form.username.trim(),
          game: form.game.trim(),
          level: Number(form.level),
        };

    if (isGame && (!payload.name || !payload.genre)) {
      setError("Please enter both a game name and genre.");
      return;
    }

    if (
      !isGame &&
      (!payload.username ||
        !payload.game ||
        form.level.trim() === "" ||
        !Number.isFinite(payload.level) ||
        payload.level < 0)
    ) {
      setError("Enter a username, game, and valid level (zero or greater).");
      return;
    }

    setSaving(true);

    try {
      const path = isGame ? "/api/games" : "/api/players";
      const url = editing ? `${path}/${editing._id}` : path;

      await apiRequest(url, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? "Record updated successfully." : "Record added successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    const label = activeTab === "games" ? record.name : record.username;

    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    setError("");
    setNotice("");

    try {
      const path = activeTab === "games" ? "/api/games" : "/api/players";
      await apiRequest(`${path}/${record._id}`, { method: "DELETE" });
      setNotice("Record deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const recordCount = activeTab === "games" ? games.length : players.length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GR</div>
          <div>
            <strong>GameRecords</strong>
            <span>Management console</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation" aria-label="Main navigation">
          <button
            className={activeTab === "players" ? "nav-item active" : "nav-item"}
            onClick={() => changeTab("players")}
          >
            <span>♙</span> Players
          </button>
          <button
            className={activeTab === "games" ? "nav-item active" : "nav-item"}
            onClick={() => changeTab("games")}
          >
            <span>▦</span> Games
          </button>
          <button
            className={activeTab === "status" ? "nav-item active" : "nav-item"}
            onClick={() => changeTab("status")}
          >
            <span>◷</span> System status
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Local development
          <small>React · Express · MongoDB</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">GAMING RECORD SYSTEM</span>
            <h1>
              {activeTab === "players"
                ? "Player management"
                : activeTab === "games"
                  ? "Game library"
                  : "System status"}
            </h1>
            <p className="page-subtitle">
              {activeTab === "players"
                ? "Manage player profiles and game progress."
                : activeTab === "games"
                  ? "Maintain your game catalogue and genres."
                  : "Check the API's reported operating status."}
            </p>
          </div>
          <button className="button button-secondary refresh-button" onClick={loadData} disabled={loading}>
            ↻ <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </header>

        <section className="summary-grid" aria-label="Record summary">
          <article className="summary-card">
            <span className="summary-label">Total players</span>
            <strong>{players.length}</strong>
            <span className="summary-note">Stored player records</span>
          </article>
          <article className="summary-card">
            <span className="summary-label">Games registered</span>
            <strong>{games.length}</strong>
            <span className="summary-note">Stored game records</span>
          </article>
          <article className="summary-card">
            <span className="summary-label">API status</span>
            <strong className="status-value">
              <span className={`status-dot ${status?.server === "Online" ? "" : "offline"}`} />
              {status?.server || (loading ? "Checking" : "Unknown")}
            </strong>
            <span className="summary-note">Reported by the backend</span>
          </article>
        </section>

        {error && (
          <div className="message message-error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
          </div>
        )}
        {notice && (
          <div className="message message-success" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
          </div>
        )}

        {activeTab !== "status" ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{activeTab === "players" ? "All players" : "All games"}</h2>
                <p>
                  {recordCount} {recordCount === 1 ? "record" : "records"} in the database
                </p>
              </div>
              <button className="button button-primary" onClick={openCreateForm}>
                + Add {activeTab === "players" ? "player" : "game"}
              </button>
            </div>

            <div className="toolbar">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder={activeTab === "players" ? "Search username, game or level..." : "Search game name or genre..."}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <span className="result-count">
                Showing {activeTab === "players" ? filteredPlayers.length : filteredGames.length}
              </span>
            </div>

            {formOpen && (
              <form className="record-form" onSubmit={handleSubmit}>
                <div className="form-heading">
                  <div>
                    <h3>{editing ? "Edit record" : "Create a record"}</h3>
                    <p>Fields marked with * are required.</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close form">×</button>
                </div>

                {activeTab === "players" ? (
                  <div className="form-grid">
                    <label>
                      Username *
                      <input required maxLength={60} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. PlayerOne" />
                    </label>
                    <label>
                      Game *
                      <input required maxLength={100} value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} placeholder="e.g. Valorant" />
                    </label>
                    <label>
                      Level *
                      <input required type="number" min="0" step="1" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. 25" />
                    </label>
                  </div>
                ) : (
                  <div className="form-grid">
                    <label>
                      Game name *
                      <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Minecraft" />
                    </label>
                    <label>
                      Genre *
                      <input required maxLength={60} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="e.g. Sandbox" />
                    </label>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                  <button className="button button-primary" disabled={saving}>
                    {saving ? "Saving..." : editing ? "Save changes" : "Create record"}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="loader" />
                <h3>Loading records</h3>
                <p>Fetching the latest data from the API.</p>
              </div>
            ) : activeTab === "players" ? (
              filteredPlayers.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Game</th>
                        <th>Level</th>
                        <th>Record ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => (
                        <tr key={player._id}>
                          <td>
                            <div className="record-name">
                              <span className="avatar">{player.username?.slice(0, 1)?.toUpperCase() || "P"}</span>
                              <strong>{player.username}</strong>
                            </div>
                          </td>
                          <td>{player.game}</td>
                          <td><span className="level-badge">{player.level}</span></td>
                          <td><code>{player._id}</code></td>
                          <td>
                            <div className="row-actions">
                              <button className="text-button" onClick={() => openEditForm(player)}>Edit</button>
                              <button className="text-button danger-text" onClick={() => handleDelete(player)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">♙</div>
                  <h3>{search ? "No matching players" : "No players yet"}</h3>
                  <p>{search ? "Try another search term." : "Add your first player to get started."}</p>
                  {!search && <button className="button button-primary" onClick={openCreateForm}>+ Add player</button>}
                </div>
              )
            ) : filteredGames.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Genre</th>
                      <th>Record ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game) => (
                      <tr key={game._id}>
                        <td>
                          <div className="record-name">
                            <span className="avatar game-avatar">{game.name?.slice(0, 1)?.toUpperCase() || "G"}</span>
                            <strong>{game.name}</strong>
                          </div>
                        </td>
                        <td><span className="genre-badge">{game.genre}</span></td>
                        <td><code>{game._id}</code></td>
                        <td>
                          <div className="row-actions">
                            <button className="text-button" onClick={() => openEditForm(game)}>Edit</button>
                            <button className="text-button danger-text" onClick={() => handleDelete(game)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">▦</div>
                <h3>{search ? "No matching games" : "No games yet"}</h3>
                <p>{search ? "Try another search term." : "Add a game to build your library."}</p>
                {!search && <button className="button button-primary" onClick={openCreateForm}>+ Add game</button>}
              </div>
            )}
          </section>
        ) : (
          <section className="panel status-panel">
            <div className="panel-header">
              <div>
                <h2>Service health</h2>
                <p>Information returned by the current status endpoint.</p>
              </div>
            </div>
            <div className="health-list">
              <div className="health-row">
                <div><strong>Express API</strong><span>Backend status response</span></div>
                <span className={`health-pill ${status?.server === "Online" ? "healthy" : "unknown"}`}>{status?.server || "Unknown"}</span>
              </div>
              <div className="health-row">
                <div><strong>Players online</strong><span>Currently a hardcoded demo value in server.js</span></div>
                <strong>{status?.playersOnline ?? "—"}</strong>
              </div>
              <div className="health-row">
                <div><strong>Maintenance mode</strong><span>Value returned by the API</span></div>
                <strong>{status ? (status.maintenance ? "Enabled" : "Disabled") : "Unknown"}</strong>
              </div>
              <div className="health-row">
                <div><strong>MongoDB</strong><span>Database connection needs a dedicated health check</span></div>
                <span className="health-pill unknown">Not independently checked</span>
              </div>
            </div>
            <p className="status-disclaimer">
              This page displays the current API response. It does not yet measure real online players or independently verify database health.
            </p>
          </section>
        )}

        <footer className="footer">
          <span>Gaming Record System</span>
          <span>Development environment · API: {API_BASE}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;