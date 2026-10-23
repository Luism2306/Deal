"use client";

interface HistoryPanelProps {
  entries: string[];
  open: boolean;
  onToggle: () => void;
}

export function HistoryPanel({ entries, open, onToggle }: HistoryPanelProps) {
  return (
    <div className="fixed right-4 top-4 z-50">
      <button type="button" onClick={onToggle} className="rb-btn-secondary px-3 py-2 text-sm">
        Historial {open ? "▾" : "▸"}
      </button>

      {open && (
        <aside className="rb-modal mt-2 w-[320px] rounded-xl p-3">
          <ul className="max-h-72 space-y-2 overflow-auto text-sm text-[var(--cream)]">
            {entries.slice(0, 20).map((entry, index) => (
              <li key={`${entry}-${index}`} className="rounded-md border border-[var(--panel-border)] p-2">
                {entry}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
