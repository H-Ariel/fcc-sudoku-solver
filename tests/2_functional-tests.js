const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const e = require('express');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    test('Solve a puzzle with valid puzzle string', (done) => {
       const [puzzle, solution] = puzzlesAndSolutions[1];
       chai.request(server)
            .post('/api/solve')
            .set('content-type', 'application/json')
            .send({ puzzle })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.solution, solution);
                done();
            });
    });

    test('Solve a puzzle with missing puzzle string', (done) => {
        chai.request(server)
            .post('/api/solve')
            .set('content-type', 'application/json')
            .send({})
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Required field missing');
                done();
            });
    });

    test('Solve a puzzle with invalid characters', (done) => {
        chai.request(server)
            .post('/api/solve')
            .set('content-type', 'application/json')
            .send({ puzzle: 'a'.repeat(81) })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Invalid characters in puzzle');
                done();
            });
    });

    test('Solve a puzzle with incorrect length', (done) => {
        chai.request(server)
            .post('/api/solve')
            .set('content-type', 'application/json')
            .send({ puzzle: '12345678.' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                done();
            });
    });

    test('Solve a puzzle that cannot be solved', (done) => {
        chai.request(server)
            .post('/api/solve')
            .set('content-type', 'application/json')
            .send({ puzzle: '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Puzzle cannot be solved');
                done();
            });
    });

    // some of the next tests are based on https://github.com/normanrichardson/FCC-Sudoku-Solver/blob/main/tests/2_functional-tests.js

    test('Check a puzzle placement with all fields', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[1][0], coordinate: 'E6', value: 2 })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isTrue(res.body.valid);
                done();
            });
    });

    test('Check a puzzle placement with single placement conflict', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'B6', value: 2, })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isFalse(res.body.valid);
                assert.deepEqual(res.body.conflict, ['column']);
                done();
            });
    });

    test('Check a puzzle placement with multiple placement conflicts', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'B6', value: '9' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isFalse(res.body.valid);
                assert.deepEqual(res.body.conflict, ['row', 'region']);
                done();
            });
    });

    test('Check a puzzle placement with all placement conflicts', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'F8', value: '7' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isFalse(res.body.valid);
                assert.deepEqual(res.body.conflict, ['row', 'column', 'region']);
                done();
            });
    });

    test('Check a puzzle placement with missing required fields', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ value: 7 })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Required field(s) missing');
                done();
            });
    });

    test('Check a puzzle placement with invalid characters', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: 'a'.repeat(81), coordinate: 'F8', value: '1' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Invalid characters in puzzle');
                done();
            });
    });

    test('Check a puzzle placement with incorrect length', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: '.', coordinate: 'F8', value: '1' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                done();
            });
    });

    test('Check a puzzle placement with invalid placement coordinate', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[1][0], coordinate: 'K0', value: '1' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Invalid coordinate');
                done();
            });
    });

    test('Check a puzzle placement with invalid placement value', (done) => {
        chai.request(server)
            .post('/api/check')
            .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'D5', value: 'x' })
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, 'Invalid value');
                done();
            });
    })
});
