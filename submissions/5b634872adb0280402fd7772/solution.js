'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(is_first_turn, objects, weights, max_rounds, log) {
        this.is_first_turn = is_first_turn
        this.objects = objects
        this.weights = weights;
        this.max_rounds = max_rounds;
        this.log = log;
        this.lenient = 0.5;
        this.accept = undefined;
        this.total = this.get_total();
        this.value_options_map = this.get_value_options_map();
    }

    get_value_options_map() {
        let value_options_map = {};
        for (let i = 0; i <= this.objects[0]; i++) {
            for (let j = 0; j <= this.objects[1]; j++) {
                for (let k = 0; k <= this.objects[2]; k++) {
                    let value = this.weights[0] * i + this.weights[1] * j + this.weights[2] * k;
                    if (value in value_options_map) {
                        value_options_map[value].push([i, j, k]);
                    } else {
                        value_options_map[value] = [
                            [i, j, k]
                        ];
                    }

                }
            }
        }
        return value_options_map;
    }

    get_total() {
        let total_value = 0;
        for (let i = 0; i < this.objects.length; i++)
            total_value += this.objects[i] * this.weights[i];
        return total_value;
    }

    get_all_valid_values() {
        var keys = [];
        for (let k in this.value_options_map) {
            keys.push(k);
        }
        return keys;
    }

    get_value_from_offer(offer) {
        let value = 0;
        if (offer) {
            for (let i = 0; i < this.weights.length; i++) {
                value += (parseInt(offer[i]) * parseInt(this.weights[i]));
            }
        }
        return value;
    }


    offer(o) {
        this.log(`${this.max_rounds} rounds left`);
        this.max_rounds--;
        let valid_values = this.get_all_valid_values();
        valid_values.sort(function cmp(a, b) {
            return parseInt(a) - parseInt(b);
        });
        valid_values.reverse();
        let values_we_are_getting = this.get_value_from_offer(o);
        this.log("value i am getting " + values_we_are_getting);
        if (values_we_are_getting >= 7) {
            return this.accept;
        } else if (values_we_are_getting >= 6) {
            let P = Math.random();
            if (P < this.lenient) {
                return this.accept;
            }
        }


        for (let i = 0; i < valid_values.length; i++) {
            let value = valid_values[i];
            let possible_bids = this.value_options_map[value];
            if (possible_bids.length > 0) {
                let random_index = Math.floor(Math.random() * possible_bids.length);
                let bid = possible_bids[random_index];

                possible_bids = possible_bids.splice(random_index, 1);
                return bid;
            }
        }
    }
};