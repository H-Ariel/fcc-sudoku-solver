'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      let { puzzle, coordinate, value } = req.body;

      if (puzzle == undefined || coordinate == undefined || value == undefined)
        return res.json({ error: 'Required field(s) missing' });

      let error = solver.validate(puzzle);
      if (error)
        return res.json({ error });

      let row = coordinate.charCodeAt(0) - 'A'.charCodeAt(0);
      let col = parseInt(coordinate[1]) - 1;

      if (coordinate.length != 2 || row < 0 || 8 < row || col < 0 || 8 < col)
        return res.json({ error: 'Invalid coordinate' });

      if (isNaN(value) || value < 1 || 9 < value)
        return res.json({ error: 'Invalid value' });

      let validRow = solver.checkRowPlacement(puzzle, row, col, value),
        validCol = solver.checkColPlacement(puzzle, row, col, value),
        validReg = solver.checkRegionPlacement(puzzle, row, col, value);
      let valid = validRow && validCol && validReg;
      let conflict = [];
      if (!validRow) conflict.push('row');
      if (!validCol) conflict.push('column');
      if (!validReg) conflict.push('region');

      res.json({ valid, conflict });
    });

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      if (puzzle == undefined)
        return res.json({ error: 'Required field missing' });

      try {
        let solution = solver.solve(puzzle);
        res.json({ solution });
      } catch (error) {
        res.json({ error: error.message });
      }
    });
};
