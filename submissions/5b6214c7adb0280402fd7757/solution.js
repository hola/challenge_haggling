'use strict'; /*jslint node:true*/

// notes: tweaked for default inputs only


let zero_value_probabilities = {
    '121xxx': [ 0.166685, 0.30554, 0.166664 ],
    '121xzx': [ 0.090936, 1, 0.090932 ],
    '122xxx': [ 0.28581, 0.285657, 0.285704 ],
    '122xxz': [ 0.166707, 0.166571, 1 ],
    '132xxx': [ 0.142862, 0.428572, 0.285664 ],
    '132xxz': [ 0, 0.249849, 1 ],
    '123xxx': [ 0.142833, 0.285722, 0.428503 ],
    '123xxz': [ 0.166623, 0.166677, 1 ],
    '211xxx': [ 0.305513, 0.166666, 0.166648 ],
    '212xxx': [ 0.285789, 0.285655, 0.285691 ],
    '231xxx': [ 0.285755, 0.428634, 0.14282 ],
    '114xxx': [ 0.142855, 0.142859, 0.523733 ],
    '114xxz': [ 0.090864, 0.090922, 1 ],
    '211zxx': [ 1, 0.090847, 0.090901 ],
    '312xxx': [ 0.428534, 0.142872, 0.285654 ],
    '112xxx': [ 0.166664, 0.166735, 0.305615 ],
    '112xxz': [ 0.090894, 0.090965, 1 ],
    '321xxx': [ 0.428578, 0.285717, 0.142776 ],
    '321zxx': [ 1, 0.166731, 0.166564 ],
    '213xxx': [ 0.285677, 0.142938, 0.428569 ],
    '213zxx': [ 1, 0, 0.250104 ],
    '213xxz': [ 0.166715, 0.166804, 1 ],
    '213zxz': [ 1, 0, 1 ],
    '411xxx': [ 0.523751, 0.142829, 0.142903 ],
    '411zxx': [ 1, 0.090898, 0.090956 ],
    '212xxz': [ 0.166601, 0.166658, 1 ],
    '221xxx': [ 0.285733, 0.285661, 0.28579 ],
    '221zxx': [ 1, 0.166703, 0.166754 ],
    '221xzx': [ 0.166745, 1, 0.166729 ],
    '221zzx': [ 1, 1, 0 ],
    '141xxx': [ 0.142891, 0.523822, 0.14285 ],
    '222xxx': [ 0.285768, 0.285701, 0.285676 ],
    '222xzx': [ 0.166724, 1, 0.166597 ],
    '141zxx': [ 1, 0.333317, 0 ],
    '411xzx': [ 0.33332, 1, 0 ],
    '312zxx': [ 1, 0.166706, 0.166596 ],
    '312xxz': [ 0.249925, 0, 1 ],
    '312zxz': [ 1, 0, 1 ],
    '122zxx': [ 1, 0.166605, 0.166646 ],
    '123zxx': [ 1, 0, 0.499873 ],
    '123zxz': [ 1, 0, 1 ],
    '231xzx': [ 0.16667, 1, 0.166645 ],
    '231xxz': [ 0, 0.500139, 1 ],
    '231xzz': [ 0, 1, 1 ],
    '221xxz': [ 0.16672, 0.166654, 1 ],
    '212zxx': [ 1, 0.166646, 0.166543 ],
    '141xzx': [ 0.090924, 1, 0.09093 ],
    '141xxz': [ 0, 0.333432, 1 ],
    '141xzz': [ 0, 1, 1 ],
    '311xxx': [ 0.423075, 0.153794, 0.153846 ],
    '311zxx': [ 1, 0.090776, 0.0909 ],
    '113xxx': [ 0.15386, 0.153776, 0.42305 ],
    '113xzx': [ 0, 1, 0.249861 ],
    '132xzx': [ 0.166642, 1, 0.166537 ],
    '213xzx': [ 0, 1, 0.500127 ],
    '213xzz': [ 0, 1, 1 ],
    '131xxx': [ 0.153796, 0.423187, 0.153821 ],
    '131zxx': [ 1, 0.250016, 0 ],
    '121zxx': [ 1, 0.166689, 0.166711 ],
    '121zzx': [ 1, 1, 0 ],
    '212zxz': [ 1, 0, 1 ],
    '321xzx': [ 0.250097, 1, 0 ],
    '321zzx': [ 1, 1, 0 ],
    '123xzx': [ 0, 1, 0.249969 ],
    '311xxz': [ 0.249973, 0, 1 ],
    '311zxz': [ 1, 0, 1 ],
    '211xxz': [ 0.166649, 0.166679, 1 ],
    '222zxx': [ 1, 0.166684, 0.166557 ],
    '222xxz': [ 0.166611, 0.166611, 1 ],
    '222zxz': [ 1, 0, 1 ],
    '111xxx': [ 0.166684, 0.16665, 0.166724 ],
    '113zxx': [ 1, 0, 0.24992 ],
    '411xxz': [ 0.333361, 0, 1 ],
    '321xxz': [ 0.499984, 0, 1 ],
    '321zxz': [ 1, 0, 1 ],
    '212xzx': [ 0.166724, 1, 0.166678 ],
    '211zxz': [ 1, 0, 1 ],
    '131xzx': [ 0.090862, 1, 0.090911 ],
    '113xxz': [ 0.090894, 0.090823, 1 ],
    '111xxz': [ 0.090879, 0.090891, 1 ],
    '122xzx': [ 0.166694, 1, 0.166598 ],
    '122xzz': [ 0, 1, 1 ],
    '121xxz': [ 0.166732, 0.166703, 1 ],
    '121zxz': [ 1, 0, 1 ],
    '114zxx': [ 1, 0, 0.333125 ],
    '123xzz': [ 0, 1, 1 ],
    '112zxx': [ 1, 0.166769, 0.166673 ],
    '112xzx': [ 0.166699, 1, 0.166733 ],
    '112zzx': [ 1, 1, 0 ],
    '121xzz': [ 0, 1, 1 ],
    '111zxx': [ 1, 0.090905, 0.090901 ],
    '312xzx': [ 0.500021, 1, 0 ],
    '411zzx': [ 1, 1, 0 ],
    '311xzx': [ 0.249718, 1, 0 ],
    '311zzx': [ 1, 1, 0 ],
    '113xzz': [ 0, 1, 1 ],
    '312zzx': [ 1, 1, 0 ],
    '131zzx': [ 1, 1, 0 ],
    '141zzx': [ 1, 1, 0 ],
    '212xzz': [ 0, 1, 1 ],
    '131xxz': [ 0, 0.250112, 1 ],
    '132xzz': [ 0, 1, 1 ],
    '132zxx': [ 1, 0.499908, 0 ],
    '222zzx': [ 1, 1, 0 ],
    '131xzz': [ 0, 1, 1 ],
    '211xzx': [ 0.16653, 1, 0.166661 ],
    '221zxz': [ 1, 0, 1 ],
    '212zzx': [ 1, 1, 0 ],
    '122zzx': [ 1, 1, 0 ],
    '132zzx': [ 1, 1, 0 ],
    '114xzx': [ 0, 1, 0.333329 ],
    '411zxz': [ 1, 0, 1 ],
    '222xzz': [ 0, 1, 1 ],
    '111xzx': [ 0.090924, 1, 0.090932 ],
    '111xzz': [ 0, 1, 1 ],
    '231zxx': [ 1, 0.250006, 0 ],
    '231zzx': [ 1, 1, 0 ],
    '113zxz': [ 1, 0, 1 ],
    '211zzx': [ 1, 1, 0 ],
    '112zxz': [ 1, 0, 1 ],
    '114zxz': [ 1, 0, 1 ],
    '111zxz': [ 1, 0, 1 ],
    '211xzz': [ 0, 1, 1 ],
    '122zxz': [ 1, 0, 1 ],
    '112xzz': [ 0, 1, 1 ],
    '114xzz': [ 0, 1, 1 ],
    '111zzx': [ 1, 1, 0 ],
    '221xzz': [ 0, 1, 1 ] };

let single_value_probabilities = {
    '111': [ 0.005051, 0.005051, 0.005051 ],
    '112': [ 0.009267, 0.009259, 0.009265 ],
    '113': [ 0.012808, 0.012817, 0 ],
    '114': [ 0.015873, 0.015863, 0 ],
    '121': [ 0.009261, 0.009263, 0.009262 ],
    '122': [ 0.015864, 0.015875, 0.015872 ],
    '123': [ 0.023807, 0.023799, 0 ],
    '131': [ 0.012824, 0, 0.012817 ],
    '132': [ 0.02379, 0, 0.023806 ],
    '141': [ 0.015877, 0, 0.015876 ],
    '211': [ 0.009259, 0.009257, 0.009251 ],
    '212': [ 0.015871, 0.015866, 0.015875 ],
    '213': [ 0.023828, 0.023816, 0 ],
    '221': [ 0.015876, 0.015883, 0.015877 ],
    '222': [ 0.015866, 0.015865, 0.015878 ],
    '231': [ 0.02381, 0, 0.023813 ],
    '311': [ 0, 0.012819, 0.012802 ],
    '312': [ 0, 0.023797, 0.023812 ],
    '321': [ 0, 0.023795, 0.023818 ],
    '411': [ 0, 0.01588, 0.015869 ] };

module.exports = class Agent {
    constructor (me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = (value) => log(JSON.stringify(value));
        this.total = this.get_offer_value(this.counts, this.values);
        this.incoming_offers = [];
        this.current_strategy = (me == 0) ? this.greed_strategy : this.unselfish_strategy;

        this.log(["values", this.values]);
        this.log(["counts", this.counts]);
    }

    offer (incoming_offer) {
        this.rounds--;

        if (incoming_offer != null) {
            this.log(["incoming_offer", incoming_offer]);
            this.incoming_offers.push(incoming_offer)

            // we don't want to skip such offers
            if (this.get_offer_value(incoming_offer, this.values) == 10) {
                this.log(["bingo!", incoming_offer]);
                return;
            }
        }

        return this.current_strategy(incoming_offer);
    }

    get_offer_value (offer, values) {
        return offer.map((v,i) => v * values[i]).reduce((a,b) => a + b);
    }

    get_meaningful_values (offers, counts, values) {
        let total = this.get_offer_value(counts, values);
        let meaningful_values = [];
        for (let v0 = 0; v0 * counts[0] <= total; v0++) {
            for (let v1 = 0; v0 * counts[0] + v1 * counts[1] <= total; v1++) {
                let v2left = total - v0 * counts[0] - v1 * counts[1];
                if ((v2left % counts[2]) != 0) {
                   continue;
                }

                let v2 = v2left / counts[2];
                let test_values = [v0, v1, v2];
                if (offers.map(o => this.get_offer_value(o, test_values)).every((v, i, vs) => (i == 0 || vs[i - 1] >= v))) {
                    meaningful_values.push(test_values);
                }
            }
        }
        return meaningful_values;
    }

    greed_strategy (incoming_offer) {
        // validate opponent strategy
        let opp_meaningful_values = this.get_meaningful_values(this.incoming_offers, this.counts, this.values);
        if (opp_meaningful_values.length == 0) {
            this.log("opponent's strategy is not meaningful");
            this.log("let's use unselfish strategy to get at least something");
            this.current_strategy = this.unselfish_strategy;
            return this.current_strategy(incoming_offer);
        }

        // in case of last offer we should offer anything non zero
        if (this.rounds == 0) {
            var ValueGuessEnum = Object.freeze({"Zero": 0, "Unknown": 1, "NonZero": 2})
            let guess = new Array(this.counts.length).fill(ValueGuessEnum.Unknown);

            // assume no one will offer only part of zero cost items
            for (let index = 0; index < this.counts.length; index++) {
                let previous_value = null;
                for (let offer of this.incoming_offers) {
                    if (previous_value != null) {
                        if (previous_value != offer[index]) {
                            guess[index] = ValueGuessEnum.NonZero;
                            break;
                        }
                    } else {
                        previous_value = offer[index];
                    }
                }
            }

            // assume zero cost items will be always all offered
            for (let index = 0; index < this.counts.length; index++) {
                let is_always_all_offered = true;
                for (let offer of this.incoming_offers) {
                    if (offer[index] != this.counts[index]) {
                        is_always_all_offered = false;
                        break;
                    }
                }

                if (is_always_all_offered) {
                    guess[index] = ValueGuessEnum.Zero;
                }
            }

            // validate guess
            {
                let zero_key = this.counts.join('') + guess.map((g, i) => ((g == ValueGuessEnum.Zero) ? "z" : "x")).join('');
                if (!(zero_key in zero_value_probabilities)) {
                    // impossible guess => reset it
                    guess = guess.map(v => v == ValueGuessEnum.Zero ? ValueGuessEnum.Unknown : v);
                }
            }

            this.log(["incoming_offers", this.incoming_offers]);
            this.log(["guess", guess]);

            // get possible offers and their success probability (assume opponent accept any non zero)
            let offers = []; // offer is list of item types
            let key = this.counts.join('');

            // 1. add current offer
            if (incoming_offer.some(c => c > 0)) {
                let offer = [];
                for (let index = 0; index < incoming_offer.length; index++) {
                    for (let c = 0; c < this.counts[index] - incoming_offer[index]; c++) {
                        offer.push(index);
                    }
                }
                offers.push({"offer": offer, "probability": 1.0, "type": "current offer"});
            }

            // 2. add offers using 'non zero value' guess
            for (let index = 0; index < this.counts.length; index++) {
                if (guess[index] == ValueGuessEnum.NonZero) {
                    offers.push({"offer": [index], "probability": 1.0, "type" : "non zero guess"});
                }
            }

            // 3. add offers with only one item
            {
                let zero_key = key + guess.map((g, i) => ((g == ValueGuessEnum.Zero) ? "z" : "x")).join('');
                for (let index = 0; index < this.counts.length; index++) {
                    if (guess[index] != ValueGuessEnum.Zero) {
                        offers.push({"offer": [index], "probability": 1.0 - zero_value_probabilities[zero_key][index], "type" : "one item"});
                    }
                }
            }

            // 4. add offers with two different items
            {
                for (let index = 0; index < this.counts.length; index++) {
                    let offer = new Array(this.counts.length).fill(0).map((v, i) => i).filter((v, i) => i != index);
                    if (offer.some(i => guess[i] != ValueGuessEnum.Zero)) {
                        offers.push({"offer": offer, "probability": 1.0 - single_value_probabilities[key][index], "type" : "two items"});
                    }
                }
            }

            // 5. add offer with three different items
            if (!guess.includes(ValueGuessEnum.Zero)) {
                offers.push({"offer": new Array(this.counts.length).fill(0).map((v, i) => i), "probability": 1.0, "type" : "three items"});
            }

            // value each offer
            for (let offer of offers) {
                offer.income = this.total - offer.offer.map(i => this.values[i]).reduce((a,b) => a + b);
                offer.average_income = offer.income * offer.probability;
            }

            this.log(["possible offers", offers]);

            // iterate over all offers and find one with most income in average
            let best_offer = offers[0];
            for (let offer of offers) {
                if (best_offer.average_income < offer.average_income) {
                    best_offer = offer;
                }
            }

            this.log(["best offer", best_offer]);

            // convert list of item types to proper offer
            let outgoing_offer = this.counts.slice();
            for (let index = 0; index < outgoing_offer.length; index++) {
                if (best_offer.offer.includes(index)) {
                    outgoing_offer[index]--;
                }
            }

            // offer may be same as current one, if so accept it right now
            if (outgoing_offer.every((c, i) => incoming_offer[i] >= c)) {
                this.log(["current offer is best, accept it", best_offer]);
                return;
            }

            // there is no sense to keep items with zero value
            outgoing_offer = outgoing_offer.map((c, i) => (this.values[i] == 0) ? 0 : c);

            this.log(["last greed outgoing offer", outgoing_offer]);
            return outgoing_offer;
        } else {
            // default offer contains all items with zero cost
            let outgoing_offer = this.values.map((v, i) => (v != 0) ? this.counts[i] : 0);
            this.log(["default outgoing offer", outgoing_offer]);
            return outgoing_offer;
        }
    }

    unselfish_strategy (incoming_offer) {
        // initialize offers list
        if (!this.hasOwnProperty("offers_list")) {
            this.offers_list = [];
            for (let c0 = 0; c0 <= (this.values[0] != 0 ? this.counts[0] : 0); c0++) {
                for (let c1 = 0; c1 <= (this.values[1] != 0 ? this.counts[1] : 0); c1++) {
                    for (let c2 = 0; c2 <= (this.values[2] != 0 ? this.counts[2] : 0); c2++) {
                        let offer = [c0, c1, c2];
                        let value = this.get_offer_value(offer, this.values);
                        if (value != 0) {
                            this.offers_list.push({"value" : value, "offer" : offer});
                        }
                    }
                }
            }

            this.offers_list.sort(function(offerA, offerB) {
                if(offerA.value > offerB.value) return -1;
                if(offerA.value < offerB.value) return 1;
                return 0;
            });

            this.log(["offers list initialized", this.offers_list]);
        }

        // each turn less and less will be enough
        let accept_threshold = 10 + (this.rounds - this.max_rounds + 1) * 2;
        this.log(["accept threshold", accept_threshold]);
        if (this.get_offer_value(incoming_offer, this.values) >= accept_threshold) {
            this.log(["ok, that is enough", incoming_offer]);
            return;
        }

        // remove offers above our accept threshold
        while (this.offers_list.length > 1 && accept_threshold < this.offers_list[0].value) {
            let removed_order = this.offers_list.shift();
            this.log(["remove offer above accept threshold", removed_order]);
        }

        if (this.rounds > 1) {
            if (this.get_offer_value(incoming_offer, this.values) >= this.offers_list[0].value) {
                this.log(["accept incoming offer, since it is same or better than we have", this.offers_list[0]]);
                return;
            } else if (this.offers_list.length > 1) {
                // offer one by one starting from most valuable for us
                this.log(["return first offer and remove it", this.offers_list[0]]);
                return this.offers_list.shift().offer;
            } else {
                // keep offering last one
                this.log(["return last offer and keep it", this.offers_list[0]]);
                return this.offers_list[0].offer;
            }
        } else if (this.rounds == 1) {
            // out last offer, find most valuable offer we had received and return it
            let best_incoming_offer = this.incoming_offers[0];
            for (let offer of this.incoming_offers) {
                if (this.get_offer_value(best_incoming_offer, this.values) < this.get_offer_value(offer, this.values)) {
                    best_incoming_offer = offer;
                }
            }

            // no valuable offers, keep using ours
            if (this.get_offer_value(best_incoming_offer, this.values) == 0) {
                best_incoming_offer = this.offers_list[0].offer;
            }

            this.log(["last incoming offers", this.incoming_offers]);
            this.log(["last unselfish outgoing offer", best_incoming_offer]);
            return best_incoming_offer;
        } else {
            // last chance to accept any offer
            if (this.get_offer_value(incoming_offer, this.values) == 0) {
                this.log(["refuse zero income offer"]);
                return this.offers_list[0].offer; // don't agree for zero income
            } else {
                this.log(["accept last offer", incoming_offer]);
                return;
            }
        }
    }
};
