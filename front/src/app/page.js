"use client";

import JugadoresTable from "@/components/features/jugadores/jugadores-table";
import RegisterPlayerForm from "@/components/features/jugadores/register-player-form";
import { Toaster } from "@/components/ui/toast";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Toaster />
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Software Express
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              GameDevOps
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            Gestión del torneo
          </h2>
          <p className="mt-2 text-neutral-500">
            Administra jugadores, videojuegos y registra puntuaciones
            directamente mediante el backend conectado a MySQL.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10">
          <RegisterPlayerForm />
          <JugadoresTable />
        </div>
      </section>
    </main>
  );
}
