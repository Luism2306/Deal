import type { PlacedProperty } from "@/types/game";

export function propertyColor(property: PlacedProperty): string {
  return property.assignedColor ?? property.colors?.[0] ?? "sin-color";
}

export function groupProperties(
  properties: PlacedProperty[],
): Array<{ color: string; cards: PlacedProperty[] }> {
  const grouped = properties.reduce<Record<string, PlacedProperty[]>>((result, property) => {
    const color = propertyColor(property);
    if (!result[color]) {
      result[color] = [];
    }
    result[color].push(property);
    return result;
  }, {});

  return Object.entries(grouped).map(([color, cards]) => ({ color, cards }));
}

export function colorBadgeClass(color: string): string {
  const base = color.toLowerCase();

  if (base.includes("marron")) return "from-amber-700 to-yellow-700";
  if (base.includes("azul-claro")) return "from-sky-300 to-sky-500";
  if (base.includes("azul-oscuro")) return "from-sky-600 to-blue-900";
  if (base.includes("rosa")) return "from-pink-400 to-pink-600";
  if (base.includes("rojo")) return "from-red-500 to-red-700";
  if (base.includes("amarillo")) return "from-yellow-300 to-yellow-500";
  if (base.includes("verde")) return "from-emerald-400 to-emerald-700";
  if (base.includes("ferrocarril")) return "from-slate-500 to-slate-800";
  if (base.includes("servicio")) return "from-cyan-400 to-cyan-700";
  if (base.includes("multicolor")) return "from-fuchsia-400 via-emerald-400 to-yellow-300";

  return "from-slate-400 to-slate-700";
}
