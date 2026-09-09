"use client";

import React, { useEffect } from 'react';
import { useMinesweeperStore } from '../store/useMinesweeperStore';

export const Header: React.FC = () => {
  const { 
    config, 
    flagsPlacedCount, 
    timerSeconds, 
    gameStatus, 
    startNewGame, 
    incrementTimer 
  } = useMinesweeperStore();

  // efeito pra rodar o cronômetro enquanto o jogo tá ativo
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (gameStatus === 'playing') {
      intervalId = setInterval(() => {
        incrementTimer();
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameStatus, incrementTimer]);

  // calcula minas restantes (minas totais - bandeiras colocadas)
  const remainingMines = config.mines - flagsPlacedCount;

  const getStatusEmoji = () => {
    switch (gameStatus) {
      case 'won':
        return '😎';
      case 'lost':
        return '😵';
      default:
        return '🙂';
    }
  };

  // formata números para exibir sempre no formato digital de 3 dígitos (ex: 007)
  const formatNumber = (num: number): string => {
    const clampedNum = Math.max(-99, Math.min(999, num));
    return clampedNum.toString().padStart(3, '0');
  };

  return (
    <div className="flex items-center justify-between bg-gray-200 p-4 border-b-2 border-gray-400 select-none">
      {/* contador de minas */}
      <div className="bg-black text-red-500 font-mono text-2xl px-3 py-1 rounded tracking-widest border border-gray-600">
        {formatNumber(remainingMines)}
      </div>

      {/* botão de restart */}
      <button
        onClick={startNewGame}
        className="text-3xl p-2 bg-gray-100 hover:bg-gray-300 active:scale-95 border-2 border-gray-400 rounded transition-transform"
        title="Novo Jogo"
      >
        {getStatusEmoji()}
      </button>

      {/* cronômetro */}
      <div className="bg-black text-red-500 font-mono text-2xl px-3 py-1 rounded tracking-widest border border-gray-600">
        {formatNumber(timerSeconds)}
      </div>
    </div>
  );
};