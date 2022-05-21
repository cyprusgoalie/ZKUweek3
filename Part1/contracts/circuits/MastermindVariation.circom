pragma circom 2.0.0;

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit

// This is an implementation of the Super Mastermind (aka Deluxe Mastermind, aka Advanced Mastermind
// game and is based on enu-kuro's original hitandblow.circom. In this version, there are 8 possible "colors"
// and 5 "holes", making the answer more difficult to solve.

// The below code is copied directly from enu-kuro's hitandblow.circom circuit
// (original source: https://github.com/enu-kuro/zku-final-project/blob/main/circuits/hitandblow.circom)
// and modified for this game variation (with some additional comments)

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template MastermindVariation() {
    // Public inputs
    // This variant has 5 guesses and 5 solutions
    signal input pubGuessA;
    signal input pubGuessB;
    signal input pubGuessC;
    signal input pubGuessD;
    signal input pubGuessE;
    signal input pubNumHit;
    signal input pubNumBlow;
    signal input pubSolnHash;

    // Private inputs
    signal input privSolnA;
    signal input privSolnB;
    signal input privSolnC;
    signal input privSolnD;
    signal input privSolnE;
    signal input privSalt;

    // Output
    signal output solnHashOut;
    // We now have 5 guesses
    var guess[5] = [pubGuessA, pubGuessB, pubGuessC, pubGuessD, pubGuessE];
    var soln[5] =  [privSolnA, privSolnB, privSolnC, privSolnD, privSolnE];
    var j = 0;
    var k = 0;
    component lessThan[10];
    component equalGuess[10];
    component equalSoln[10];
    var equalIdx = 0;

    // Create a constraint that the solution and guess digits are all less than 10.
    // We have changed the constraints of the for loops for the increased guess count
    for (j=0; j<5; j++) {
        lessThan[j] = LessThan(4);
        lessThan[j].in[0] <== guess[j];
        lessThan[j].in[1] <== 10;
        lessThan[j].out === 1;
        lessThan[j+5] = LessThan(4);
        lessThan[j+5].in[0] <== soln[j];
        lessThan[j+5].in[1] <== 10;
        lessThan[j+5].out === 1;
        for (k=j+1; k<5; k++) {
            // Create a constraint that the solution and guess digits are unique. no duplication.
            equalGuess[equalIdx] = IsEqual();
            equalGuess[equalIdx].in[0] <== guess[j];
            equalGuess[equalIdx].in[1] <== guess[k];
            equalGuess[equalIdx].out === 0;
            equalSoln[equalIdx] = IsEqual();
            equalSoln[equalIdx].in[0] <== soln[j];
            equalSoln[equalIdx].in[1] <== soln[k];
            equalSoln[equalIdx].out === 0;
            equalIdx += 1;
        }
    }

    // Count hit & blow
    var hit = 0;
    var blow = 0;
    component equalHB[25];

    // We have changed the constraints of the for loops for the increased guess count
    for (j=0; j<5; j++) {
        for (k=0; k<5; k++) {
            equalHB[5*j+k] = IsEqual();
            equalHB[5*j+k].in[0] <== soln[j];
            equalHB[5*j+k].in[1] <== guess[k];
            blow += equalHB[5*j+k].out;
            if (j == k) {
                hit += equalHB[5*j+k].out;
                blow -= equalHB[5*j+k].out;
            }
        }
    }

    // Create a constraint around the number of hit
    component equalHit = IsEqual();
    equalHit.in[0] <== pubNumHit;
    equalHit.in[1] <== hit;
    equalHit.out === 1;
    
    // Create a constraint around the number of blow
    component equalBlow = IsEqual();
    equalBlow.in[0] <== pubNumBlow;
    equalBlow.in[1] <== blow;
    equalBlow.out === 1;

    // Verify that the hash of the private solution matches pubSolnHash
    // The hash must include one additional input, since we increase our number of guesses
    component poseidon = Poseidon(6);
    poseidon.inputs[0] <== privSalt;
    poseidon.inputs[1] <== privSolnA;
    poseidon.inputs[2] <== privSolnB;
    poseidon.inputs[3] <== privSolnC;
    poseidon.inputs[4] <== privSolnD;
    poseidon.inputs[5] <== privSolnE;


    solnHashOut <== poseidon.out;
    pubSolnHash === solnHashOut;
}

component main{public [pubGuessA, pubGuessB, pubGuessC, pubGuessD, pubGuessE, pubNumHit, pubNumBlow, pubSolnHash]} = MastermindVariation();