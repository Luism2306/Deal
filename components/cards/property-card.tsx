import type { Card, PlacedProperty } from "@/types/game";

type CardData = Card | PlacedProperty;

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

interface PropertyCardProps {
  card: CardData & { kind: "property" };
  selected?: boolean;
}

export function PropertyCard({ card, selected = false }: PropertyCardProps) {
  const primaryColor = getPrimaryColor(card);
  const setSize = groupSizeByColor[primaryColor ?? ""] ?? 3;
  const rentValues = rentBySetSize(setSize);

  return (
    <article
      className={`h-full w-full border-2 bg-white text-slate-900 shadow-md ${
        selected ? "border-yellow-400" : "border-slate-900/70"
      }`}
    >
      {/* Banda superior de color con el nombre de la propiedad */}
    <div className="relative">
          <div
        className={`relative  px-2 py-3 text-white ${colorBadgeClass(primaryColor)}`}
      >
        <h3 className="text-center text-black text-[12px] font-bold uppercase leading-tight tracking-tight ">
          {card.name}
        </h3>
      </div>
      {/* Círculo con el valor de la carta */}
      <div className="absolute -bottom-3 left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-[11px] font-black text-slate-900">
        {card.value}M
      </div>

    </div>
      <div className="px-2 pb-2 pt-4 ">
        {/* Cabeceras: propiedades / renta */}
        <div className="flex items-baseline justify-between text-[9px] font-bold uppercase">
          <span>Propiedades en el grupo</span>
          <span>Renta</span>
        </div>

        {/* Tabla de rentas por número de propiedades */}
        <div className="mt-1 space-y-0.5 text-[9px]">
          {rentValues?.map((rent, index) => (
            <div
              key={`${card.id}-rent-${index}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-1">
                {/* Icono sencillo de "cantidad de cartas" */}
                <div className="flex h-4 w-5 items-center justify-center rounded-lg border border-slate-900 bg-white">
                  <span className="text-[8px] font-bold text-pink-600">
                    {index + 1}
                  </span>
                </div>
              </div>
              <span className="font-bold">{rent}M</span>
            </div>
          ))}
        </div>

        {/* Descripción opcional en la parte inferior */}
       
      </div>
    </article>
  );
}
