"use client";

import { useMemo, useState } from "react";
import { CardTemplate } from "@/components/cards/card-template";
import { HistoryPanel } from "@/components/game/history-panel";
import { getPlayerMoneyTotal } from "@/lib/game/engine";
import type { Card, GameState, PlacedProperty } from "@/types/game";
import { OpponentsRing } from "@/components/game/opponents-ring";
import { PlayerPropertiesBoard } from "@/components/game/player-properties-board";
import { DebtModal } from "@/components/game/debt-modal";
import { formatCard } from "@/components/game/card-format";

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#34d399_0%,#10b981_40%,#065f46_100%)] text-slate-100">
      <HistoryPanel entries={game.log} open={historyOpen} onToggle={() => setHistoryOpen((prev) => !prev)} />

      <section className="absolute inset-0 p-4 md:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/20 bg-black/15 shadow-2xl backdrop-blur-[2px]">
          <header className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-black/35 px-4 py-2 text-sm md:left-6 md:right-6 md:top-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Monopoly Deal</p>
              <p className="text-base font-bold">Turno {game.turnNumber}: {currentPlayer.name}</p>
              <p className="text-xs text-white/80">Movimientos: {game.movesRemaining}/3</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs uppercase tracking-wide text-white hover:bg-white/20"
            >
              Menú
            </button>
          </header>

          <div className="absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-xs shadow-xl">
            Reparto: {game.drawPile.length} · Juego: {game.discardPile.length}
          </div>

          <OpponentsRing
            players={otherPlayers}
            selectedTargetId={selectedTargetId}
            onSelectTarget={setSelectedTargetId}
          />

          <section className="absolute left-1/2 top-[32%] z-20 w-[86%] max-w-6xl -translate-x-1/2 rounded-2xl border border-white/25 bg-black/30 p-4 shadow-xl">
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

          <section className="absolute bottom-0 left-1/2 z-30 w-full max-w-5xl -translate-x-1/2">
            <div className="group relative mx-auto w-full max-w-5xl">
              <div
                className="pointer-events-auto translate-y-54 rounded-t-2xl border border-white/30 bg-black/40 p-3 pb-4 shadow-2xl transition-transform duration-300 ease-out group-hover:translate-y-0"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div
                      className={`flex items-end justify-center gap-1 overflow-x-auto pb-2 pt-5 transition-all ${
                        isHumanTurn ? "opacity-100" : "opacity-40 blur-[1px] translate-y-2"
                      }`}
                    >
                      {humanPlayer.hand.map((card, index) => {
                        const offset = index - (humanPlayer.hand.length - 1) / 2;
                        const rotate = offset * 4;
                        const translateY = Math.abs(offset) * 4;

                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => setSelectedCardId(card.id)}
                            disabled={!isHumanTurn}
                            className="h-52 w-34 shrink-0 rounded-xl border bg-white p-2 text-left shadow-md transition hover:-translate-y-4 disabled:opacity-45"
                            style={{
                              transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                            }}
                            title={card.description}
                          >
                            <CardTemplate card={card} compact selected={selectedCardId === card.id} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <aside className="flex flex-col justify-center gap-2 rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-xs">
                    <p className="font-semibold uppercase text-white/80">Turno</p>
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
                      className="rounded-lg border border-white/25 bg-emerald-500/80 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {game.movesRemaining > 0 ? "Pasar y terminar" : "Siguiente turno"}
                    </button>
                  </aside>
                </div>
              </div>
            </div>
          </section>

          {showCardActionModal && (
            <section className="absolute bottom-52 left-1/2 z-40 w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border border-white/30 bg-black/70 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-white/70">Acciones de carta</p>
                  <p className="text-sm font-semibold">{selectedCard ? formatCard(selectedCard) : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCardId(null)}
                  className="rounded border border-white/30 px-2 py-1 text-xs"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!selectedCard || !!debtForHumanPlayer}
                  onClick={() => selectedCard && onPlayToBank(selectedCard.id)}
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs disabled:opacity-40"
                >
                  Jugar en banco
                </button>
                <button
                  type="button"
                  disabled={!selectedCard || !!debtForHumanPlayer}
                  onClick={() =>
                    selectedCard && onPlayToProperties(selectedCard.id, selectedCard.colors?.[0])
                  }
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs disabled:opacity-40"
                >
                  Jugar en propiedad
                </button>
                <button
                  type="button"
                  disabled={!selectedCard || !!debtForHumanPlayer || !canPlaySelectedAction}
                  onClick={() =>
                    selectedCard &&
                    onPlayAction(selectedCard.id, {
                      targetPlayerId: selectedTargetId,
                      targetPropertyId: selectedTargetPropertyId,
                      myPropertyId: selectedMyPropertyId,
                    })
                  }
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs disabled:opacity-40"
                >
                  Ejecutar acción
                </button>
              </div>

              {(isTratoAstuto || isIntercambio) && (
                <div className="mt-3 rounded-lg border border-white/20 bg-black/35 p-2 text-xs">
                  <p className="font-semibold text-white/90">Selección de objetivo</p>
                  {!selectedTargetPlayer && (
                    <p className="mt-1 text-white/70">Selecciona un bot en mesa (izquierda/arriba/derecha).</p>
                  )}
                  {selectedTargetPlayer && (
                    <>
                      <label className="mt-2 block text-white/80">Carta del oponente</label>
                      <select
                        value={selectedTargetPropertyId ?? ""}
                        onChange={(event) => setSelectedTargetPropertyId(event.target.value || undefined)}
                        className="mt-1 w-full rounded-md border border-white/30 bg-black/40 px-2 py-1"
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
                      <label className="mt-2 block text-white/80">Tu carta para intercambio</label>
                      <select
                        value={selectedMyPropertyId ?? ""}
                        onChange={(event) => setSelectedMyPropertyId(event.target.value || undefined)}
                        className="mt-1 w-full rounded-md border border-white/30 bg-black/40 px-2 py-1"
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
        </div>
      </section>
    </main>
  );
}
