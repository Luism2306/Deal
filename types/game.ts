export type Difficulty = "facil" | "medio" | "dificil";

export type CardKind = "property" | "wild" | "action" | "rent" | "money";

export interface Card {
  id: string;
  name: string;
  kind: CardKind;
  value: number;
  description: string;
  colors?: string[];
}

export interface PlacedProperty extends Card {
  assignedColor?: string;
}

export interface PendingDebt {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  reason: string;
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];
  bank: Card[];
  properties: PlacedProperty[];
}

export interface GameState {
  difficulty: Difficulty;
  players: PlayerState[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  movesRemaining: number;
  turnNumber: number;
  log: string[];
  pendingDebt: PendingDebt | null;
}
