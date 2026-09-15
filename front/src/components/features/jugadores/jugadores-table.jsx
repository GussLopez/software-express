"use client";

import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

export default function JugadoresTable() {
  const getPlayers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jugadores`);

    if (!res.ok) throw new Error("Error al consultar los jugadores");

    const data = await res.json();
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["jugadores"],
    queryFn: getPlayers,
  });

  console.log(data);
  return (
    <div className="w-full p-5 border border-muted">
      <p className="">Jugadores Registrados</p>
      {isLoading && (
        <div className="h-20 flex justify-center items-center">
          <Spinner />
        </div>
      )}
      <ul className="mt-5 space-y-2 font">
        {data?.jugadores.map((player, i) => (
          <li key={player.gamertag} className="text-sm">
            {i + 1}.- {player.nombre} - {player.gamertag}
          </li>
        ))}
      </ul>
    </div>
  );
}
