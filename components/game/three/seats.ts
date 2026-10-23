export const TABLE_RADIUS = 7.6;
export const SEAT_RADIUS = 5.0;

const SEAT_ANGLES_DEG: Record<number, number[]> = {
  1: [0],
  2: [-45, 45],
  3: [-65, 0, 65],
  4: [-80, -27, 27, 80],
};

export interface SeatTransform {
  position: [number, number, number];
  rotationY: number;
}

export function getOpponentSeatAngleDeg(index: number, total: number): number {
  const angles = SEAT_ANGLES_DEG[Math.max(1, Math.min(total, 4))] ?? SEAT_ANGLES_DEG[4];
  return angles[Math.min(index, angles.length - 1)] ?? 0;
}

export function getOpponentSeatTransform(index: number, total: number): SeatTransform {
  const angleDeg = getOpponentSeatAngleDeg(index, total);
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    position: [Math.sin(angleRad) * SEAT_RADIUS, 0.02, -Math.cos(angleRad) * SEAT_RADIUS],
    rotationY: -angleRad,
  };
}
