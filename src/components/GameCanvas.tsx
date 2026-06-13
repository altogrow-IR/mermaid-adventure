import { usePhaserGame } from '../hooks/usePhaserGame';

export function GameCanvas() {
  const gameRef = usePhaserGame();

  return <div ref={gameRef} className="game-wrap" />;
}
