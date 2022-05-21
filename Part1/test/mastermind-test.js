//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("Mastermind Variation test", function () {
    let poseidon;
    let F;

    // increased the timeout amount so that things execute on a lower spec machine
    this.timeout(100000000);

    // our first test
    it("Should pass, all 5 guesses are correct, 5 hits", async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;

        // our solutions will be 1,2,3,4,5
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSolnD = 4;
        const privSolnE = 5;

        // generating some random int as out salt
        const privSalt = Math.floor(Math.random()*10**10);
        //console.log(privSalt);

        // computing our poseidon hash of the salt and solutions
        const pubSolnHash = poseidon([privSalt,privSolnA,privSolnB,privSolnC,privSolnD,privSolnE]);
        //console.log(pubSolnHash);
        //console.log(F.toObject(pubSolnHash));

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        // this input corresponds to all correct guesses and gives 5 hits
        const INPUT = {
            "pubGuessA": 1,
            "pubGuessB": 2,
            "pubGuessC": 3,
            "pubGuessD": 4,
            "pubGuessE": 5,
            "pubNumHit": 5,
            "pubNumBlow": 0,
            "pubSolnHash": F.toObject(pubSolnHash),
            "privSolnA": privSolnA,
            "privSolnB": privSolnB,
            "privSolnC": privSolnC,
            "privSolnD": privSolnD,
            "privSolnE": privSolnE,
            "privSalt" : privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });


    // here all guesses should be wrong
    it("Should pass, all 5 guesses are wrong, 0 hits, 0 blows", async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;

        // our solutions will be 1,2,3,4,5
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSolnD = 4;
        const privSolnE = 5;

        // generating some random int as out salt
        const privSalt = Math.floor(Math.random()*10**10);
        //console.log(privSalt);

        // computing our poseidon hash of the salt and solutions
        const pubSolnHash = poseidon([privSalt,privSolnA,privSolnB,privSolnC,privSolnD,privSolnE]);
        //console.log(pubSolnHash);
        //console.log(F.toObject(pubSolnHash));

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        // all of our guesses are wrong, and we have 0 hits and 0 blows
        const INPUT = {
            "pubGuessA": 6,
            "pubGuessB": 7,
            "pubGuessC": 8,
            "pubGuessD": 9,
            "pubGuessE": 0,
            "pubNumHit": 0,
            "pubNumBlow": 0,
            "pubSolnHash": F.toObject(pubSolnHash),
            "privSolnA": privSolnA,
            "privSolnB": privSolnB,
            "privSolnC": privSolnC,
            "privSolnD": privSolnD,
            "privSolnE": privSolnE,
            "privSalt" : privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });


    // here two of our guesses will be correct, but in the wrong sequence (i.e. 0 hits, 2 blows)
    it("Should pass, 2 guesses are correct, but wrong position (2 Blows)", async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;

        // our solutions will be 1,2,3,4,5
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSolnD = 4;
        const privSolnE = 5;

        // generating some random int as out salt
        const privSalt = Math.floor(Math.random()*10**10);
        //console.log(privSalt);

        // computing our poseidon hash of the salt and solutions
        const pubSolnHash = poseidon([privSalt,privSolnA,privSolnB,privSolnC,privSolnD,privSolnE]);
        //console.log(pubSolnHash);
        //console.log(F.toObject(pubSolnHash));

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        // our correct guesses but incorrect positions (i.e. 2 blows) are given by 2 and 3.
        // the other guesses are incorrect
        const INPUT = {
            "pubGuessA": 2,
            "pubGuessB": 3,
            "pubGuessC": 8,
            "pubGuessD": 9,
            "pubGuessE": 0,
            "pubNumHit": 0,
            "pubNumBlow": 2,
            "pubSolnHash": F.toObject(pubSolnHash),
            "privSolnA": privSolnA,
            "privSolnB": privSolnB,
            "privSolnC": privSolnC,
            "privSolnD": privSolnD,
            "privSolnE": privSolnE,
            "privSalt" : privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });
});