"use client";

interface HistoryPanelProps {
  entries: string[];
  open: boolean;
  onToggle: () => void;
}

export function HistoryPanel({ entries, open, onToggle }: HistoryPanelProps) {
  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-foreground/20 bg-background/90 px-3 py-2 text-sm font-semibold backdrop-blur"
      >
        Historial {open ? "▾" : "▸"}
      </button>

      {open && (
        <aside className="mt-2 w-[320px] rounded-xl border border-foreground/20 bg-background/95 p-3 shadow-lg backdrop-blur">
          <ul className="max-h-72 space-y-2 overflow-auto text-sm">
            {entries.slice(0, 20).map((entry, index) => (
              <li key={`${entry}-${index}`} className="rounded-md border border-foreground/10 p-2">
                {entry}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
