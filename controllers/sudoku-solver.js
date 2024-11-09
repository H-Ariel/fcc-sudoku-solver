const VALID_CHARS = '123456789.';
const REGION_SIZE = 3;
const BOARD_SIZE = REGION_SIZE * 3;
const BOARD_TOTAL_LENGTH = BOARD_SIZE * BOARD_SIZE;

class SudokuSolver {

  // validate board and return error message if invalid
  validate(puzzleString) {
    if (puzzleString.length != BOARD_TOTAL_LENGTH)
      return `Expected puzzle to be ${BOARD_TOTAL_LENGTH} characters long`;
    for (let i of puzzleString) {
      if (!VALID_CHARS.includes(i))
        return 'Invalid characters in puzzle';
    }
    return null;
  }

  // for all next methods: row/col indices are [0-8], input assumed valid.

  checkRowPlacement(puzzleString, row, column, value) {
    const board = puzzleString.match(/.{1,9}/g);

    for (let i = 0; i < BOARD_SIZE; i++) {
      if (i != column && board[row][i] == value)
        return false;
    }

    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const board = puzzleString.match(/.{1,9}/g);

    for (let i = 0; i < BOARD_SIZE; i++) {
      if (i != row && board[i][column] == value)
        return false;
    }

    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const board = puzzleString.match(/.{1,9}/g);
    const regions = Array(BOARD_SIZE).fill('').map(() => []);

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        let regionIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
        regions[regionIndex].push(board[i][j]);
      }
    }

    let regionIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3);
    let cellIndex = Math.floor(row % 3) * 3 + Math.floor(column % 3);
    regions[regionIndex][cellIndex] = String(value);
    return regions[regionIndex].filter(x => x == value).length == 1;
  }

  check(puzzleString, row, column, value) {
    return (this.checkRowPlacement(puzzleString, row, column, value)
      && this.checkColPlacement(puzzleString, row, column, value)
      && this.checkRegionPlacement(puzzleString, row, column, value)
    );
  }

  solve(puzzleString) {
    const error = this.validate(puzzleString);
    if (error)
      throw new Error(error);

    const board = puzzleString.match(/.{1,9}/g).map(row => row.split(''));

    const isSafe = (row, col, value) => {
      const boardString = board.map(row => row.join('')).join('');
      return this.check(boardString, row, col, value);
    };

    const solveBoard = () => {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (board[row][col] === '.') {
            for (let value = '1'; value <= '9'; value++) {
              if (isSafe(row, col, value)) {
                board[row][col] = value;
                if (solveBoard())
                  return true;
                board[row][col] = '.';
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    if (solveBoard())
      return board.map(row => row.join('')).join('');
    throw new Error('Puzzle cannot be solved');
  }
}

module.exports = SudokuSolver;