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
        className="relative z-10 w-full max-w-xl rounded-2xl border border-foreground/15 bg-background/90 p-8"
      >
        <p className="text-sm uppercase tracking-wide opacity-70">Menú principal</p>
        <h1 className="mt-2 text-4xl font-bold">Monopoly Deal</h1>
        <p className="mt-3 opacity-85">
          Completa 3 grupos de propiedades antes que los bots.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-xl border border-foreground/20 px-4 py-3 text-left text-lg font-semibold transition hover:bg-foreground/10"
          >
            Jugar
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-foreground/10 px-4 py-3 text-left text-lg opacity-50"
          >
            Multiplayer (desactivado)
          </button>
        </div>
      </motion.div>
    </section>
  );
}
