export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTY_CONFIGS: Record<Exclude<Difficulty, 'custom'>, GameConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number; // quantidade de minas ao redor (0 a 8)
}

export type Board = Cell[][];