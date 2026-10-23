"use client";

import { useEffect, useState } from "react";
import { DifficultyScreen } from "@/components/game/difficulty-screen";
import { GameScreen } from "@/components/game/game-screen";
import { MenuScreen } from "@/components/game/menu-screen";
import { PlayerSetupScreen } from "@/components/game/player-setup-screen";
import {
  autoPayPendingDebt,
  createInitialGameState,
  endTurn,
  moveWildProperty,
  passTurn,
  payPendingDebt,
  playActionCard,
  playCardToBank,
  playCardToProperties,
  runBotTurn,
} from "@/lib/game/engine";
import type { Difficulty, GameState } from "@/types/game";

type ScreenState = "menu" | "difficulty" | "setup" | "game";

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    if (!game) {
      return;
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (!currentPlayer.isBot) {
      return;
    }

    const timer = window.setTimeout(() => {
      setGame((previous) => (previous ? runBotTurn(previous) : previous));
    }, 700);

    return () => window.clearTimeout(timer);
  }, [game]);

  const resetToMenu = () => {
    setScreen("menu");
    setGame(null);
  };

  const startGame = () => {
    const initialState = createInitialGameState(totalPlayers, difficulty);
    setGame(initialState);
    setScreen("game");
  };

  if (screen === "menu") {
    return <MenuScreen onPlay={() => setScreen("difficulty")} />;
  }

  if (screen === "difficulty") {
    return (
      <DifficultyScreen
        onBack={() => setScreen("menu")}
        onSelect={(selectedDifficulty) => {
          setDifficulty(selectedDifficulty);
          setScreen("setup");
        }}
      />
    );
  }

  if (screen === "setup") {
    return (
      <PlayerSetupScreen
        difficulty={difficulty}
        totalPlayers={totalPlayers}
        onChangePlayers={setTotalPlayers}
        onBack={() => setScreen("difficulty")}
        onStart={startGame}
      />
    );
  }

  if (!game) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <GameScreen
        game={game}
        onPlayToBank={(cardId) =>
          setGame((previous) =>
            previous ? playCardToBank(previous, cardId) : previous,
          )
        }
        onPlayToProperties={(cardId, assignedColor) =>
          setGame((previous) =>
            previous
              ? playCardToProperties(previous, cardId, assignedColor)
              : previous,
          )
        }
        onPlayAction={(cardId, options) =>
          setGame((previous) =>
            previous ? playActionCard(previous, cardId, options) : previous,
          )
        }
        onMoveWild={(propertyId, assignedColor) =>
          setGame((previous) =>
            previous
              ? moveWildProperty(previous, propertyId, assignedColor)
              : previous,
          )
        }
        onPayDebt={(bankIds, propertyIds) =>
          setGame((previous) =>
            previous
              ? payPendingDebt(previous, bankIds, propertyIds)
              : previous,
          )
        }
        onAutoPayDebt={() =>
          setGame((previous) =>
            previous ? autoPayPendingDebt(previous) : previous,
          )
        }
        onPassTurn={() =>
          setGame((previous) => (previous ? passTurn(previous) : previous))
        }
        onEndTurn={() =>
          setGame((previous) => (previous ? endTurn(previous) : previous))
        }
        onReset={resetToMenu}
      />
    </main>
  );
}
