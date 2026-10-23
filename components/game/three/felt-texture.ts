import * as THREE from "three";

const TEXTURE_SIZE = 1024;

let sharedFeltTexture: THREE.CanvasTexture | null = null;

function drawFelt(ctx: CanvasRenderingContext2D) {
  const size = TEXTURE_SIZE;
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, size * 0.05, center, center, size * 0.5);
  gradient.addColorStop(0, "#22594c");
  gradient.addColorStop(0.55, "#16413a");
  gradient.addColorStop(1, "#0a201c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  let seed = 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 9000; i++) {
    const x = random() * size;
    const y = random() * size;
    const alpha = random() * 0.05;
    ctx.fillStyle = `rgba(${random() > 0.5 ? "255,255,255" : "0,0,0"},${alpha})`;
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  ctx.strokeStyle = "rgba(232,176,74,0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, size * 0.3, 0, Math.PI * 2);
  ctx.stroke();
}

export function getFeltTexture(): THREE.CanvasTexture {
  if (sharedFeltTexture) return sharedFeltTexture;
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx) drawFelt(ctx);
  sharedFeltTexture = new THREE.CanvasTexture(canvas);
  sharedFeltTexture.colorSpace = THREE.SRGBColorSpace;
  sharedFeltTexture.anisotropy = 4;
  return sharedFeltTexture;
}
