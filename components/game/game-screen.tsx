"use client";

import { useMemo, useState } from "react";
import { HistoryPanel } from "@/components/game/history-panel";
import type { GameState } from "@/types/game";
import { OpponentsRing } from "@/components/game/opponents-ring";
import { PlayerPropertiesBoard } from "@/components/game/player-properties-board";
import { DebtModal } from "@/components/game/debt-modal";
import { formatCard } from "@/components/game/card-format";
import { TableScene } from "@/components/game/three/table-scene";

interface GameScreenProps {
  game: GameState;
  onPlayToBank: (cardId: string) => void;
  onPlayToProperties: (cardId: string, assignedColor?: string) => void;
  onPlayAction: (
    cardId: string,
    options?: { targetPlayerId?: string; targetPropertyId?: string; myPropertyId?: string },
  ) => void;
  onMoveWild: (propertyId: string, assignedColor: string) => void;
  onPayDebt: (bankIds: string[], propertyIds: string[]) => void;
  onAutoPayDebt: () => void;
  onPassTurn: () => void;
  onEndTurn: () => void;
  onReset: () => void;
}

export function GameScreen({
  game,
  onPlayToBank,
  onPlayToProperties,
  onPlayAction,
  onMoveWild,
  onPayDebt,
  onAutoPayDebt,
  onPassTurn,
  onEndTurn,
  onReset,
}: GameScreenProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | undefined>(undefined);
  const [selectedTargetPropertyId, setSelectedTargetPropertyId] = useState<string | undefined>(undefined);
  const [selectedMyPropertyId, setSelectedMyPropertyId] = useState<string | undefined>(undefined);
  const [selectedDebtBankIds, setSelectedDebtBankIds] = useState<string[]>([]);
  const [selectedDebtPropertyIds, setSelectedDebtPropertyIds] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [exitingCardId, setExitingCardId] = useState<string | null>(null);

  const currentPlayer = game.players[game.currentPlayerIndex];
  const humanPlayer = game.players.find((player) => !player.isBot) ?? currentPlayer;
  const isHumanTurn = currentPlayer.id === humanPlayer.id;
  const selectedCard = humanPlayer.hand.find((card) => card.id === selectedCardId) ?? null;
  const debt = game.pendingDebt;
  const debtForHumanPlayer = debt?.fromPlayerId === humanPlayer.id ? debt : null;

  const selectedDebtAmount = useMemo(() => {
    const selectedBankValue = humanPlayer.bank
      .filter((card) => selectedDebtBankIds.includes(card.id))
      .reduce((total, card) => total + card.value, 0);

    const selectedPropertyValue = humanPlayer.properties
      .filter((card) => selectedDebtPropertyIds.includes(card.id))
      .reduce((total, card) => total + card.value, 0);

    return selectedBankValue + selectedPropertyValue;
  }, [humanPlayer.bank, humanPlayer.properties, selectedDebtBankIds, selectedDebtPropertyIds]);

  const otherPlayers = game.players.filter((player) => player.id !== humanPlayer.id);

  const selectedTargetPlayer = selectedTargetId
    ? otherPlayers.find((player) => player.id === selectedTargetId)
    : undefined;

  const isTratoAstuto = Boolean(
    selectedCard &&
      selectedCard.kind === "action" &&
      (selectedCard.name.includes("Trato Astuto") || selectedCard.name.includes("Negocio Furtivo")),
  );
  const isIntercambio = Boolean(
    selectedCard &&
      selectedCard.kind === "action" &&
      (selectedCard.name.includes("Intercambio Forzado") || selectedCard.name.includes("Trato Forzoso")),
  );

  const canPlaySelectedAction = Boolean(
    selectedCard &&
      (!isTratoAstuto || (selectedTargetId && selectedTargetPropertyId)) &&
      (!isIntercambio || (selectedTargetId && selectedTargetPropertyId && selectedMyPropertyId)),
  );

  const showCardActionModal = Boolean(selectedCard && isHumanTurn);

  function playWithExitAnimation(cardId: string, action: () => void) {
    setExitingCardId(cardId);
    setSelectedCardId(null);
    setSelectedTargetId(undefined);
    setSelectedTargetPropertyId(undefined);
    setSelectedMyPropertyId(undefined);
    window.setTimeout(() => {
      action();
      setExitingCardId(null);
    }, 380);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100e] text-[var(--cream)]">
      <HistoryPanel entries={game.log} open={historyOpen} onToggle={() => setHistoryOpen((prev) => !prev)} />

      <section className="absolute inset-0">
        <div className="absolute inset-0 z-0">
          <TableScene
            humanHand={humanPlayer.hand}
            selectedCardId={selectedCardId}
            isHumanTurn={isHumanTurn}
            exitingCardId={exitingCardId}
            onSelectCard={setSelectedCardId}
            otherPlayers={otherPlayers}
            activePlayerId={currentPlayer.id}
            humanPlayerId={humanPlayer.id}
            drawPileCount={game.drawPile.length}
          />
        </div>

        <header className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-4 md:left-6 md:right-6 md:top-6">
          <div className="rb-panel rounded-xl px-4 py-2">
            <p className="rb-eyebrow">Ronda</p>
            <p className="text-base font-bold text-[var(--cream)]">
              Turno {game.turnNumber}: {currentPlayer.name}
            </p>
            <p className="text-xs text-[var(--cream-muted)]">Movimientos: {game.movesRemaining}/3</p>
          </div>
          <button type="button" onClick={onReset} className="rb-btn-secondary px-3 py-2 text-xs">
            Menú
          </button>
        </header>

        <div className="rb-panel absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-full px-4 py-2 text-xs md:top-6">
          Reparto: {game.drawPile.length} · Juego: {game.discardPile.length}
        </div>

        <OpponentsRing
          players={otherPlayers}
          activePlayerId={currentPlayer.id}
          selectedTargetId={selectedTargetId}
          onSelectTarget={setSelectedTargetId}
        />

        <section className="rb-panel absolute left-1/2 top-[34%] z-20 w-[86%] max-w-6xl -translate-x-1/2 rounded-2xl p-4">
          <PlayerPropertiesBoard
            properties={humanPlayer.properties}
            isHumanTurn={isHumanTurn}
            onMoveWild={onMoveWild}
          />
        </section>

        {debtForHumanPlayer && (
          <DebtModal
            amount={debtForHumanPlayer.amount}
            reason={debtForHumanPlayer.reason}
            bankCards={humanPlayer.bank}
            propertyCards={humanPlayer.properties}
            selectedBankIds={selectedDebtBankIds}
            selectedPropertyIds={selectedDebtPropertyIds}
            selectedTotal={selectedDebtAmount}
            onToggleBankId={(id) =>
              setSelectedDebtBankIds((prev) =>
                prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
              )
            }
            onTogglePropertyId={(id) =>
              setSelectedDebtPropertyIds((prev) =>
                prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
              )
            }
            onConfirm={() => {
              onPayDebt(selectedDebtBankIds, selectedDebtPropertyIds);
              setSelectedDebtBankIds([]);
              setSelectedDebtPropertyIds([]);
            }}
            onAutoPay={onAutoPayDebt}
          />
        )}

        <section className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex w-full max-w-5xl -translate-x-1/2 items-end justify-end px-4">
          <aside className="rb-panel pointer-events-auto flex flex-col gap-2 rounded-xl px-3 py-2 text-xs">
            <p className="rb-eyebrow">Turno</p>
            <button
              type="button"
              disabled={!isHumanTurn}
              onClick={() => {
                if (!isHumanTurn) return;
                if (game.movesRemaining > 0) {
                  onPassTurn();
                } else {
                  onEndTurn();
                }
              }}
              className="rb-btn-primary px-3 py-2 text-xs"
            >
              {game.movesRemaining > 0 ? "Pasar y terminar" : "Siguiente turno"}
            </button>
          </aside>
        </section>

        {showCardActionModal && (
          <section className="rb-modal absolute bottom-24 left-1/2 z-40 w-[92%] max-w-xl -translate-x-1/2 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="rb-eyebrow">Acciones de carta</p>
                <p className="text-sm font-semibold text-[var(--cream)]">
                  {selectedCard ? formatCard(selectedCard) : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCardId(null)}
                className="rb-btn-secondary px-2 py-1 text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!selectedCard || !!debtForHumanPlayer || !!exitingCardId}
                onClick={() =>
                  selectedCard &&
                  playWithExitAnimation(selectedCard.id, () => onPlayToBank(selectedCard.id))
                }
                className="rb-btn-secondary px-3 py-2 text-xs"
              >
                Jugar en banco
              </button>
              <button
                type="button"
                disabled={!selectedCard || !!debtForHumanPlayer || !!exitingCardId}
                onClick={() =>
                  selectedCard &&
                  playWithExitAnimation(selectedCard.id, () =>
                    onPlayToProperties(selectedCard.id, selectedCard.colors?.[0]),
                  )
                }
                className="rb-btn-secondary px-3 py-2 text-xs"
              >
                Jugar en propiedad
              </button>
              <button
                type="button"
                disabled={!selectedCard || !!debtForHumanPlayer || !canPlaySelectedAction || !!exitingCardId}
                onClick={() =>
                  selectedCard &&
                  playWithExitAnimation(selectedCard.id, () =>
                    onPlayAction(selectedCard.id, {
                      targetPlayerId: selectedTargetId,
                      targetPropertyId: selectedTargetPropertyId,
                      myPropertyId: selectedMyPropertyId,
                    }),
                  )
                }
                className="rb-btn-primary px-3 py-2 text-xs"
              >
                Ejecutar acción
              </button>
            </div>

            {(isTratoAstuto || isIntercambio) && (
              <div className="rb-panel mt-3 rounded-lg p-2 text-xs">
                <p className="font-semibold text-[var(--cream)]">Selección de objetivo</p>
                {!selectedTargetPlayer && (
                  <p className="mt-1 text-[var(--cream-muted)]">Selecciona un bot en mesa (izquierda/arriba/derecha).</p>
                )}
                {selectedTargetPlayer && (
                  <>
                    <label className="mt-2 block text-[var(--cream-muted)]">Carta del oponente</label>
                    <select
                      value={selectedTargetPropertyId ?? ""}
                      onChange={(event) => setSelectedTargetPropertyId(event.target.value || undefined)}
                      className="mt-1 w-full rounded-md border border-[var(--panel-border)] bg-[#0d1b18] px-2 py-1 text-[var(--cream)]"
                    >
                      <option value="">Seleccionar propiedad</option>
                      {selectedTargetPlayer.properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {formatCard(property)}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {isIntercambio && (
                  <>
                    <label className="mt-2 block text-[var(--cream-muted)]">Tu carta para intercambio</label>
                    <select
                      value={selectedMyPropertyId ?? ""}
                      onChange={(event) => setSelectedMyPropertyId(event.target.value || undefined)}
                      className="mt-1 w-full rounded-md border border-[var(--panel-border)] bg-[#0d1b18] px-2 py-1 text-[var(--cream)]"
                    >
                      <option value="">Seleccionar tu propiedad</option>
                      {humanPlayer.properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {formatCard(property)}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
