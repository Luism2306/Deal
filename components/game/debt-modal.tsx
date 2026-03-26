import type { Card, PlacedProperty } from "@/types/game";
import { formatCard } from "@/components/game/card-format";

interface DebtModalProps {
  amount: number;
  reason: string;
  bankCards: Card[];
  propertyCards: PlacedProperty[];
  selectedBankIds: string[];
  selectedPropertyIds: string[];
  selectedTotal: number;
  onToggleBankId: (id: string) => void;
  onTogglePropertyId: (id: string) => void;
  onConfirm: () => void;
  onAutoPay: () => void;
}

export function DebtModal({
  amount,
  reason,
  bankCards,
  propertyCards,
  selectedBankIds,
  selectedPropertyIds,
  selectedTotal,
  onToggleBankId,
  onTogglePropertyId,
  onConfirm,
  onAutoPay,
}: DebtModalProps) {
  return (
    <section className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-rose-300 bg-rose-50 p-4 text-slate-900">
        <h2 className="text-lg font-bold">Debes pagar {amount}M</h2>
        <p className="text-sm">Razón: {reason}</p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-300 bg-white p-3">
            <p className="text-sm font-semibold">Banco</p>
            <div className="mt-2 space-y-1">
              {bankCards.map((card) => (
                <label key={card.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBankIds.includes(card.id)}
                    onChange={() => onToggleBankId(card.id)}
                  />
                  <span>{formatCard(card)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white p-3">
            <p className="text-sm font-semibold">Propiedades</p>
            <div className="mt-2 space-y-1">
              {propertyCards.map((card) => (
                <label key={card.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPropertyIds.includes(card.id)}
                    onChange={() => onTogglePropertyId(card.id)}
                  />
                  <span>{formatCard(card)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold">Seleccionado: {selectedTotal}M</p>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm"
          >
            Confirmar pago
          </button>
          <button
            type="button"
            onClick={onAutoPay}
            className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm"
          >
            Auto pagar
          </button>
        </div>
      </div>
    </section>
  );
}
