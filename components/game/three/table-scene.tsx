"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { HandFan } from "@/components/game/three/hand-scene";
import { OpponentFan } from "@/components/game/three/opponent-fan";
import { getFeltTexture } from "@/components/game/three/felt-texture";
import { getCardBackTexture } from "@/components/game/three/card-texture";
import { getOpponentSeatTransform, SEAT_RADIUS, TABLE_RADIUS } from "@/components/game/three/seats";
import type { Card, PlayerState } from "@/types/game";

const CAMERA_POSITION: [number, number, number] = [0, 7.8, 7.6];
const CAMERA_TARGET: [number, number, number] = [0, 0, 0.5];
const CAMERA_PITCH = Math.atan2(
  CAMERA_TARGET[1] - CAMERA_POSITION[1],
  -(CAMERA_TARGET[2] - CAMERA_POSITION[2]),
);
const HUMAN_SEAT_POSITION: [number, number, number] = [0, 0.02, SEAT_RADIUS];
const DECK_POSITION: [number, number, number] = [3.1, 0, 1.4];

function useResponsiveFov() {
  const [fov, setFov] = useState(42);

  useEffect(() => {
    const update = () => {
      setFov(window.innerHeight > window.innerWidth ? 58 : 42);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return fov;
}

function TableFelt() {
  const texture = useMemo(() => getFeltTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[TABLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

function TableRim() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <torusGeometry args={[TABLE_RADIUS, 0.18, 16, 64]} />
      <meshStandardMaterial color="#2b1b12" roughness={0.6} metalness={0.2} />
    </mesh>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
      <circleGeometry args={[TABLE_RADIUS * 2.2, 48]} />
      <meshStandardMaterial color="#05100d" roughness={1} />
    </mesh>
  );
}

function DeckStack({ count }: { count: number }) {
  const texture = useMemo(() => getCardBackTexture(), []);
  const shown = Math.min(count, 14);
  if (shown <= 0) return null;

  return (
    <group position={DECK_POSITION}>
      {Array.from({ length: shown }, (_, index) => (
        <mesh key={index} position={[0, 0.01 * index + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0.02 * index]}>
          <planeGeometry args={[0.92, 1.4]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function TurnRing({ target }: { target: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.x += (target[0] - meshRef.current.position.x) * 0.12;
    meshRef.current.position.z += (target[2] - meshRef.current.position.z) * 0.12;
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 2.4) * 0.15;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[target[0], 0.03, target[2]]}>
      <ringGeometry args={[1.05, 1.35, 48]} />
      <meshBasicMaterial color="#e8b04a" transparent opacity={0.55} toneMapped={false} />
    </mesh>
  );
}

interface TableSceneProps {
  humanHand: Card[];
  selectedCardId: string | null;
  isHumanTurn: boolean;
  exitingCardId: string | null;
  onSelectCard: (cardId: string) => void;
  otherPlayers: PlayerState[];
  activePlayerId: string;
  humanPlayerId: string;
  drawPileCount: number;
}

export function TableScene({
  humanHand,
  selectedCardId,
  isHumanTurn,
  exitingCardId,
  onSelectCard,
  otherPlayers,
  activePlayerId,
  humanPlayerId,
  drawPileCount,
}: TableSceneProps) {
  const fov = useResponsiveFov();
  const cameraGroupRef = useRef<Group>(null);

  const activeSeatPosition = useMemo<[number, number, number]>(() => {
    if (activePlayerId === humanPlayerId) return HUMAN_SEAT_POSITION;
    const opponentIndex = otherPlayers.findIndex((player) => player.id === activePlayerId);
    if (opponentIndex === -1) return HUMAN_SEAT_POSITION;
    return getOpponentSeatTransform(opponentIndex, otherPlayers.length).position;
  }, [activePlayerId, humanPlayerId, otherPlayers]);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#07100e"]} />
      <fog attach="fog" args={["#07100e", 16, 34]} />

      <hemisphereLight args={["#fff1dc", "#0b1a17", 0.9]} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={1.1}
        color="#ffe3b0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 6, 1]} intensity={0.6} color="#ffb84d" />

      <Floor />
      <TableFelt />
      <TableRim />
      <TurnRing target={activeSeatPosition} />
      <DeckStack count={drawPileCount} />

      {otherPlayers.map((player, index) => (
        <OpponentFan
          key={player.id}
          count={player.hand.length}
          seat={getOpponentSeatTransform(index, otherPlayers.length)}
          active={player.id === activePlayerId}
        />
      ))}

      <PerspectiveCamera
        makeDefault
        position={CAMERA_POSITION}
        rotation={[CAMERA_PITCH, 0, 0]}
        fov={fov}
      >
        <group ref={cameraGroupRef} position={[0, -0.7, -8.2]} rotation={[0.5, 0, 0]}>
          <HandFan
            cards={humanHand}
            selectedCardId={selectedCardId}
            disabled={!isHumanTurn}
            exitingCardId={exitingCardId}
            onSelect={onSelectCard}
          />
        </group>
      </PerspectiveCamera>
    </Canvas>
  );
}
