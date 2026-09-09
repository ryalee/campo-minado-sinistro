"use client";

import React from 'react';
import { useMinesweeperStore } from '../store/useMinesweeperStore';
import { Cell } from './Cell';

export const Board: React.FC = () => {
  const { board, config } = useMinesweeperStore();

  return (
    <div className="overflow-auto p-4 bg-gray-200">
      <div
        className="grid gap-0 mx-auto w-max border-2 border-gray-500 shadow-md"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} cell={cell} />
          ))
        )}
      </div>
    </div>
  );
};