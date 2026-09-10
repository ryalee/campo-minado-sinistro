import { create } from "zustand";
import {
  Board,
  Difficulty,
  GameConfig,
  GameStatus,
  DIFFICULTY_CONFIGS,
} from "../types/minesweeper";
import {
  createEmptyBoard,
  populateMines,
  revealCell,
  toggleFlag,
  checkWinCondition,
} from "../utils/minesweeperLogic";

interface MinesweeperState {
  // estado do jogo
  difficulty: Difficulty;
  config: GameConfig;
  board: Board;
  gameStatus: GameStatus;
  isFirstClick: boolean;
  flagsPlacedCount: number;
  timerSeconds: number;
  triggeredMineCoordinate: { row: number; col: number } | null;

  // ações do usuário
  setDifficulty: (difficulty: Difficulty, customConfig?: GameConfig) => void;
  startNewGame: () => void;
  handleCellClick: (row: number, col: number) => void;
  handleCellRightClick: (
    row: number,
    col: number,
    event: React.MouseEvent
  ) => void;
  incrementTimer: () => void;
}

export const useMinesweeperStore = create<MinesweeperState>((set, get) => ({
  difficulty: "beginner",
  config: DIFFICULTY_CONFIGS.beginner,
  board: createEmptyBoard(
    DIFFICULTY_CONFIGS.beginner.rows,
    DIFFICULTY_CONFIGS.beginner.cols
  ),
  gameStatus: "idle",
  isFirstClick: true,
  flagsPlacedCount: 0,
  timerSeconds: 0,
  triggeredMineCoordinate: null,

  setDifficulty: (newDifficulty: Difficulty, customConfig?: GameConfig) => {
    // se for 'custom', usa as configurações personalizadas ou o padrão 9x9 com 10 minas
    const config: GameConfig =
      newDifficulty === "custom"
        ? customConfig || { rows: 9, cols: 9, mines: 10 }
        : DIFFICULTY_CONFIGS[newDifficulty];

    set({
      difficulty: newDifficulty,
      config,
      board: createEmptyBoard(config.rows, config.cols),
      gameStatus: "idle",
      isFirstClick: true,
      flagsPlacedCount: 0,
      timerSeconds: 0,
      triggeredMineCoordinate: null,
    });
  },

  startNewGame: () => {
    const { config } = get();
    set({
      board: createEmptyBoard(config.rows, config.cols),
      gameStatus: "idle",
      isFirstClick: true,
      flagsPlacedCount: 0,
      timerSeconds: 0,
      triggeredMineCoordinate: null,
    });
  },

  handleCellClick: (row: number, col: number) => {
    const { board, config, gameStatus, isFirstClick } = get();

    if (gameStatus === "won" || gameStatus === "lost") return;

    let currentBoard = board;

    // se for o primeiro clique, gera as minas garantindo zona segura
    if (isFirstClick) {
      currentBoard = populateMines(board, config, row, col);
      set({ isFirstClick: false, gameStatus: "playing" });
    }

    // executa a revelação com o algoritmo Flood Fill
    const { newBoard, hitMine } = revealCell(currentBoard, row, col);

    if (hitMine) {
      // revela todas as minas do mapa em caso de derrota
      const revealedBoardOnLoss = newBoard.map((r) =>
        r.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
      );

      set({
        board: revealedBoardOnLoss,
        gameStatus: "lost",
        triggeredMineCoordinate: { row, col },
      });
      return;
    }

    // verifica se venceu
    const hasWon = checkWinCondition(newBoard);

    if (hasWon) {
      set({ board: newBoard, gameStatus: "won" });
    } else {
      set({ board: newBoard });
    }
  },

  handleCellRightClick: (
    row: number,
    col: number,
    event: React.MouseEvent
  ) => {
    event.preventDefault(); // previne o menu de contexto do navegador

    const { board, gameStatus, flagsPlacedCount } = get();

    if (gameStatus === "won" || gameStatus === "lost") return;

    const targetCell = board[row][col];
    if (targetCell.isRevealed) return;

    const newBoard = toggleFlag(board, row, col);
    const flagAdjustment = targetCell.isFlagged ? -1 : 1;

    set({
      board: newBoard,
      flagsPlacedCount: flagsPlacedCount + flagAdjustment,
    });
  },

  incrementTimer: () => {
    const { gameStatus } = get();
    if (gameStatus === "playing") {
      set((state) => ({ timerSeconds: state.timerSeconds + 1 }));
    }
  },
}));