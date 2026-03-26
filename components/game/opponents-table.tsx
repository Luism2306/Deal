import { getPlayerMoneyTotal } from "@/lib/game/engine";
import type { PlayerState } from "@/types/game";
import { colorBadgeClass, groupProperties } from "@/components/game/property-groups";

interface OpponentsTableProps {
  players: PlayerState[];
}

export function OpponentsTable({ players }: OpponentsTableProps) {
  return (
    <div className="mt-4 rounded-xl border border-white/20 bg-black/25 p-3">
      <p className="text-xs uppercase text-white/70">Mesa visible de oponentes</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {players.map((player) => {
          const grouped = groupProperties(player.properties);
          return (
            <div
              key={`table-${player.id}`}
              className="rounded-lg border border-white/15 bg-black/20 p-2"
            >
              <p className="text-xs font-semibold">{player.name}</p>
              <p className="text-[11px] text-white/75">
                Banco: {player.bank.length} cartas · {getPlayerMoneyTotal(player)}M
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {grouped.length === 0 && (
                  <span className="text-[11px] text-white/60">Sin propiedades</span>
                )}
                {grouped.map((group) => (
                  <div
                    key={`${player.id}-${group.color}`}
                    className="flex items-center gap-1 rounded-md border border-white/25 bg-black/40 px-2 py-1 text-[10px]"
                  >
                    <span
                      className={`inline-block h-3 w-6 rounded-full bg-gradient-to-r ${colorBadgeClass(
                        group.color,
                      )}`}
                    />
                    <span className="uppercase tracking-wide text-white/85">
                      {group.color.replace("-", " ")}
                    </span>
                    <span className="ml-auto rounded-full bg-black/70 px-1.5 py-0.5 text-[9px]">
                      x{group.cards.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
