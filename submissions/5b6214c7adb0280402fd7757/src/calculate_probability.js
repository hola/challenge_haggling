#!/usr/bin/env node
'use strict'; /*jslint node:true*/

const generate = require('./challenge_haggling/src/generate.js');
const random_js = require('./challenge_haggling/src/node_modules/random-js');

let generator = new generate.Generator(3, 1, 6, 10, 5);

let mask_keys = new Array(8);
for (let mask = 0; mask < 8; mask++) {
    mask_keys[mask] = [0,0,0].map((v,i) => (mask & (1 << i)) != 0 ? "z" : "x").join('');
}

let zero_probability = {};
let single_probability = {};

let samples = 4294967295;
for (let seed = 0; seed < samples; seed++) {
    if (seed % 10000000 == 0) {
        console.log(seed);
        console.log(["zero", get_probabilities(zero_probability)]);
        console.log(["single", get_probabilities(single_probability)]);
    }

    let random = new random_js(random_js.engines.mt19937().seed(seed));
    let session = generator.get(random);
    let valuations = session.valuations[1];

    let count_key = session.counts.join('');
    let zero_mask = session.valuations[1].map((v,i) => (v == 0) ? (1 << i) : 0).reduce((a, b) => a + b);
    for (let mask = 0; mask < 8; mask++) {
        if ((zero_mask) != (zero_mask | mask)) {
            continue;
        }

        let key = count_key + mask_keys[mask];
        if (!(key in zero_probability)) {
            zero_probability[key] = [0, 0, 0, 0];
        }

        let probabilities = zero_probability[key];
        for (let i = 0; i < 3; i++) {
            if (valuations[i] == 0) {
                probabilities[i]++;
            }
        }
        probabilities[3]++;
    }

    // two items with zero value
    for (let i = 0; i < 3; i++) {
        if (!(count_key in single_probability)) {
            single_probability[count_key] = [0, 0, 0, 0];
        }

        let probabilities = single_probability[count_key];
        if (session.counts[i] * valuations[i] == 10) {
            probabilities[i]++;
        }

        probabilities[3]++;
    }
}

function get_probabilities (stats) {
    let probabilities = {};
    for (let key in stats) {
        let length = stats[key].length;
        probabilities[key] = stats[key]
            .map(v => v / stats[key][length - 1])
            .map(v => Math.round(v * 1000000) / 1000000.0)
            .filter((v, i) => i != length - 1);
    }
    return probabilities;
}

console.log(["zero_final", get_probabilities(zero_probability)]);
console.log(["single_final", get_probabilities(single_probability)]);
