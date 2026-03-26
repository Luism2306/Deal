import { getPlayerMoneyTotal } from "@/lib/game/engine";
import type { PlayerState } from "@/types/game";
import { colorBadgeClass, groupProperties } from "@/components/game/property-groups";

interface OpponentsRingProps {
  players: PlayerState[];
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

export function OpponentsRing({ players, selectedTargetId, onSelectTarget }: OpponentsRingProps) {
  return (
    <>
      {players.map((player, index) => {
        const slot = opponentSlotClass(index, players.length);
        const isSelected = selectedTargetId === player.id;
        const grouped = groupProperties(player.properties);

        return (
          <button
            key={player.id}
            type="button"
            onClick={() => onSelectTarget(player.id)}
            className={`absolute z-10 flex min-w-36 flex-col items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${slot} ${
              isSelected
                ? "border-yellow-300 bg-black/45"
                : "border-white/20 bg-black/30 hover:bg-black/40"
            }`}
          >
            <div className="h-10 w-10 rounded-full border border-white/40 bg-white/10" />
            <p className="text-sm font-semibold">{player.name}</p>
            <p className="text-[11px] text-white/80">Mano {player.hand.length}</p>
            <p className="text-[11px] text-white/80">Banco {getPlayerMoneyTotal(player)}M</p>
            <p className="text-[11px] text-white/80">Props {grouped.reduce((sum, group) => sum + group.cards.length, 0)}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-[3px]">
              {grouped.slice(0, 3).map((group) => (
                <span
                  key={`${player.id}-${group.color}`}
                  className={`inline-block h-2 w-6 rounded-full bg-gradient-to-r ${colorBadgeClass(group.color)}`}
                />
              ))}
              {grouped.length > 3 && (
                <span className="text-[9px] text-white/70">+{grouped.length - 3}</span>
              )}
            </div>
            <div className="mt-1 flex h-9 items-end gap-[2px]">
              {Array.from({ length: Math.min(player.hand.length, 6) }, (_, handIndex) => (
                <span
                  key={`${player.id}-back-${handIndex}`}
                  className="block h-8 w-4 rounded-sm border border-white/40 bg-red-800/85"
                />
              ))}
            </div>
          </button>
        );
      })}
    </>
  );
}
