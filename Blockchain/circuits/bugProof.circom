pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/poseidon.circom";

template BugProof() {
    signal input bugDetails; // (Note: now public)
    signal output hash;

    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== bugDetails;
    hash <== poseidon.out;
}

component main = BugProof();
