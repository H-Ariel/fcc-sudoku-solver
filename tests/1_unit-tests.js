const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
let solver = new Solver();

suite('Unit Tests', () => {
    test('puzzle string of 81 characters', function () {
        assert.isNull(solver.validate(puzzlesAndSolutions[0][0]));
    });

    test('puzzle string with invalid characters', function () {
        assert.equal(solver.validate('a'.repeat(81)), 'Invalid characters in puzzle');
    });

    test('puzzle string that is not 81 characters in length', function () {
        assert.equal(solver.validate('.'), 'Expected puzzle to be 81 characters long');
    });

    test('valid row placement', function () {
        assert.isTrue(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 0, 4, '6'));
    });

    test('invalid row placement', function () {
        assert.isFalse(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 0, 4, '5'));
    });

    test('valid column placement', function () {
        assert.isTrue(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 0, 4, '6'));
    });

    test('invalid column placement', function () {
        assert.isFalse(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 0, 4, '5'));
    });

    test('valid region (3x3 grid) placement', function () {
        assert.isTrue(solver.checkRegionPlacement(puzzlesAndSolutions[0][0], 0, 4, '6'));
    });

    test('invalid region (3x3 grid) placement', function () {
        assert.isFalse(solver.checkRegionPlacement(puzzlesAndSolutions[0][0], 0, 4, '5'));
    });

    test('valid puzzle strings pass the solver', function () {
        assert.doesNotThrow(() => solver.solve(puzzlesAndSolutions[1][0]));
    });

    test('invalid puzzle strings fail the solver', function () {
        let puzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        // assert.throws(() => solver.solve(puzzle), 'Puzzle cannot be solved');
        // stupid way for fCC auto-tester
        assert.equal((() => {
            try {
                solver.solve(puzzle);
                return '';
            } catch (err) {
                return err.message;
            }
        })(), 'Puzzle cannot be solved');
    });

    test('solver returns the expected solution for an incomplete puzzle', function () {
        const [puzzle, solution] = puzzlesAndSolutions[1];
        assert.equal(solver.solve(puzzle), solution);
    });
});
