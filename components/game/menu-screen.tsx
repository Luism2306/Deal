"use client";

import { motion } from "framer-motion";
import { MenuBackground } from "@/components/game/menu-background";

interface MenuScreenProps {
  onPlay: () => void;
}

export function MenuScreen({ onPlay }: MenuScreenProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <MenuBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rb-modal relative z-10 w-full max-w-xl rounded-2xl p-8"
      >
        <p className="rb-eyebrow">Menú principal</p>
        <h1 className="mt-2 text-4xl font-bold uppercase tracking-wide text-[var(--gold-bright)]">Ronda</h1>
        <p className="mt-3 text-[var(--cream-muted)]">
          Completa 3 grupos de propiedades antes que los bots.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={onPlay} className="rb-btn-primary px-4 py-3 text-lg">
            Jugar
          </button>
          <button
            type="button"
            disabled
            className="rb-btn-secondary cursor-not-allowed px-4 py-3 text-lg opacity-50"
          >
            Multiplayer (desactivado)
          </button>
        </div>
      </motion.div>
    </section>
  );
}
