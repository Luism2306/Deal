import type { Card, PlacedProperty } from "@/types/game";

export function formatCard(card: Card | PlacedProperty): string {
  const base = `${card.name} (${card.value}M)`;
  if (card.kind === "wild") {
    const assignedColor = "assignedColor" in card ? card.assignedColor : undefined;
    return `${base}${assignedColor ? ` · ${assignedColor}` : ""}`;
  }
  return base;
}
