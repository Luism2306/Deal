import { CardTemplate } from "@/components/cards/card-template";
import type { PlacedProperty } from "@/types/game";
import { groupProperties } from "@/components/game/property-groups";

interface PlayerPropertiesBoardProps {
  properties: PlacedProperty[];
  isHumanTurn: boolean;
  onMoveWild: (propertyId: string, assignedColor: string) => void;
}

export function PlayerPropertiesBoard({ properties, isHumanTurn, onMoveWild }: PlayerPropertiesBoardProps) {
  const groupedCurrentProperties = groupProperties(properties);

  return (
    <div className="mt-4 rounded-xl border border-white/20 bg-black/25 p-3">
      <p className="text-xs uppercase text-white/70">Tus cartas de propiedad en mesa (agrupadas)</p>
      <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        {properties?.length === 0 && <p className="text-xs text-white/70">Aún no hay propiedades.</p>}
        {groupedCurrentProperties.map((group) => {
          const topCard = group.cards[group.cards.length - 1];
          return (
            <div key={`group-${group.color}`} className="rounded-lg border border-white/20 bg-black/20 p-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold uppercase">{group.color}</span>
                <span className="rounded bg-white/20 px-1.5 py-0.5">{group.cards.length}</span>
              </div>
              <div className="relative h-52 w-full">
                <CardTemplate card={topCard} compact />
                {group.cards.length > 1 && (
                  <div className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-white/40 bg-black/70 px-1.5 py-0.5 text-[10px]">
                    x{group.cards.length}
                  </div>
                )}
              </div>
              {group.cards
                .filter((property) => property.kind === "wild")
                .map((property) => (
                  <div key={property.id} className="mt-1 flex flex-wrap gap-1">
                    {(property.colors ?? []).map((color) => (
                      <button
                        key={`${property.id}-${color}`}
                        type="button"
                        disabled={!isHumanTurn}
                        onClick={() => onMoveWild(property.id, color)}
                        className="rounded border border-black/30 bg-white/60 px-1.5 py-0.5 text-[10px] text-black disabled:opacity-45"
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
