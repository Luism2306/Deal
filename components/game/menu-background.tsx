"use client";

import { motion } from "framer-motion";

export function MenuBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#16413a_0%,#0a201c_45%,#07100e_80%)]">
      <motion.div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-[var(--gold)]/20"
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-16 -right-16 h-96 w-96 rounded-full border border-[var(--gold)]/15"
        animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--gold)]/15"
        animate={{ rotate: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
      />
    </div>
  );
}
