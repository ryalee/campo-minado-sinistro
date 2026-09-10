"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Cell as CellType } from "../types/minesweeper";
import { useMinesweeperStore } from "../store/useMinesweeperStore";
import Image from "next/image";
import { playBombSound } from "@/utils/audio";

interface CellProps {
  cell: CellType;
}

const NUMBER_COLOR_CLASSES: Record<number, string> = {
  1: "text-blue-600 font-bold",
  2: "text-green-600 font-bold",
  3: "text-red-600 font-bold",
  4: "text-purple-800 font-bold",
  5: "text-maroon-800 font-bold",
  6: "text-teal-600 font-bold",
  7: "text-black font-bold",
  8: "text-gray-600 font-bold",
};

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const {
    handleCellClick,
    handleCellRightClick,
    gameStatus,
    triggeredMineCoordinate,
  } = useMinesweeperStore();

  // animação para exibir as minas com um delay
  const calculateMineDelay = (): number => {
    if (gameStatus !== "lost" || !cell.isMine || !triggeredMineCoordinate) {
      return 0;
    }

    const rowDistance = Math.abs(cell.row - triggeredMineCoordinate.row);
    const colDistance = Math.abs(cell.col - triggeredMineCoordinate.col);
    const distance = Math.sqrt(rowDistance ** 2 + colDistance ** 2);

    return distance * 0.3;
  };

  const animationDelay = calculateMineDelay();

  // toca o barulho junto com o delay da animaçao da bomba
  useEffect(() => {
  if (gameStatus === "lost" && cell.isMine) {
    playBombSound(animationDelay);
  }
}, [gameStatus, cell.isMine, animationDelay]);

  const renderCellContent = () => {
    if (cell.isFlagged && !cell.isRevealed) {
      return "🚩";
    }

    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 0.8] }}
          transition={{
            duration: 1,
            delay: animationDelay,
            ease: "easeOut",
          }}
        >
          <Image src="/bomb.png" alt="mine" width={70} height={70} />
        </motion.span>
      );
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

  const getCellStyle = () => {
    if (cell.isRevealed) {
      return cell.isMine
        ? "bg-red-500 border-gray-400"
        : "bg-gray-100 border-gray-300 border";
    }
    return "bg-gray-300 hover:bg-gray-200 border-t-white border-l-white border-r-gray-500 border-b-gray-500 border-2 active:border-gray-400";
  };

  return (
    <motion.button
      onClick={() => handleCellClick(cell.row, cell.col)}
      onContextMenu={(event) => handleCellRightClick(cell.row, cell.col, event)}
      className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-sm md:text-base font-bold select-none transition-colors ${getCellStyle()}`}
      initial={
        cell.isMine && gameStatus === "lost"
          ? { scale: 0.8, opacity: 0 }
          : false
      }
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: animationDelay,
      }}
    >
      {renderCellContent()}
    </motion.button>
  );
};
