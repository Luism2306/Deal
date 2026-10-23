"use client";

import { motion } from "framer-motion";
import type { Difficulty } from "@/types/game";

interface DifficultyScreenProps {
  onBack: () => void;
  onSelect: (difficulty: Difficulty) => void;
}

const options: Array<{ id: Difficulty; title: string; description: string }> = [
  { id: "facil", title: "Fácil", description: "Bots más pasivos." },
  { id: "medio", title: "Media", description: "Bots equilibrados." },
  { id: "dificil", title: "Difícil", description: "Bots más agresivos." },
];

export function DifficultyScreen({ onBack, onSelect }: DifficultyScreenProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="rb-eyebrow">Configuración</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--gold-bright)]">Selecciona dificultad</h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index }}
            onClick={() => onSelect(option.id)}
            className="rb-panel rounded-2xl p-5 text-left transition hover:border-[var(--gold)]"
          >
            <p className="text-xl font-semibold text-[var(--cream)]">{option.title}</p>
            <p className="mt-1 text-sm text-[var(--cream-muted)]">{option.description}</p>
          </motion.button>
        ))}
      </div>

      <button type="button" onClick={onBack} className="rb-btn-secondary w-fit px-4 py-2 text-sm">
        Volver
      </button>
    </section>
  );
}
