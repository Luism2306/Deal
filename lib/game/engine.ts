import { createDeck, MAX_PLAYERS, MIN_PLAYERS } from "@/lib/game/deck";
import type {
  Card,
  Difficulty,
  GameState,
  PendingDebt,
  PlacedProperty,
  PlayerState,
} from "@/types/game";

interface DrawResult {
  drawn: Card[];
  drawPile: Card[];
  discardPile: Card[];
}

export interface ActionPlayOptions {
  targetPlayerId?: string;
  targetPropertyId?: string;
  myPropertyId?: string;
}

const GROUP_SIZE_BY_COLOR: Record<string, number> = {
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

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function randomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return items[randomInt(items.length)];
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((player) => ({
      ...player,
      hand: [...player.hand],
      bank: [...player.bank],
      properties: player.properties.map((property) => ({ ...property })),
    })),
    drawPile: [...state.drawPile],
    discardPile: [...state.discardPile],
    log: [...state.log],
    pendingDebt: state.pendingDebt ? { ...state.pendingDebt } : null,
  };
}

function findPlayerIndexById(state: GameState, playerId: string): number {
  return state.players.findIndex((player) => player.id === playerId);
}

function getCurrentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}

function getPropertyColor(property: PlacedProperty): string | undefined {
  return property.assignedColor ?? property.colors?.[0];
}

function isPropertyInCompleteGroup(player: PlayerState, propertyId: string): boolean {
  const property = player.properties.find((item) => item.id === propertyId);
  if (!property) {
    return false;
  }

  const color = getPropertyColor(property);
  if (!color || color === "multicolor") {
    return false;
  }

  const required = GROUP_SIZE_BY_COLOR[color] ?? 3;
  const count = player.properties.filter((item) => getPropertyColor(item) === color).length;
  return count >= required;
}

function getCardValue(card: Card | PlacedProperty): number {
  return Math.max(card.value, 0);
}

function canCurrentPlayerAct(state: GameState): boolean {
  const currentPlayer = getCurrentPlayer(state);
  if (!state.pendingDebt) {
    return true;
  }

  return state.pendingDebt.fromPlayerId !== currentPlayer.id;
}

function drawCards(
  drawPile: Card[],
  discardPile: Card[],
  amount: number,
): DrawResult {
  let nextDrawPile = [...drawPile];
  let nextDiscardPile = [...discardPile];
  const drawn: Card[] = [];

  for (let step = 0; step < amount; step += 1) {
    if (nextDrawPile.length === 0) {
      if (nextDiscardPile.length === 0) {
        break;
      }

      nextDrawPile = shuffleCards(nextDiscardPile);
      nextDiscardPile = [];
    }

    const card = nextDrawPile.shift();
    if (!card) {
      break;
    }

    drawn.push(card);
  }

  return {
    drawn,
    drawPile: nextDrawPile,
    discardPile: nextDiscardPile,
  };
}

function removeCardFromHand(player: PlayerState, cardId: string): Card | undefined {
  const index = player.hand.findIndex((card) => card.id === cardId);
  if (index < 0) {
    return undefined;
  }

  const [card] = player.hand.splice(index, 1);
  return card;
}

function pushLog(state: GameState, message: string): void {
  state.log.unshift(message);
}

function drawForCurrentPlayer(state: GameState, amount: number): GameState {
  const nextState = cloneState(state);
  const currentPlayer = getCurrentPlayer(nextState);
  const result = drawCards(nextState.drawPile, nextState.discardPile, amount);

  currentPlayer.hand.push(...result.drawn);
  nextState.drawPile = result.drawPile;
  nextState.discardPile = result.discardPile;

  pushLog(nextState, `${currentPlayer.name} roba ${result.drawn.length} carta(s).`);
  return nextState;
}

function transferCardToReceiver(
  receiver: PlayerState,
  card: Card | PlacedProperty,
  isProperty: boolean,
): void {
  if (isProperty || card.kind === "property" || card.kind === "wild") {
    receiver.properties.push({ ...(card as PlacedProperty) });
    return;
  }

  receiver.bank.push({ ...(card as Card) });
}

function autoSelectPaymentCards(player: PlayerState, amount: number): {
  bankIds: string[];
  propertyIds: string[];
} {
  const candidates: Array<{
    id: string;
    source: "bank" | "property";
    value: number;
  }> = [
    ...player.bank.map((card) => ({ id: card.id, source: "bank" as const, value: getCardValue(card) })),
    ...player.properties.map((card) => ({ id: card.id, source: "property" as const, value: getCardValue(card) })),
  ].sort((left, right) => right.value - left.value);

  const bankIds: string[] = [];
  const propertyIds: string[] = [];
  let total = 0;

  for (const candidate of candidates) {
    if (total >= amount) {
      break;
    }

    total += candidate.value;
    if (candidate.source === "bank") {
      bankIds.push(candidate.id);
    } else {
      propertyIds.push(candidate.id);
    }
  }

  return { bankIds, propertyIds };
}

function setOrAccumulateDebt(state: GameState, debt: PendingDebt): void {
  if (!state.pendingDebt) {
    state.pendingDebt = debt;
    pushLog(state, `${debt.reason}: ${debt.amount}M por pagar.`);
    return;
  }

  if (
    state.pendingDebt.fromPlayerId === debt.fromPlayerId &&
    state.pendingDebt.toPlayerId === debt.toPlayerId
  ) {
    state.pendingDebt.amount += debt.amount;
    pushLog(state, `${debt.reason}: se acumula deuda (+${debt.amount}M).`);
    return;
  }

  pushLog(state, "Ya existe una deuda pendiente. La nueva deuda se descarta.");
}

function getPayableCount(player: PlayerState): number {
  return player.bank.length + player.properties.length;
}

function applyPaymentSelection(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  bankIds: string[],
  propertyIds: string[],
): number {
  const fromPlayer = state.players[fromIndex];
  const toPlayer = state.players[toIndex];
  let paid = 0;

  for (const bankId of bankIds) {
    const bankIndex = fromPlayer.bank.findIndex((card) => card.id === bankId);
    if (bankIndex < 0) {
      continue;
    }

    const [card] = fromPlayer.bank.splice(bankIndex, 1);
    paid += getCardValue(card);
    transferCardToReceiver(toPlayer, card, false);
  }

  for (const propertyId of propertyIds) {
    const propertyIndex = fromPlayer.properties.findIndex((card) => card.id === propertyId);
    if (propertyIndex < 0) {
      continue;
    }

    const [card] = fromPlayer.properties.splice(propertyIndex, 1);
    paid += getCardValue(card);
    transferCardToReceiver(toPlayer, card, true);
  }

  return paid;
}

function enforceHandLimit(state: GameState, playerIndex: number): GameState {
  const nextState = cloneState(state);
  const player = nextState.players[playerIndex];

  if (player.hand.length <= 7) {
    return nextState;
  }

  const discardCount = player.hand.length - 7;
  const discarded = player.hand.splice(0, discardCount);
  nextState.discardPile.push(...discarded);
  pushLog(nextState, `${player.name} descarta ${discarded.length} carta(s) para quedar con 7.`);

  return nextState;
}

function estimateRentForPlayer(player: PlayerState, isMulticolor: boolean): number {
  const countByColor: Record<string, number> = {};

  for (const property of player.properties) {
    const color = property.assignedColor ?? property.colors?.[0];
    if (!color) {
      continue;
    }

    countByColor[color] = (countByColor[color] ?? 0) + 1;
  }

  const bestColor = Object.entries(countByColor).sort((left, right) => right[1] - left[1])[0];
  if (!bestColor) {
    return isMulticolor ? 2 : 1;
  }

  const [color, count] = bestColor;
  const needed = GROUP_SIZE_BY_COLOR[color] ?? 3;
  const baseRent = Math.max(1, count);
  const bonus = count >= needed ? 2 : 0;
  const multicolorBonus = isMulticolor ? 1 : 0;

  return baseRent + bonus + multicolorBonus;
}

function prepareNextTurn(state: GameState): GameState {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  let nextState = {
    ...state,
    currentPlayerIndex: nextIndex,
    movesRemaining: 3,
    turnNumber: state.turnNumber + 1,
  };

  const nextPlayer = nextState.players[nextState.currentPlayerIndex];
  const drawAmount = nextPlayer.hand.length === 0 ? 5 : 2;

  nextState = drawForCurrentPlayer(nextState, drawAmount);
  pushLog(nextState, `Turno ${nextState.turnNumber}: ${nextPlayer.name}.`);

  return nextState;
}

function resolveAutoDebtIfNeeded(state: GameState): GameState {
  if (!state.pendingDebt) {
    return state;
  }

  const debtorIndex = findPlayerIndexById(state, state.pendingDebt.fromPlayerId);
  const creditorIndex = findPlayerIndexById(state, state.pendingDebt.toPlayerId);

  if (debtorIndex < 0 || creditorIndex < 0) {
    return { ...state, pendingDebt: null };
  }

  const debtor = state.players[debtorIndex];
  if (!debtor.isBot) {
    return state;
  }

  const nextState = cloneState(state);
  const debt = nextState.pendingDebt;
  if (!debt) {
    return nextState;
  }

  const payment = autoSelectPaymentCards(nextState.players[debtorIndex], debt.amount);
  const paid = applyPaymentSelection(nextState, debtorIndex, creditorIndex, payment.bankIds, payment.propertyIds);
  const remaining = Math.max(debt.amount - paid, 0);

  pushLog(
    nextState,
    `${nextState.players[debtorIndex].name} paga ${paid}M a ${nextState.players[creditorIndex].name}.`,
  );

  if (remaining === 0 || getPayableCount(nextState.players[debtorIndex]) === 0) {
    nextState.pendingDebt = null;
  } else if (nextState.pendingDebt) {
    nextState.pendingDebt.amount = remaining;
  }

  return nextState;
}

export function shuffleCards(cards: Card[]): Card[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function createInitialGameState(totalPlayers: number, difficulty: Difficulty): GameState {
  if (totalPlayers < MIN_PLAYERS || totalPlayers > MAX_PLAYERS) {
    throw new Error(`El número de jugadores debe estar entre ${MIN_PLAYERS} y ${MAX_PLAYERS}.`);
  }

  const players: PlayerState[] = Array.from({ length: totalPlayers }, (_, index) => ({
    id: `player-${index + 1}`,
    name: index === 0 ? "Tú" : `Bot ${index}`,
    isBot: index > 0,
    hand: [],
    bank: [],
    properties: [],
  }));

  let drawPile = shuffleCards(createDeck());
  let discardPile: Card[] = [];

  for (let round = 0; round < 5; round += 1) {
    for (let index = 0; index < players.length; index += 1) {
      const result = drawCards(drawPile, discardPile, 1);
      drawPile = result.drawPile;
      discardPile = result.discardPile;
      players[index].hand.push(...result.drawn);
    }
  }

  let state: GameState = {
    difficulty,
    players,
    drawPile,
    discardPile,
    currentPlayerIndex: 0,
    movesRemaining: 3,
    turnNumber: 1,
    log: ["Partida iniciada. Cada jugador recibió 5 cartas."],
    pendingDebt: null,
  };

  state = drawForCurrentPlayer(state, 2);
  pushLog(state, "Turno 1: Tú.");

  return state;
}

export function playCardToBank(state: GameState, cardId: string): GameState {
  if (state.movesRemaining <= 0 || !canCurrentPlayerAct(state)) {
    return state;
  }

  const nextState = cloneState(state);
  const player = getCurrentPlayer(nextState);
  const card = removeCardFromHand(player, cardId);

  if (!card) {
    return state;
  }

  if (card.kind === "property" || card.kind === "wild") {
    player.hand.push(card);
    pushLog(nextState, "Las propiedades y comodines no se pueden colocar como dinero en banco.");
    return nextState;
  }

  player.bank.push(card);
  nextState.movesRemaining -= 1;
  pushLog(nextState, `${player.name} coloca ${card.name} en su banco.`);

  return nextState;
}

export function playCardToProperties(
  state: GameState,
  cardId: string,
  assignedColor?: string,
): GameState {
  if (state.movesRemaining <= 0 || !canCurrentPlayerAct(state)) {
    return state;
  }

  const nextState = cloneState(state);
  const player = getCurrentPlayer(nextState);
  const card = removeCardFromHand(player, cardId);

  if (!card) {
    return state;
  }

  if (card.kind !== "property" && card.kind !== "wild") {
    player.hand.push(card);
    pushLog(nextState, "Esa carta no se puede jugar como propiedad.");
    return nextState;
  }

  const nextProperty: PlacedProperty = {
    ...card,
    assignedColor: card.kind === "wild" ? assignedColor ?? card.colors?.[0] : card.colors?.[0],
  };

  player.properties.push(nextProperty);
  nextState.movesRemaining -= 1;
  pushLog(nextState, `${player.name} coloca ${card.name} en propiedades.`);

  return nextState;
}

export function moveWildProperty(
  state: GameState,
  propertyId: string,
  assignedColor: string,
): GameState {
  const nextState = cloneState(state);
  const player = getCurrentPlayer(nextState);
  const property = player.properties.find((card) => card.id === propertyId);

  if (!property || property.kind !== "wild") {
    return state;
  }

  const allowedColors = property.colors ?? [];
  if (!allowedColors.includes(assignedColor) && !allowedColors.includes("multicolor")) {
    return state;
  }

  property.assignedColor = assignedColor;
  pushLog(nextState, `${player.name} mueve comodín ${property.name} a ${assignedColor}.`);

  return nextState;
}

export function playActionCard(
  state: GameState,
  cardId: string,
  options?: ActionPlayOptions,
): GameState {
  if (state.movesRemaining <= 0 || !canCurrentPlayerAct(state)) {
    return state;
  }

  const nextState = cloneState(state);
  const currentPlayer = getCurrentPlayer(nextState);
  const card = removeCardFromHand(currentPlayer, cardId);

  if (!card) {
    return state;
  }

  if (card.kind !== "action" && card.kind !== "rent") {
    currentPlayer.hand.push(card);
    pushLog(nextState, "Esa carta no es de acción/alquiler.");
    return nextState;
  }

  nextState.discardPile.push(card);
  nextState.movesRemaining -= 1;

  const opponents = nextState.players.filter((player) => player.id !== currentPlayer.id);
  const selectedTarget = options?.targetPlayerId
    ? nextState.players.find(
        (player) => player.id === options.targetPlayerId && player.id !== currentPlayer.id,
      )
    : undefined;
  const target = selectedTarget ?? randomItem(opponents);

  if (!target) {
    pushLog(nextState, `${currentPlayer.name} juega ${card.name}, sin objetivo disponible.`);
    return nextState;
  }

  if (card.name.includes("Pasa por la Salida")) {
    const updated = drawForCurrentPlayer(nextState, 2);
    pushLog(updated, `${currentPlayer.name} usa Pasa por la Salida.`);
    return updated;
  }

  if (card.name.includes("Cobrador de Deudas") || card.name.includes("Cobro 5M")) {
    if (target.isBot) {
      const debtorIndex = findPlayerIndexById(nextState, target.id);
      const payment = autoSelectPaymentCards(nextState.players[debtorIndex], 5);
      const paid = applyPaymentSelection(
        nextState,
        debtorIndex,
        nextState.currentPlayerIndex,
        payment.bankIds,
        payment.propertyIds,
      );
      pushLog(nextState, `${currentPlayer.name} cobra deuda a ${target.name} por ${paid}M.`);
    } else {
      setOrAccumulateDebt(nextState, {
        fromPlayerId: target.id,
        toPlayerId: currentPlayer.id,
        amount: 5,
        reason: "Cobrador de Deudas",
      });
    }

    return nextState;
  }

  if (card.name.includes("Es Mi Cumpleaños") || card.name.includes("Cobro 10M")) {
    for (const opponent of opponents) {
      if (opponent.isBot) {
        const debtorIndex = findPlayerIndexById(nextState, opponent.id);
        const payment = autoSelectPaymentCards(nextState.players[debtorIndex], 2);
        const paid = applyPaymentSelection(
          nextState,
          debtorIndex,
          nextState.currentPlayerIndex,
          payment.bankIds,
          payment.propertyIds,
        );
        pushLog(nextState, `${opponent.name} paga ${paid}M por cumpleaños.`);
      } else {
        setOrAccumulateDebt(nextState, {
          fromPlayerId: opponent.id,
          toPlayerId: currentPlayer.id,
          amount: 2,
          reason: "Es Mi Cumpleaños",
        });
      }
    }

    return nextState;
  }

  if (card.kind === "rent") {
    const rentAmount = estimateRentForPlayer(currentPlayer, card.name.includes("Multicolor"));
    if (target.isBot) {
      const debtorIndex = findPlayerIndexById(nextState, target.id);
      const payment = autoSelectPaymentCards(nextState.players[debtorIndex], rentAmount);
      const paid = applyPaymentSelection(
        nextState,
        debtorIndex,
        nextState.currentPlayerIndex,
        payment.bankIds,
        payment.propertyIds,
      );
      pushLog(nextState, `${currentPlayer.name} cobra alquiler por ${paid}M a ${target.name}.`);
    } else {
      setOrAccumulateDebt(nextState, {
        fromPlayerId: target.id,
        toPlayerId: currentPlayer.id,
        amount: rentAmount,
        reason: "Cobro de Alquiler",
      });
    }

    return nextState;
  }

  if (card.name.includes("Negocio Furtivo") || card.name.includes("Trato Astuto")) {
    const chosenTargetProperty = options?.targetPropertyId
      ? target.properties.find((property) => property.id === options.targetPropertyId)
      : undefined;
    const randomLoose = target.properties.find(
      (property) => !isPropertyInCompleteGroup(target, property.id),
    );
    const stolen = chosenTargetProperty ?? randomLoose;

    if (chosenTargetProperty && isPropertyInCompleteGroup(target, chosenTargetProperty.id)) {
      pushLog(nextState, "Trato Astuto no puede tomar cartas de grupo completo.");
      return nextState;
    }

    if (stolen) {
      target.properties = target.properties.filter((property) => property.id !== stolen.id);
      currentPlayer.properties.push(stolen);
      pushLog(nextState, `${currentPlayer.name} roba ${stolen.name} de ${target.name}.`);
    } else {
      pushLog(nextState, `${currentPlayer.name} intentó Trato Astuto sin objetivo válido.`);
    }

    return nextState;
  }

  if (card.name.includes("Trato Forzoso") || card.name.includes("Intercambio Forzado")) {
    const mine = options?.myPropertyId
      ? currentPlayer.properties.find((property) => property.id === options.myPropertyId)
      : randomItem(currentPlayer.properties);
    const theirs = options?.targetPropertyId
      ? target.properties.find((property) => property.id === options.targetPropertyId)
      : randomItem(target.properties);

    if (mine && theirs) {
      currentPlayer.properties = currentPlayer.properties.filter((property) => property.id !== mine.id);
      target.properties = target.properties.filter((property) => property.id !== theirs.id);
      currentPlayer.properties.push(theirs);
      target.properties.push(mine);
      pushLog(nextState, `${currentPlayer.name} intercambia propiedades con ${target.name}.`);
    } else {
      pushLog(nextState, `${currentPlayer.name} no pudo aplicar Intercambio Forzado.`);
    }

    return nextState;
  }

  if (card.name.includes("Roba-Negocios")) {
    const available = [...target.properties];
    const stolenCount = Math.min(2, available.length);

    for (let index = 0; index < stolenCount; index += 1) {
      const picked = randomItem(available);
      if (!picked) {
        break;
      }

      target.properties = target.properties.filter((property) => property.id !== picked.id);
      currentPlayer.properties.push(picked);
    }

    pushLog(nextState, `${currentPlayer.name} juega Roba-Negocios.`);
    return nextState;
  }

  pushLog(nextState, `${currentPlayer.name} juega ${card.name}.`);
  return nextState;
}

export function payPendingDebt(
  state: GameState,
  bankIds: string[],
  propertyIds: string[],
): GameState {
  if (!state.pendingDebt) {
    return state;
  }

  const nextState = cloneState(state);
  const debt = nextState.pendingDebt;
  if (!debt) {
    return nextState;
  }

  const fromIndex = findPlayerIndexById(nextState, debt.fromPlayerId);
  const toIndex = findPlayerIndexById(nextState, debt.toPlayerId);
  if (fromIndex < 0 || toIndex < 0) {
    nextState.pendingDebt = null;
    return nextState;
  }

  const paid = applyPaymentSelection(nextState, fromIndex, toIndex, bankIds, propertyIds);
  const remaining = Math.max(debt.amount - paid, 0);

  pushLog(
    nextState,
    `${nextState.players[fromIndex].name} paga ${paid}M a ${nextState.players[toIndex].name}.`,
  );

  if (remaining === 0 || getPayableCount(nextState.players[fromIndex]) === 0) {
    nextState.pendingDebt = null;
  } else if (nextState.pendingDebt) {
    nextState.pendingDebt.amount = remaining;
  }

  return nextState;
}

export function autoPayPendingDebt(state: GameState): GameState {
  if (!state.pendingDebt) {
    return state;
  }

  const debtorIndex = findPlayerIndexById(state, state.pendingDebt.fromPlayerId);
  if (debtorIndex < 0) {
    return { ...state, pendingDebt: null };
  }

  const debtor = state.players[debtorIndex];
  const payment = autoSelectPaymentCards(debtor, state.pendingDebt.amount);
  return payPendingDebt(state, payment.bankIds, payment.propertyIds);
}

export function endTurn(state: GameState): GameState {
  const currentPlayer = getCurrentPlayer(state);

  if (state.pendingDebt?.fromPlayerId === currentPlayer.id && getPayableCount(currentPlayer) > 0) {
    const blockedState = cloneState(state);
    pushLog(blockedState, `${currentPlayer.name} debe pagar deuda antes de finalizar turno.`);
    return blockedState;
  }

  let nextState = state;
  if (state.pendingDebt?.fromPlayerId === currentPlayer.id) {
    nextState = cloneState(state);
    nextState.pendingDebt = null;
    pushLog(nextState, `${currentPlayer.name} no tiene más cartas para pagar.`);
  }

  const limitedState = enforceHandLimit(nextState, nextState.currentPlayerIndex);
  pushLog(limitedState, `${limitedState.players[limitedState.currentPlayerIndex].name} finaliza turno.`);

  return prepareNextTurn(limitedState);
}

export function passTurn(state: GameState): GameState {
  const nextState = cloneState(state);
  nextState.movesRemaining = 0;
  pushLog(
    nextState,
    `${nextState.players[nextState.currentPlayerIndex].name} pasa turno sin jugar movimientos.`,
  );
  return endTurn(nextState);
}

function botPlayOneMove(state: GameState): GameState {
  const currentPlayer = getCurrentPlayer(state);
  const candidate = randomItem(currentPlayer.hand);
  if (!candidate) {
    return state;
  }

  if (candidate.kind === "property" || candidate.kind === "wild") {
    return playCardToProperties(state, candidate.id, candidate.colors?.[0]);
  }

  if (candidate.kind === "action" || candidate.kind === "rent") {
    return playActionCard(state, candidate.id);
  }

  return playCardToBank(state, candidate.id);
}

export function runBotTurn(state: GameState): GameState {
  const currentPlayer = getCurrentPlayer(state);
  if (!currentPlayer.isBot) {
    return state;
  }

  let nextState = resolveAutoDebtIfNeeded(state);
  const difficultyMoves: Record<Difficulty, number> = {
    facil: 1,
    medio: 2,
    dificil: 3,
  };

  const targetMoves = Math.min(difficultyMoves[nextState.difficulty], nextState.movesRemaining);

  for (let step = 0; step < targetMoves; step += 1) {
    if (!canCurrentPlayerAct(nextState) || nextState.movesRemaining <= 0) {
      break;
    }

    nextState = botPlayOneMove(nextState);
  }

  return endTurn(nextState);
}

export function getPlayerMoneyTotal(player: PlayerState): number {
  return player.bank.reduce((total, card) => total + getCardValue(card), 0);
}

export function getPayableTotal(player: PlayerState): number {
  return [...player.bank, ...player.properties].reduce(
    (total, card) => total + getCardValue(card),
    0,
  );
}
