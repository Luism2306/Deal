import { getPlayerMoneyTotal } from "@/lib/game/engine";
import type { PlayerState } from "@/types/game";
import { colorBadgeClass, groupProperties } from "@/components/game/property-groups";

interface OpponentsRingProps {
  players: PlayerState[];
  activePlayerId: string;
  selectedTargetId?: string;
  onSelectTarget: (playerId: string) => void;
}

function opponentSlotClass(index: number, total: number): string {
  if (total <= 0) return "";

  if (total === 1) {
    return "right-6 top-1/2 -translate-y-1/2";
  }

  if (total === 2) {
    if (index === 0) return "left-6 top-1/2 -translate-y-1/2";
    return "right-6 top-1/2 -translate-y-1/2";
  }

  if (index === 0) return "left-6 top-1/2 -translate-y-1/2";
  if (index === 1) return "left-1/2 top-20 -translate-x-1/2";
  if (index === 2) return "right-6 top-1/2 -translate-y-1/2";

  return "left-1/2 top-10 -translate-x-1/2";
}

export function OpponentsRing({ players, activePlayerId, selectedTargetId, onSelectTarget }: OpponentsRingProps) {
  return (
    <>
      {players.map((player, index) => {
        const slot = opponentSlotClass(index, players.length);
        const isSelected = selectedTargetId === player.id;
        const isActive = player.id === activePlayerId;
        const grouped = groupProperties(player.properties);

        return (
          <button
            key={player.id}
            type="button"
            onClick={() => onSelectTarget(player.id)}
            className={`rb-panel absolute z-10 flex min-w-36 flex-col items-center gap-1 rounded-xl px-3 py-2 text-left transition ${slot} ${
              isSelected
                ? "border-[var(--gold-bright)]! ring-1 ring-[var(--gold-bright)]"
                : isActive
                  ? "border-[var(--gold)]!"
                  : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? "rb-pulse bg-[var(--gold-bright)]" : "bg-[var(--cream-muted)]"}`}
              />
              <p className="text-sm font-semibold text-[var(--cream)]">{player.name}</p>
            </div>
            <p className="text-[11px] text-[var(--cream-muted)]">Mano {player.hand.length}</p>
            <p className="text-[11px] text-[var(--cream-muted)]">Banco {getPlayerMoneyTotal(player)}M</p>
            <p className="text-[11px] text-[var(--cream-muted)]">
              Props {grouped.reduce((sum, group) => sum + group.cards.length, 0)}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-[3px]">
              {grouped.slice(0, 3).map((group) => (
                <span
                  key={`${player.id}-${group.color}`}
                  className={`inline-block h-2 w-6 rounded-full bg-gradient-to-r ${colorBadgeClass(group.color)}`}
                />
              ))}
              {grouped.length > 3 && (
                <span className="text-[9px] text-[var(--cream-muted)]">+{grouped.length - 3}</span>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}
