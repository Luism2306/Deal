"use client";

import { useEffect, useRef } from "react";
import { HandCard } from "@/components/game/three/hand-card";
import type { Card } from "@/types/game";

interface HandFanProps {
  cards: Card[];
  selectedCardId: string | null;
  disabled: boolean;
  exitingCardId: string | null;
  onSelect: (cardId: string) => void;
}

export function HandFan({ cards, selectedCardId, disabled, exitingCardId, onSelect }: HandFanProps) {
  const seenIds = useRef<Set<string>>(new Set());
  const enteringIds = new Set(cards.filter((card) => !seenIds.current.has(card.id)).map((card) => card.id));

  useEffect(() => {
    cards.forEach((card) => seenIds.current.add(card.id));
  }, [cards]);

  return (
    <group>
      {cards.map((card, index) => (
        <HandCard
          key={card.id}
          card={card}
          index={index}
          total={cards.length}
          selected={selectedCardId === card.id}
          disabled={disabled}
          isExiting={exitingCardId === card.id}
          isEntering={enteringIds.has(card.id)}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
