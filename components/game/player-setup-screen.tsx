"use client";

import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/game/deck";
import type { Difficulty } from "@/types/game";

interface PlayerSetupScreenProps {
  difficulty: Difficulty;
  totalPlayers: number;
  onChangePlayers: (players: number) => void;
  onBack: () => void;
  onStart: () => void;
}

export function PlayerSetupScreen({
  difficulty,
  totalPlayers,
  onChangePlayers,
  onBack,
  onStart,
}: PlayerSetupScreenProps) {
  const canReduce = totalPlayers > MIN_PLAYERS;
  const canIncrease = totalPlayers < MAX_PLAYERS;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-10">
      <div>
        <p className="text-sm uppercase tracking-wide opacity-70">Configuración final</p>
        <h2 className="mt-2 text-3xl font-bold">Jugadores y bots</h2>
        <p className="mt-2 text-sm opacity-85">
          Tú eres el jugador principal. Los demás jugadores serán bots.
        </p>
        <p className="mt-1 text-sm opacity-85">Dificultad actual: {difficulty}</p>
      </div>

      <div className="rounded-2xl border border-foreground/15 p-6">
        <p className="text-sm opacity-80">Número total de jugadores ({MIN_PLAYERS}-{MAX_PLAYERS})</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => canReduce && onChangePlayers(totalPlayers - 1)}
            disabled={!canReduce}
            className="h-10 w-10 rounded-lg border border-foreground/20 disabled:opacity-40"
          >
            -
          </button>
          <span className="text-3xl font-bold">{totalPlayers}</span>
          <button
            type="button"
            onClick={() => canIncrease && onChangePlayers(totalPlayers + 1)}
            disabled={!canIncrease}
            className="h-10 w-10 rounded-lg border border-foreground/20 disabled:opacity-40"
          >
            +
          </button>
        </div>
        <p className="mt-3 text-sm opacity-80">Bots: {Math.max(totalPlayers - 1, 0)}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-xl border border-foreground/20 px-5 py-3 font-semibold hover:bg-foreground/10"
        >
          Iniciar partida
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-foreground/15 px-5 py-3 hover:bg-foreground/10"
        >
          Volver
        </button>
      </div>
    </section>
  );
}
