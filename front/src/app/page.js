"use client";

import { useEffect, useMemo, useState } from "react";

const initialPlayer = { nombre: "", gamertag: "", correo: "" };
const initialGame = { nombre: "", genero: "" };
const initialScore = { jugador_id: "", videojuego_id: "", puntuacion: "" };

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "No se pudo completar la petición."
    );
  }

  return data;
}

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [scores, setScores] = useState([]);

  const [player, setPlayer] = useState(initialPlayer);
  const [game, setGame] = useState(initialGame);
  const [score, setScore] = useState(initialScore);

  const [searchPlayer, setSearchPlayer] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoresLoading, setScoresLoading] = useState(false);

  useEffect(() => {
    loadPlayers();
    loadGames();
    loadScores();
  }, []);

  const selectedPlayer = useMemo(
    () =>
      players.find(
        (item) => String(item.id) === String(score.jugador_id)
      ),
    [players, score.jugador_id]
  );

const filteredPlayers = useMemo(() => {
    const search = searchPlayer.trim().toLowerCase();
    
    // 1. Filtrar lista por nombre o gamertag
    const list = !search
      ? players
      : players.filter((item) => {
          const nombre = String(item.nombre || "").toLowerCase();
          const gamertag = String(item.gamertag || "").toLowerCase();
          return nombre.includes(search) || gamertag.includes(search);
        });

    // 2. Acumular puntos por ID de jugador desde 'scores'
    const totals = {};
    scores.forEach((item) => {
      const id = String(item.jugador_id ?? item.jugadorId);
      const val = Number(item.puntuacion ?? item.puntos ?? 0);
      totals[id] = (totals[id] || 0) + val;
    });

    // 3. Ordenar de mayor a menor puntuación
    return [...list].sort((a, b) => {
      const pointsA = totals[String(a.id)] || 0;
      const pointsB = totals[String(b.id)] || 0;
      return pointsB - pointsA;
    });
  }, [players, searchPlayer, scores]);

  const playerPoints = useMemo(() => {
    const totals = {};

    players.forEach((item) => {
      totals[String(item.id)] = 0;
    });

    scores.forEach((item) => {
      const rawJugadorId =
        item.jugador_id ?? item.jugadorId ?? item.player_id ?? item.playerId;
      const rawPuntuacion =
        item.puntuacion ?? item.puntos ?? item.score ?? 0;

      if (rawJugadorId != null) {
        const key = String(rawJugadorId);
        const val = Number(rawPuntuacion);

        if (Number.isFinite(val)) {
          totals[key] = (totals[key] || 0) + val;
        }
      }
    });

    return totals;
  }, [players, scores]);

  const totalPoints = useMemo(() => {
    return Object.values(playerPoints).reduce(
      (acc, points) => acc + points,
      0
    );
  }, [playerPoints]);

  async function loadPlayers() {
    try {
      const data = await request("/api/jugadores");
      setPlayers(data.jugadores || []);
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  async function loadGames() {
    try {
      const data = await request("/api/videojuegos");
      setGames(data.videojuegos || []);
    } catch (error) {
      console.error("Error al cargar videojuegos:", error);
    }
  }

  async function loadScores() {
    setScoresLoading(true);
    try {
      const data = await request("/api/puntuaciones");
      setScores(data.puntuaciones || []);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setScoresLoading(false);
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4500);
  }

  // Handlers Jugador
  const handlePlayerNameChange = (val) =>
    setPlayer((prev) => ({ ...prev, nombre: val.replace(/[^a-zA-ZÀ-ÿÑñ\s]/g, "") }));
  const handleGamertagChange = (val) =>
    setPlayer((prev) => ({ ...prev, gamertag: val.replace(/[^a-zA-Z0-9_]/g, "") }));
  const handleEmailChange = (val) =>
    setPlayer((prev) => ({ ...prev, correo: val.replace(/[^a-zA-Z0-9@._+-]/g, "") }));

  // Handlers Videojuego
  const handleGameNameChange = (val) =>
    setGame((prev) => ({ ...prev, nombre: val.replace(/[^a-zA-Z0-9À-ÿÑñ\s]/g, "") }));
  const handleGenreChange = (val) =>
    setGame((prev) => ({ ...prev, genero: val.replace(/[^a-zA-ZÀ-ÿÑñ\s]/g, "") }));

  // Handlers Score
  const handlePlayerIdChange = (val) =>
    setScore((prev) => ({ ...prev, jugador_id: val.replace(/[^0-9]/g, "") }));
  const handleGameIdChange = (val) =>
    setScore((prev) => ({ ...prev, videojuego_id: val.replace(/[^0-9]/g, "") }));
  const handleScoreChange = (val) =>
    setScore((prev) => ({ ...prev, puntuacion: val.replace(/[^0-9]/g, "") }));

  async function handlePlayerSubmit(event) {
    event.preventDefault();
    const nombre = player.nombre.trim();
    const gamertag = player.gamertag.trim();
    const correo = player.correo.trim();

    if (!nombre || !gamertag || !correo) {
      return showMessage("error", "Todos los campos son obligatorios.");
    }

    const duplicate = players.some(
      (item) => String(item.gamertag).toLowerCase() === gamertag.toLowerCase()
    );

    if (duplicate) {
      return showMessage("error", "Ese Gamertag ya está registrado.");
    }

    setLoading(true);
    try {
      const data = await request("/api/jugadores", {
        method: "POST",
        body: JSON.stringify({ nombre, gamertag, correo }),
      });

      setPlayer(initialPlayer);
      setPlayers((current) => [...current, data.jugador]);
      showMessage("success", data.message || "Jugador creado con éxito");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGameSubmit(event) {
    event.preventDefault();
    const nombre = game.nombre.trim();
    const genero = game.genero.trim();

    if (!nombre || !genero) {
      return showMessage("error", "Todos los campos son obligatorios.");
    }

    setLoading(true);
    try {
      const data = await request("/api/videojuegos", {
        method: "POST",
        body: JSON.stringify({ nombre, genero }),
      });

      setGame(initialGame);
      setGames((current) => [...current, data.videojuego]);
      showMessage("success", `${data.message || "Videojuego creado"}. ID: ${data.videojuego?.id}`);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreSubmit(event) {
    event.preventDefault();

    if (!score.jugador_id || !score.videojuego_id || score.puntuacion === "") {
      return showMessage("error", "Todos los campos son obligatorios.");
    }

    const numericScore = Number(score.puntuacion);

    setLoading(true);
    try {
      const payload = {
        jugador_id: Number(score.jugador_id),
        videojuego_id: Number(score.videojuego_id),
        puntuacion: numericScore,
      };

      const data = await request("/api/puntuaciones", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setScore(initialScore);
      await loadScores();
      showMessage("success", `${data.message || "Puntuación guardada"}`);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Software Express
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              GameDevOps
            </h1>
          </div>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
            API · localhost:4000
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Gestión del torneo
          </h2>
          <p className="mt-2 text-neutral-500">
            Administra jugadores, videojuegos y registra puntuaciones mediante MySQL.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-neutral-200 bg-white text-neutral-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Stat label="Jugadores registrados" value={players.length} />
          <Stat label="Videojuegos registrados" value={games.length} />
          <Stat label="Puntos registrados" value={totalPoints.toLocaleString()} />
          <Stat label="Estado del backend" value="Conectado" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* REGISTRAR JUGADOR */}
          <Card title="Registrar jugador" description="Crea un jugador en la tabla jugadores.">
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <Field label="Nombre" value={player.nombre} maxLength={100} onChange={handlePlayerNameChange} required />
              <Field label="Gamertag" value={player.gamertag} maxLength={50} onChange={handleGamertagChange} required />
              <Field label="Correo electrónico" type="email" value={player.correo} maxLength={150} onChange={handleEmailChange} required />
              <SubmitButton loading={loading}>Registrar jugador</SubmitButton>
            </form>
          </Card>

          {/* REGISTRAR VIDEOJUEGO */}
          <Card title="Registrar videojuego" description="Crea un videojuego en la tabla videojuegos.">
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <Field label="Nombre" value={game.nombre} maxLength={100} onChange={handleGameNameChange} required />
              <Field label="Género" value={game.genero} maxLength={50} onChange={handleGenreChange} required />
              <SubmitButton loading={loading}>Registrar videojuego</SubmitButton>
            </form>
          </Card>

          {/* REGISTRAR PUNTUACIÓN */}
          <Card title="Registrar puntuación" description="Relaciona un jugador y un videojuego mediante sus IDs.">
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Jugador</label>
                <select
                  value={score.jugador_id}
                  onChange={(e) => handlePlayerIdChange(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-700"
                >
                  <option value="">Selecciona un jugador</option>
                  {players.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.gamertag} · ID {item.id}
                    </option>
                  ))}
                </select>
                {selectedPlayer && (
                  <p className="mt-1.5 text-xs text-neutral-500">
                    {selectedPlayer.nombre} · {selectedPlayer.correo}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Videojuego</label>
                {games.length > 0 ? (
                  <select
                    value={score.videojuego_id}
                    onChange={(e) => handleGameIdChange(e.target.value)}
                    required
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-700"
                  >
                    <option value="">Selecciona un videojuego</option>
                    {games.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre} · ID {item.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Field
                    label="ID del videojuego"
                    type="text"
                    inputMode="numeric"
                    value={score.videojuego_id}
                    onChange={handleGameIdChange}
                    required
                  />
                )}
              </div>

              <Field
                label="Puntuación"
                type="text"
                inputMode="numeric"
                value={score.puntuacion}
                onChange={handleScoreChange}
                maxLength={10}
                required
              />

              <SubmitButton loading={loading}>Guardar puntuación</SubmitButton>
            </form>
          </Card>

          {/* LISTA DE JUGADORES */}
          <Card
            title="Jugadores registrados y ranking"
            description="Consulta y visualiza los puntos acumulados de cada jugador."
            action={
              <button
                onClick={() => {
                  loadPlayers();
                  loadScores();
                }}
                className="text-xs font-semibold text-neutral-700 hover:underline"
              >
                Actualizar
              </button>
            }
          >
            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-medium">Buscar jugador</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value.replace(/[^a-zA-Z0-9À-ÿÑñ\s_]/g, ""))}
                  placeholder="Buscar por nombre o Gamertag..."
                  maxLength={100}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-20 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-100"
                />
                {searchPlayer && (
                  <button
                    type="button"
                    onClick={() => setSearchPlayer("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {filteredPlayers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-neutral-500">
                    {players.length === 0 ? "No hay jugadores registrados." : "No se encontró ningún jugador."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {filteredPlayers.map((item) => {
                    const points = playerPoints[String(item.id)] || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.nombre}</p>
                          <p className="truncate text-xs text-neutral-500">
                            @{item.gamertag} · {item.correo}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">Puntos</p>
                            <p className="text-lg font-semibold">{points.toLocaleString()}</p>
                          </div>
                          <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-mono text-neutral-600">
                            #{item.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {scoresLoading && (
              <p className="mt-3 text-xs text-neutral-400">Actualizando puntuaciones...</p>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

function Card({ title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-700 focus:ring-2 focus:ring-neutral-100"
        {...props}
      />
    </div>
  );
}

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Procesando..." : children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}