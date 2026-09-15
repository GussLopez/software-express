"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useForm } from "react-hook-form";
import { Spinner } from "../../ui/spinner";
import ErrorMessage from "../../ui/error-message";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

export default function RegisterPlayerForm() {
  const initialPlayer = { nombre: "", gamertag: "", correo: "" };
  const [player, setPlayer] = useState(initialPlayer);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handlePlayerSubmit = async (values) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jugadores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: values.name,
            gamertag: values.gamertag,
            correo: values.email,
          }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "No se pudo registrar el jugador",
        );
      }
      queryClient.invalidateQueries({ queryKey: ["jugadores"] });
      toast.add({
        title: "Jugador Creado"
      });
    } catch (error) {
      setMessage({
        status: "error",
        message: error.message,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-sm border border-muted p-5">
      <p>Registra un jugador</p>
      {message?.status === "error" && (
        <div className="w-full p-2 mt-2 text-xs font-medium bg-destructive/5 text-destructive border border-red-400">
          <p>{message.message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(handlePlayerSubmit)}>
        <div className="flex flex-col gap-5 mt-5">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Juan Perez"
              {...register("name", {
                required: "El nombre es requerido",
              })}
            />
            {errors.name?.message && (
              <ErrorMessage error={errors.name.message} />
            )}
          </div>
          <div className="space-y-2">
            <Label>Gamertag</Label>
            <Input
              placeholder="juanPerez10"
              {...register("gamertag", {
                required: "El gamertag es requerido",
              })}
            />
            {errors.gamertag?.message && (
              <ErrorMessage error={errors.gamertag.message} />
            )}
          </div>
          <div className="space-y-2">
            <Label>Correo</Label>
            <Input
              placeholder="juanperez@gmail.com"
              {...register("email", {
                required: "El correo es requerido",
              })}
            />
            {errors.email?.message && (
              <ErrorMessage error={errors.email.message} />
            )}
          </div>
          <Button type="submit">
            {loading ? (
              <>
                <Spinner />
                Registrando
              </>
            ) : (
              "Registrar jugador"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
