"use client";

import { useEffect, useMemo, useState } from "react";

const initialPlayer = { nombre: "", gamertag: "", correo: "" };
const initialGame = { nombre: "", genero: "" };
const initialScore = { jugador_id: "", videojuego_id: "", puntuacion: "" };

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "No se pudo completar la petición.");
  }

  return data;
}

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [player, setPlayer] = useState(initialPlayer);
  const [game, setGame] = useState(initialGame);
  const [score, setScore] = useState(initialScore);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const playerCount = players.length;
  const gameCount = games.length;

  const selectedPlayer = useMemo(
    () => players.find((item) => String(item.id) === String(score.jugador_id)),
    [players, score.jugador_id]
  );

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const data = await request("/api/jugadores");
      setPlayers(data.jugadores || []);
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4500);
  }

  async function handlePlayerSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await request("/api/jugadores", {
        method: "POST",
        body: JSON.stringify(player),
      });
      setPlayer(initialPlayer);
      setPlayers((current) => [...current, data.jugador]);
      showMessage("success", data.message);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGameSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await request("/api/videojuegos", {
        method: "POST",
        body: JSON.stringify(game),
      });
      setGame(initialGame);
      setGames((current) => [...current, data.videojuego]);
      showMessage("success", `${data.message}. ID: ${data.videojuego.id}`);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        jugador_id: Number(score.jugador_id),
        videojuego_id: Number(score.videojuego_id),
        puntuacion: Number(score.puntuacion),
      };

      const data = await request("/api/puntuaciones", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setScore(initialScore);
      showMessage("success", `${data.message}. Puntuación: ${data.puntuacion.puntuacion}`);
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Software Express</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">GameDevOps</h1>
          </div>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
            API · localhost:4000
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Gestión del torneo</h2>
          <p className="mt-2 text-neutral-500">
            Administra jugadores, videojuegos y registra puntuaciones directamente mediante el backend conectado a MySQL.
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-neutral-200 bg-white text-neutral-800" : "border-red-200 bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Jugadores registrados" value={playerCount} />
          <Stat label="Videojuegos creados en esta sesión" value={gameCount} />
          <Stat label="Estado del backend" value="Conectado" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Registrar jugador" description="Crea un jugador en la tabla jugadores.">
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <Field label="Nombre" value={player.nombre} maxLength={100} onChange={(value) => setPlayer({ ...player, nombre: value })} required />
              <Field label="Gamertag" value={player.gamertag} maxLength={50} onChange={(value) => setPlayer({ ...player, gamertag: value })} required />
              <Field label="Correo electrónico" type="email" value={player.correo} maxLength={150} onChange={(value) => setPlayer({ ...player, correo: value })} required />
              <SubmitButton loading={loading}>Registrar jugador</SubmitButton>
            </form>
          </Card>

          <Card title="Registrar videojuego" description="Crea un videojuego en la tabla videojuegos.">
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <Field label="Nombre" value={game.nombre} maxLength={100} onChange={(value) => setGame({ ...game, nombre: value })} required />
              <Field label="Género" value={game.genero} maxLength={50} onChange={(value) => setGame({ ...game, genero: value })} required />
              <SubmitButton loading={loading}>Registrar videojuego</SubmitButton>
            </form>
          </Card>

          <Card title="Registrar puntuación" description="Relaciona un jugador y un videojuego mediante sus IDs.">
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Jugador</label>
                <select
                  value={score.jugador_id}
                  onChange={(event) => setScore({ ...score, jugador_id: event.target.value })}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-700"
                >
                  <option value="">Selecciona un jugador</option>
                  {players.map((item) => (
                    <option key={item.id} value={item.id}>{item.gamertag} · ID {item.id}</option>
                  ))}
                </select>
                {selectedPlayer && <p className="mt-1.5 text-xs text-neutral-500">{selectedPlayer.nombre} · {selectedPlayer.correo}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Videojuego</label>
                {games.length > 0 ? (
                  <select
                    value={score.videojuego_id}
                    onChange={(event) => setScore({ ...score, videojuego_id: event.target.value })}
                    required
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-700"
                  >
                    <option value="">Selecciona un videojuego</option>
                    {games.map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre} · ID {item.id}</option>
                    ))}
                  </select>
                ) : (
                  <Field label="ID del videojuego" type="number" min="1" value={score.videojuego_id} onChange={(value) => setScore({ ...score, videojuego_id: value })} required />
                )}
              </div>

              <Field label="Puntuación" type="number" min="0" max="2147483647" value={score.puntuacion} onChange={(value) => setScore({ ...score, puntuacion: value })} required />
              <SubmitButton loading={loading}>Guardar puntuación</SubmitButton>
            </form>
          </Card>

          <Card
            title="Jugadores registrados"
            description="Datos obtenidos mediante GET /api/jugadores."
            action={<button onClick={loadPlayers} className="text-xs font-semibold text-neutral-700 hover:underline">Actualizar</button>}
          >
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {players.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-neutral-500">No hay jugadores registrados.</p>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {players.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.nombre}</p>
                        <p className="truncate text-xs text-neutral-500">@{item.gamertag} · {item.correo}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-mono text-neutral-600">#{item.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <footer className="py-10 text-center text-xs text-neutral-400">
          Frontend Next.js · HTTP → Express → MySQL
        </footer>
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
        onChange={(event) => onChange(event.target.value)}
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
