import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Card, PlacedProperty } from "@/types/game";

type CardData = Card | PlacedProperty;

const TEXTURE_WIDTH = 272;
const TEXTURE_HEIGHT = 416;

const FONT_FAMILY = '"Bricolage Grotesque", system-ui, sans-serif';

const CREAM = "#f6f1e6";
const INK = "#1c1410";
const INK_MUTED = "#5b4636";
const GOLD = "#e8b04a";
const GOLD_BRIGHT = "#ffd27a";
const CHARCOAL = "#121418";

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

const COLOR_HEX: Record<string, string> = {
  marron: "#b45309",
  "azul-claro": "#38bdf8",
  rosa: "#f472b6",
  naranja: "#f97316",
  rojo: "#ef4444",
  amarillo: "#facc15",
  verde: "#22c55e",
  "azul-oscuro": "#1d4ed8",
  ferrocarril: "#18181b",
  servicio: "#14b8a6",
};
const DEFAULT_COLOR_HEX = "#8b5cf6";
const BACK_DOT_COLORS = ["rojo", "amarillo", "verde", "azul-claro"];

function getPrimaryColor(card: CardData): string | undefined {
  if (card.kind === "wild" && "assignedColor" in card && card.assignedColor) {
    return card.assignedColor;
  }
  return card.colors?.[0];
}

function rentBySetSize(size: number): number[] {
  if (size === 2) return [2, 4];
  if (size === 4) return [1, 2, 3, 4];
  return [2, 4, 6];
}

function typeLabel(card: CardData): string {
  switch (card.kind) {
    case "property":
      return "Propiedad";
    case "wild":
      return "Comodín";
    case "action":
      return "Acción";
    case "rent":
      return "Alquiler";
    case "money":
      return "Dinero";
    default:
      return "Carta";
  }
}

function ensureFontsReady(callback: () => void) {
  if (typeof document === "undefined" || !document.fonts) return;
  document.fonts.load(`800 24px ${FONT_FAMILY}`).catch(() => {});
  document.fonts.ready.then(callback).catch(() => {});
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let lineCount = 0;
  let cursorY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[i];
      cursorY += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        const rest = words.slice(i + 1).join(" ");
        const remaining = rest ? `${line} ${rest}` : line;
        ctx.fillText(
          ctx.measureText(remaining).width > maxWidth ? `${remaining.slice(0, 40)}…` : remaining,
          x,
          cursorY,
        );
        return cursorY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, cursorY);
  return cursorY + lineHeight;
}

function drawCardFace(ctx: CanvasRenderingContext2D, card: CardData, selected: boolean) {
  const w = TEXTURE_WIDTH;
  const h = TEXTURE_HEIGHT;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(4, 4, w - 8, h - 8, 20);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.lineWidth = selected ? 9 : 4;
  ctx.strokeStyle = selected ? GOLD_BRIGHT : "rgba(28,20,16,0.6)";
  ctx.stroke();
  ctx.clip();

  const primaryColor = getPrimaryColor(card);
  const hex = COLOR_HEX[primaryColor ?? ""] ?? DEFAULT_COLOR_HEX;
  const setSize = GROUP_SIZE_BY_COLOR[primaryColor ?? ""] ?? 3;
  const rentValues = rentBySetSize(setSize);

  if (card.kind === "property") {
    ctx.fillStyle = hex;
    ctx.fillRect(4, 4, w - 8, 72);

    ctx.fillStyle = INK;
    ctx.font = `800 24px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    wrapText(ctx, card.name.toUpperCase(), w / 2, 36, w - 48, 26, 2);

    ctx.beginPath();
    ctx.arc(34, 96, 26, 0, Math.PI * 2);
    ctx.fillStyle = CREAM;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `800 16px ${FONT_FAMILY}`;
    ctx.fillText(`${card.value}M`, 34, 101);

    ctx.textAlign = "left";
    ctx.font = `700 14px ${FONT_FAMILY}`;
    ctx.fillStyle = INK;
    ctx.fillText("PROPIEDADES EN EL GRUPO", 24, 152);
    ctx.textAlign = "right";
    ctx.fillText("RENTA", w - 24, 152);

    let y = 190;
    rentValues.forEach((rent, index) => {
      ctx.textAlign = "left";
      ctx.font = `700 14px ${FONT_FAMILY}`;
      ctx.fillStyle = "#92661b";
      ctx.fillText(`${index + 1}`, 28, y);
      ctx.textAlign = "right";
      ctx.font = `800 15px ${FONT_FAMILY}`;
      ctx.fillStyle = INK;
      ctx.fillText(`${rent}M`, w - 24, y);
      y += 34;
    });
  } else {
    ctx.fillStyle = INK;
    ctx.font = `800 15px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText(card.kind === "wild" ? "COMODÍN" : `${card.value}M`, 24, 38);
    ctx.textAlign = "right";
    ctx.font = `700 12px ${FONT_FAMILY}`;
    ctx.fillStyle = INK_MUTED;
    ctx.fillText(typeLabel(card).toUpperCase(), w - 24, 38);

    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(24, 54, w - 48, 10, 5);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = `800 21px ${FONT_FAMILY}`;
    let cursorY = wrapText(ctx, card.name.toUpperCase(), w / 2, 102, w - 48, 26, 2);

    if (card.kind === "wild") {
      cursorY += 10;
      ctx.beginPath();
      ctx.roundRect(24, cursorY, w - 48, 22 + rentValues.length * 26, 10);
      ctx.strokeStyle = "rgba(28,20,16,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.font = `700 12px ${FONT_FAMILY}`;
      ctx.fillStyle = INK;
      ctx.fillText("VALOR POR PROPIEDADES", 36, cursorY + 22);
      let ry = cursorY + 48;
      rentValues.forEach((rent, index) => {
        ctx.textAlign = "left";
        ctx.font = `600 12px ${FONT_FAMILY}`;
        ctx.fillStyle = INK_MUTED;
        ctx.fillText(`${index + 1} carta(s)`, 36, ry);
        ctx.textAlign = "right";
        ctx.font = `800 13px ${FONT_FAMILY}`;
        ctx.fillStyle = INK;
        ctx.fillText(`${rent}M`, w - 36, ry);
        ry += 26;
      });
      cursorY = ry + 10;
    } else {
      cursorY += 16;
    }

    ctx.fillStyle = INK_MUTED;
    ctx.font = `500 13px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    wrapText(ctx, card.description, 24, cursorY, w - 48, 18, 8);
  }

  ctx.restore();
}

function drawCardBack(ctx: CanvasRenderingContext2D) {
  const w = TEXTURE_WIDTH;
  const h = TEXTURE_HEIGHT;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(4, 4, w - 8, h - 8, 20);
  ctx.fillStyle = CHARCOAL;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = CREAM;
  ctx.stroke();
  ctx.clip();

  ctx.strokeStyle = "rgba(232,176,74,0.14)";
  ctx.lineWidth = 2;
  for (let i = -h; i < w + h; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(232,176,74,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, h - 32, 14);
  ctx.stroke();

  const centerX = w / 2;
  const centerY = h / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 78, 32, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(7,16,14,0.6)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = GOLD;
  ctx.stroke();

  ctx.fillStyle = GOLD_BRIGHT;
  ctx.font = `800 26px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "2px";
  ctx.fillText("RONDA", centerX, centerY - 1);
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "0px";

  const dotRadius = 7;
  const dotGap = 22;
  const dotsY = centerY + 54;
  const startX = centerX - ((BACK_DOT_COLORS.length - 1) * dotGap) / 2;
  BACK_DOT_COLORS.forEach((color, index) => {
    ctx.beginPath();
    ctx.arc(startX + index * dotGap, dotsY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_HEX[color] ?? DEFAULT_COLOR_HEX;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(244,236,216,0.5)";
    ctx.stroke();
  });

  ctx.restore();
}

export function useCardFaceTexture(card: CardData, selected: boolean): THREE.CanvasTexture {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_WIDTH;
    canvas.height = TEXTURE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx) drawCardFace(ctx, card, selected);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id, card.name, card.description, card.value, card.kind, JSON.stringify(card.colors), selected]);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    ensureFontsReady(() => {
      if (!ctx) return;
      drawCardFace(ctx, card, selected);
      texture.needsUpdate = true;
    });
    return () => texture.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  return texture;
}

let sharedBackTexture: THREE.CanvasTexture | null = null;

export function getCardBackTexture(): THREE.CanvasTexture {
  if (sharedBackTexture) return sharedBackTexture;
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx) drawCardBack(ctx);
  sharedBackTexture = new THREE.CanvasTexture(canvas);
  sharedBackTexture.colorSpace = THREE.SRGBColorSpace;

  ensureFontsReady(() => {
    if (!ctx || !sharedBackTexture) return;
    drawCardBack(ctx);
    sharedBackTexture.needsUpdate = true;
  });

  return sharedBackTexture;
}
