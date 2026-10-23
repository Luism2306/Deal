"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { getCardBackTexture } from "@/components/game/three/card-texture";
import type { SeatTransform } from "@/components/game/three/seats";

const BACK_WORLD_WIDTH = 0.92;
const BACK_WORLD_HEIGHT = 1.4;
const SEAT_TILT = 0.55;

interface OpponentFanProps {
  count: number;
  seat: SeatTransform;
  active: boolean;
}

export function OpponentFan({ count, seat, active }: OpponentFanProps) {
  const groupRef = useRef<Group>(null);
  const seed = useRef(Math.random() * Math.PI * 2);
  const texture = getCardBackTexture();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + seed.current;
    const sway = Math.sin(t * 0.6) * 0.03;
    groupRef.current.rotation.z = sway;
    groupRef.current.position.y = seat.position[1] + Math.sin(t * 0.8) * 0.05 + (active ? 0.08 : 0);
  });

  if (count <= 0) return null;

  const shown = Math.min(count, 7);
  const angleStep = Math.min(0.26, 1.7 / Math.max(shown, 1));

  return (
    <group position={seat.position} rotation={[SEAT_TILT, seat.rotationY, 0]}>
      <group ref={groupRef}>
        {Array.from({ length: shown }, (_, index) => {
          const offset = index - (shown - 1) / 2;
          const angle = offset * angleStep;
          const radius = 2.1;
          const x = Math.sin(angle) * radius;
          const y = (Math.cos(angle) - 1) * radius * 0.4;

          return (
            <mesh key={index} position={[x, y, index * 0.01]} rotation={[0, 0, angle]} scale={0.75}>
              <planeGeometry args={[BACK_WORLD_WIDTH, BACK_WORLD_HEIGHT]} />
              <meshBasicMaterial map={texture} transparent toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
