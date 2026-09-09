"use client";

import React from 'react';
import { Cell as CellType } from '../types/minesweeper';
import { useMinesweeperStore } from '../store/useMinesweeperStore';

interface CellProps {
  cell: CellType;
}

const NUMBER_COLOR_CLASSES: Record<number, string> = {
  1: 'text-blue-600 font-bold',
  2: 'text-green-600 font-bold',
  3: 'text-red-600 font-bold',
  4: 'text-purple-800 font-bold',
  5: 'text-maroon-800 font-bold',
  6: 'text-teal-600 font-bold',
  7: 'text-black font-bold',
  8: 'text-gray-600 font-bold',
};

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const { handleCellClick, handleCellRightClick } = useMinesweeperStore();

  const renderCellContent = () => {
    if (cell.isFlagged && !cell.isRevealed) {
      return '🚩';
    }

    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return '💣';
    }

    if (cell.neighborMines > 0) {
      return (
        <span className={NUMBER_COLOR_CLASSES[cell.neighborMines]}>
          {cell.neighborMines}
        </span>
      );
    }

    return null;
  };

  // define a aparencia da célula baseada no seu estado
  const getCellStyle = () => {
    if (cell.isRevealed) {
      return cell.isMine
        ? 'bg-red-500 border-gray-400'
        : 'bg-gray-100 border-gray-300';
    }
    return 'bg-gray-300 hover:bg-gray-200 border-t-white border-l-white border-r-gray-500 border-b-gray-500 border-2 active:border-gray-400';
  };

  return (
    <button
      onClick={() => handleCellClick(cell.row, cell.col)}
      onContextMenu={(event) => handleCellRightClick(cell.row, cell.col, event)}
      className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-sm md:text-base font-bold select-none transition-colors ${getCellStyle()}`}
    >
      {renderCellContent()}
    </button>
  );
};