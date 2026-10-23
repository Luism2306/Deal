"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useSpring } from "@react-spring/three";
import type { Group, MeshBasicMaterial } from "three";
import { useCardFaceTexture } from "@/components/game/three/card-texture";
import type { Card } from "@/types/game";

export const CARD_WORLD_WIDTH = 1.56;
export const CARD_WORLD_HEIGHT = 2.38;

export interface FanTransform {
  x: number;
  y: number;
  z: number;
  rotZ: number;
}

export function getFanTransform(index: number, total: number): FanTransform {
  const angleStep = Math.min(0.17, 1.3 / Math.max(total, 1));
  const offset = index - (total - 1) / 2;
  const angle = offset * angleStep;
  const radius = 5.4;

  return {
    x: Math.sin(angle) * radius,
    y: (Math.cos(angle) - 1) * radius * 0.5,
    z: index * 0.01,
    rotZ: -angle,
  };
}

interface HandCardProps {
  card: Card;
  index: number;
  total: number;
  selected: boolean;
  disabled: boolean;
  isExiting: boolean;
  isEntering: boolean;
  onSelect: (cardId: string) => void;
}

export function HandCard({
  card,
  index,
  total,
  selected,
  disabled,
  isExiting,
  isEntering,
  onSelect,
}: HandCardProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !disabled);
  const texture = useCardFaceTexture(card, selected);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const groupRef = useRef<Group>(null);
  const fan = getFanTransform(index, total);

  const lift = isExiting ? 0 : selected ? 0.75 : hovered && !disabled ? 0.42 : 0;
  const forward = isExiting ? 0 : selected ? 0.85 : hovered && !disabled ? 0.55 : 0;

  const targetPosition: [number, number, number] = isExiting
    ? [fan.x, fan.y + 3.4, fan.z + 2.6]
    : [fan.x, fan.y + lift, fan.z + forward];
  const targetRotation: [number, number, number] = isExiting
    ? [0.5, 0, fan.rotZ + (fan.x >= 0 ? 0.7 : -0.7)]
    : [0, 0, fan.rotZ];
  const targetScale = isExiting ? 0.35 : selected ? 1.08 : hovered && !disabled ? 1.05 : 1;
  const targetOpacity = isExiting ? 0 : disabled ? 0.55 : 1;

  const spring = useSpring({
    from: isEntering
      ? {
          x: fan.x,
          y: fan.y - 4.5,
          z: fan.z - 2.2,
          rx: 0,
          ry: 0,
          rz: fan.rotZ,
          s: 0.35,
          op: 1,
        }
      : undefined,
    x: targetPosition[0],
    y: targetPosition[1],
    z: targetPosition[2],
    rx: targetRotation[0],
    ry: targetRotation[1],
    rz: targetRotation[2],
    s: targetScale,
    op: targetOpacity,
    config: isExiting ? { tension: 210, friction: 24 } : { tension: 300, friction: 26 },
  });

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(spring.x.get(), spring.y.get(), spring.z.get());
      groupRef.current.rotation.set(spring.rx.get(), spring.ry.get(), spring.rz.get());
      groupRef.current.scale.setScalar(spring.s.get());
    }
    if (materialRef.current) {
      materialRef.current.opacity = spring.op.get();
    }
  });

  const glowRef = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    if (glowRef.current) {
      glowRef.current.opacity = (selected ? 0.55 : hovered && !disabled ? 0.3 : 0) * spring.op.get();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.03]} scale={[1.08, 1.08, 1]}>
        <planeGeometry args={[CARD_WORLD_WIDTH, CARD_WORLD_HEIGHT]} />
        <meshBasicMaterial
          ref={glowRef}
          color="#ffd27a"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.02, -0.015]}>
        <planeGeometry args={[CARD_WORLD_WIDTH, CARD_WORLD_HEIGHT]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          if (!disabled) setHovered(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) onSelect(card.id);
        }}
      >
        <planeGeometry args={[CARD_WORLD_WIDTH, CARD_WORLD_HEIGHT]} />
        <meshBasicMaterial ref={materialRef} map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
