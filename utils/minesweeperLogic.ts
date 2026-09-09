import { Board, Cell, GameConfig } from "../types/minesweeper";

// cria o tabuleiro vazio, sem minas posicionadas
export function createEmptyBoard(totalRows: number, totalCols: number): Board {
  const board: Board = [];

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const currentRow: Cell[] = [];

    for (let colIndex = 0; colIndex < totalCols; colIndex++) {
      currentRow.push({
        row: rowIndex,
        col: colIndex,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }

    board.push(currentRow);
  }

  return board;
}

// retorna as minas vizinhas válidas (max 8 celulas) ao redor de uma célula específica
export function getNeighbors(
  board: Board,
  targetRow: number,
  targetCol: number,
): Cell[] {
  const neighbors: Cell[] = [];
  const maxRows = board.length;
  const maxCols = board[0].length;

  // percorre as variações verticais (-1: cima, 0: centro, 1: baixo)
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    // percorre as horizontais (-1: esquerda, 0: centro, 1: direita)
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      // ignora a própria célula central
      if (rowOffset === 0 && colOffset === 0) continue;

      const neighborRow = targetRow + rowOffset;
      const neighborCol = targetCol + colOffset;

      // verifica se a célula vizinha tá dentro dos limites do tabuleiro
      const isWithinVerticalBounds = neighborRow >= 0 && neighborRow < maxRows;
      const isWithinHorizontalBounds =
        neighborCol >= 0 && neighborCol < maxCols;

      if (isWithinVerticalBounds && isWithinHorizontalBounds) {
        neighbors.push(board[neighborRow][neighborCol]);
      }
    }
  }

  return neighbors;
}

// Posiciona as minas no tabuleiro depois do PRIMEIRO clique e garante que a célula clicada (e seus vizinhos) não recebam minas (first-click safety)
export function populateMines(
  board: Board,
  config: GameConfig,
  firstClickRow: number,
  firstClickCol: number,
): Board {
  // cria uma cópia imutavel do tabuleiro
  const newBoard: Board = board.map((row) => row.map((cell) => ({ ...cell })));
  const { rows: totalRows, cols: totalCols, mines: totalMines } = config;

  // zona segura ao redor do primeiro clique
  const safeZoneCoordinates = new Set<string>();

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      const safeRow = firstClickRow + rowOffset;
      const safeCol = firstClickCol + colOffset;

      const isValidRow = safeRow >= 0 && safeRow < totalRows;
      const isValidCol = safeCol >= 0 && safeCol < totalCols;

      if (isValidRow && isValidCol) {
        safeZoneCoordinates.add(`${safeRow},${safeCol}`);
      }
    }
  }

  let minesPlaced = 0;

  while (minesPlaced < totalMines) {
    const randomRow = Math.floor(Math.random() * totalRows);
    const randomCol = Math.floor(Math.random() * totalCols);
    const coordinateKey = `${randomRow},${randomCol}`;

    const isCellInSafeZone = safeZoneCoordinates.has(coordinateKey);
    const cellAlreadyHasMine = newBoard[randomRow][randomCol].isMine;

    if (!isCellInSafeZone && !cellAlreadyHasMine) {
      newBoard[randomRow][randomCol].isMine = true;
      minesPlaced++;
    }
  }

  // calcula a quantidade de minas vizinhas para cada celula
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    for (let colIndex = 0; colIndex < totalCols; colIndex++) {
      if (!newBoard[rowIndex][colIndex].isMine) {
        const neighborCells = getNeighbors(newBoard, rowIndex, colIndex);
        const mineCount = neighborCells.filter(
          (neighbor) => neighbor.isMine,
        ).length;

        newBoard[rowIndex][colIndex].neighborMines = mineCount;
      }
    }
  }

  return newBoard;
}

// Flood Fill (BFS) para revelar células vazias adjacentes
export function revealCell(
  board: Board,
  startRow: number,
  startCol: number,
): { newBoard: Board; hitMine: boolean } {
  const newBoard: Board = board.map((row) => row.map((cell) => ({ ...cell })));
  const targetCell = newBoard[startRow][startCol];

  if (targetCell.isRevealed || targetCell.isFlagged) {
    return { newBoard, hitMine: false };
  }

  if (targetCell.isMine) {
    targetCell.isRevealed = true;
    return { newBoard, hitMine: true };
  }

  // fila de coordenadas [linha, coluna] para busca em largura (BFS)
  const cellsToProcessQueue: [number, number][] = [[startRow, startCol]];

  while (cellsToProcessQueue.length > 0) {
    const [currentRow, currentCol] = cellsToProcessQueue.shift()!;
    const currentCell = newBoard[currentRow][currentCol];

    if (currentCell.isRevealed || currentCell.isFlagged) continue;

    currentCell.isRevealed = true;

    // se a célula ta sem minas ao redor adiciona os vizinhos à fila
    if (currentCell.neighborMines === 0) {
      const neighborCells = getNeighbors(newBoard, currentRow, currentCol);

      for (const neighbor of neighborCells) {
        if (!neighbor.isRevealed && !neighbor.isFlagged) {
          cellsToProcessQueue.push([neighbor.row, neighbor.col]);
        }
      }
    }
  }

  return { newBoard, hitMine: false };
}

// Alterna a bandeira em uma célula não revelada
export function toggleFlag(
  board: Board,
  targetRow: number,
  targetCol: number,
): Board {
  const newBoard: Board = board.map((row) => row.map((cell) => ({ ...cell })));
  const targetCell = newBoard[targetRow][targetCol];

  if (!targetCell.isRevealed) {
    targetCell.isFlagged = !targetCell.isFlagged;
  }

  return newBoard;
}

// verifica se o jogador venceu (se todas as células sem mina foram reveladas)
export function checkWinCondition(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}
