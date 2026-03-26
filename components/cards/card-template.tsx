import type { Card, PlacedProperty } from "@/types/game";
import { PropertyCard } from "@/components/cards/property-card";

type CardData = Card | PlacedProperty;

interface CardTemplateProps {
  card: CardData;
  compact?: boolean;
  selected?: boolean;
}

const groupSizeByColor: Record<string, number> = {
  marron: 2,
  "azul-claro": 3,
  rosa: 3,
  naranja: 3,
  rojo: 3,
  amarillo: 3,
  verde: 3,
  "azul-oscuro": 2,
  ferrocarril: 4,
  servicio: 2,
};

function getPrimaryColor(card: CardData): string | undefined {
  if (card.kind === "wild" && "assignedColor" in card && card.assignedColor) {
    return card.assignedColor;
  }
  return card.colors?.[0];
}

function colorBadgeClass(color?: string): string {
  switch (color) {
    case "marron":
      return "bg-amber-700";
    case "azul-claro":
      return "bg-sky-400";
    case "rosa":
      return "bg-pink-400";
    case "naranja":
      return "bg-orange-500";
    case "rojo":
      return "bg-red-500";
    case "amarillo":
      return "bg-yellow-400";
    case "verde":
      return "bg-green-500";
    case "azul-oscuro":
      return "bg-blue-700";
    case "ferrocarril":
      return "bg-zinc-900";
    case "servicio":
      return "bg-teal-500";
    default:
      return "bg-violet-500";
  }
}

function rentBySetSize(size: number): number[] {
  if (size === 2) {
    return [2, 4];
  }
  if (size === 4) {
    return [1, 2, 3, 4];
  }
  return [2, 4, 6];
}

function typeLabel(card: CardData): string {
  switch (card.kind) {
    case "property":
      return "Carta de Propiedad";
    case "wild":
      return "Comodín de Propiedad";
    case "action":
      return "Carta de Acción";
    case "rent":
      return "Carta de Alquiler";
    case "money":
      return "Carta de Dinero";
    default:
      return "Carta";
  }
}

export function CardTemplate({ card, compact = false, selected = false }: CardTemplateProps) {
  const primaryColor = getPrimaryColor(card);
  const setSize = groupSizeByColor[primaryColor ?? ""] ?? 3;
  const rentValues = rentBySetSize(setSize);

  // Si es propiedad, usamos el componente específico
  if (card.kind === "property") {
    return <PropertyCard card={card as CardData & { kind: "property" }} selected={selected} />;
  }

  // Plantilla genérica para el resto de tipos de carta (comodín, acción, renta, dinero)
  return (
    <article
      className={`h-full w-full rounded-xl border-2 bg-white text-slate-900 shadow-md ${selected ? "border-yellow-400" : "border-slate-900/70"}`}
    >
      <div className="flex items-center justify-between border-b border-slate-300 px-2 py-1">
        <span className="rounded-full border border-slate-500 px-1.5 py-0.5 text-[10px] font-semibold">
          {card.kind === "wild" ? "WILD" : `${card.value}M`}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide">{typeLabel(card)}</span>
      </div>

      <div className="px-2 pb-2 pt-1">
        <div className={`mb-2 h-1.5 w-full rounded ${colorBadgeClass(primaryColor)}`} />
        <h3 className={`font-black uppercase tracking-tight ${compact ? "text-[10px]" : "text-xs"}`}>
          {card.name}
        </h3>

        {card.kind === "wild" && (
          <div className="mt-2 rounded-md border border-slate-300 p-1.5">
            <p className="text-[9px] font-bold uppercase">Valor por propiedades</p>
            <div className="mt-1 space-y-0.5 text-[9px]">
              {rentValues.map((rent, index) => (
                <div key={`${card.id}-rent-${index}`} className="flex items-center justify-between">
                  <span>{index + 1} carta(s)</span>
                  <span className="font-bold">{rent}M</span>
                </div>
              ))}
              <div className="mt-0.5 border-t border-slate-300 pt-0.5 text-right text-[9px] font-bold">
                Grupo completo: {rentValues[rentValues.length - 1]}M
              </div>
            </div>
          </div>
        )}

        <p className={`mt-2 leading-tight text-slate-700 ${compact ? "line-clamp-4 text-[9px]" : "text-[10px]"}`}>
          {card.description}
        </p>
      </div>
    </article>
  );
}
