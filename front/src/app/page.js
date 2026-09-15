"use client";

import RegisterPlayerForm from "@/components/features/register-player-form";
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
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Software Express</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">GameDevOps</h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">Gestión del torneo</h2>
          <p className="mt-2 text-neutral-500">
            Administra jugadores, videojuegos y registra puntuaciones directamente mediante el backend conectado a MySQL.
          </p>
        </div>

        <RegisterPlayerForm />
      </section>
    </main>
  );
}