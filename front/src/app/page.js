"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

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
    toast.add({ type, title: text, timeout: 4500 });
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
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Software Express
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              GameDevOps
            </h1>
          </div>
          <Badge variant="outline">Panel del torneo</Badge>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Gestión del torneo
          </h2>
          <p className="mt-2 text-muted-foreground">
            Administra jugadores, videojuegos y resultados del torneo.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Jugadores registrados" value={players.length} />
          <Stat label="Videojuegos registrados" value={games.length} />
          <Stat label="Puntos registrados" value={totalPoints.toLocaleString()} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* REGISTRAR JUGADOR */}
          <Panel title="Registrar jugador" description="Agrega un participante al torneo.">
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <Field label="Nombre" value={player.nombre} maxLength={100} onChange={handlePlayerNameChange} required />
              <Field label="Gamertag" value={player.gamertag} maxLength={50} onChange={handleGamertagChange} required />
              <Field label="Correo electrónico" type="email" value={player.correo} maxLength={150} onChange={handleEmailChange} required />
              <SubmitButton loading={loading}>Registrar jugador</SubmitButton>
            </form>
          </Panel>

          {/* REGISTRAR VIDEOJUEGO */}
          <Panel title="Registrar videojuego" description="Agrega un juego al catálogo del torneo.">
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <Field label="Nombre" value={game.nombre} maxLength={100} onChange={handleGameNameChange} required />
              <Field label="Género" value={game.genero} maxLength={50} onChange={handleGenreChange} required />
              <SubmitButton loading={loading}>Registrar videojuego</SubmitButton>
            </form>
          </Panel>

          {/* REGISTRAR PUNTUACIÓN */}
          <Panel title="Registrar puntuación" description="Selecciona un jugador y un videojuego para guardar su resultado.">
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <Label htmlFor="score-player" className="mb-2">Jugador</Label>
                <NativeSelect
                  id="score-player"
                  value={score.jugador_id}
                  onChange={(e) => handlePlayerIdChange(e.target.value)}
                  required
                  className="w-full"
                >
                  <NativeSelectOption value="">Selecciona un jugador</NativeSelectOption>
                  {players.map((item) => (
                    <NativeSelectOption key={item.id} value={item.id}>
                      {item.gamertag} · ID {item.id}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {selectedPlayer && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {selectedPlayer.nombre} · {selectedPlayer.correo}
                  </p>
                )}
              </div>

              <div>
                {games.length > 0 && <Label htmlFor="score-game" className="mb-2">Videojuego</Label>}
                {games.length > 0 ? (
                  <NativeSelect
                    id="score-game"
                    value={score.videojuego_id}
                    onChange={(e) => handleGameIdChange(e.target.value)}
                    required
                    className="w-full"
                  >
                    <NativeSelectOption value="">Selecciona un videojuego</NativeSelectOption>
                    {games.map((item) => (
                      <NativeSelectOption key={item.id} value={item.id}>
                        {item.nombre} · ID {item.id}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
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
          </Panel>

          {/* LISTA DE JUGADORES */}
          <Panel
            title="Jugadores registrados y ranking"
            description="Consulta y visualiza los puntos acumulados de cada jugador."
            action={
              <Button
                onClick={() => {
                  loadPlayers();
                  loadScores();
                }}
                variant="outline" size="sm" disabled={scoresLoading}
              >
                Actualizar
              </Button>
            }
          >
            <div className="mb-5">
              <Label htmlFor="search-player" className="mb-2">Buscar jugador</Label>
              <div className="relative">
                <Input id="search-player"
                  type="text"
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value.replace(/[^a-zA-Z0-9À-ÿÑñ\s_]/g, ""))}
                  placeholder="Buscar por nombre o Gamertag..."
                  maxLength={100}
                  className="pr-20"
                />
                {searchPlayer && (
                  <Button
                    type="button"
                    onClick={() => setSearchPlayer("")}
                    variant="ghost" size="xs" className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              {filteredPlayers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {players.length === 0 ? "No hay jugadores registrados." : "No se encontró ningún jugador."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredPlayers.map((item) => {
                    const points = playerPoints[String(item.id)] || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.nombre}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{item.gamertag} · {item.correo}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Puntos</p>
                            <p className="text-lg font-semibold">{points.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {scoresLoading && (
              <p className="mt-3 text-xs text-muted-foreground">Actualizando puntuaciones...</p>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, description, action, children }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle><h3>{title}</h3></CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

function SubmitButton({ children, loading }) {
  return (
    <Button type="submit" size="lg" disabled={loading} className="w-full" aria-busy={loading}>
      {loading ? "Procesando..." : children}
    </Button>
  );
}

function Stat({ label, value }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
