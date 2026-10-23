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
        <p className="rb-eyebrow">Configuración final</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--gold-bright)]">Jugadores y bots</h2>
        <p className="mt-2 text-sm text-[var(--cream-muted)]">
          Tú eres el jugador principal. Los demás jugadores serán bots.
        </p>
        <p className="mt-1 text-sm text-[var(--cream-muted)]">Dificultad actual: {difficulty}</p>
      </div>

      <div className="rb-panel rounded-2xl p-6">
        <p className="text-sm text-[var(--cream-muted)]">
          Número total de jugadores ({MIN_PLAYERS}-{MAX_PLAYERS})
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => canReduce && onChangePlayers(totalPlayers - 1)}
            disabled={!canReduce}
            className="rb-btn-secondary h-10 w-10"
          >
            -
          </button>
          <span className="text-3xl font-bold text-[var(--cream)]">{totalPlayers}</span>
          <button
            type="button"
            onClick={() => canIncrease && onChangePlayers(totalPlayers + 1)}
            disabled={!canIncrease}
            className="rb-btn-secondary h-10 w-10"
          >
            +
          </button>
        </div>
        <p className="mt-3 text-sm text-[var(--cream-muted)]">Bots: {Math.max(totalPlayers - 1, 0)}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onStart} className="rb-btn-primary px-5 py-3 font-semibold">
          Iniciar partida
        </button>
        <button type="button" onClick={onBack} className="rb-btn-secondary px-5 py-3">
          Volver
        </button>
      </div>
    </section>
  );
}
