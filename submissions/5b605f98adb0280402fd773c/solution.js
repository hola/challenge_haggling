/*jshint esversion: 6 */

function _init_valuations(obj_set, values, i, total_value, total, types){
    const count = obj_set.counts[i];
    const max = (total-total_value)/count|0;
    if (i==types-1)
    {
        if (total_value+max*count==total)
        {
            values[i] = max;
            obj_set.valuations.push(Array.from(values));
        }
        return;
    }
    for (let j = 0; j<=max; j++)
    {
        values[i] = j;
        _init_valuations(obj_set, values, i+1, total_value+j*count, total, types);
    }
}


function _init_offers(values, counts, i, offer_builder, all_offers){
    if (i == counts.length) {
        all_offers.push(Array.from(offer_builder));
        // log(`Here, ${all_offers.length} ${offer_builder.length}`);
    } else if (values[i] > 0) {
        for (let j = 0; j <= counts[i]; j++) {
            offer_builder[i] = j;
            // log(`Here 2 ${i} ${j}, ${all_offers.length}, ${offer_builder.length}`);
            _init_offers(values, counts, i + 1, offer_builder, all_offers);
        }
    } else {
        // Never make an offer on an object which has 0 value.
        offer_builder[i] = 0;
        _init_offers(values, counts, i + 1, offer_builder, all_offers);
    }
}


function average_values(all_vals, num_items, wt) {
    let weights = wt;
    if (typeof weights === "undefined") {
        weights = Array(all_vals.length).fill(1);
    }

    const norm = weights.reduce((x, y) => x + y, 0);

    let mean_vals = new Array(num_items).fill(0.0);
    for (let i = 0; i < all_vals.length; i++) {
        for (let j = 0; j < all_vals[i].length; j++) {
            mean_vals[j] += (weights[i] / norm) * all_vals[i][j];
        }
    }
    return mean_vals;
}


function value_of_offer(offer, vals) {
    return offer.map((o, idx) => o * vals[idx]).reduce((x, y) => x + y, 0);
}


function value_of_offer_for_others(offer, counts, other_vals) {
    return offer.map((o, idx) => (counts[idx] - o) * other_vals[idx]).reduce((x, y) => x + y, 0);
}


function exp_best_offer(vals, counts, other_vals) {
    // Overall value maximizing play.
    let offer = Array.fom(counts);
    for (let i = 0; i < vals.length; i++) {
        if (vals[i] < other_vals[i]) {
            offer[i] = 0;
        } else if (vals[i] == other_vals[i]) {
            if (counts[i] % 2 == 0) {
                offer[i] = counts[i] / 2;
            } else if (Math.random() < 0.5) {
                offer[i] = Math.floor(counts[i] / 2);
            } else {
                offer[i] = Math.floor(counts[i] / 2);
            }
        }
    }
    return offer;
}


function biased_div2(values, requested) {
    const total = values.reduce((x, y) => x + y, 0);
    return (v, idx) => {
        if (!requested[idx]) {
            // If this type was never requested, then just take
            // all of it.
            return v;
        } else if (v % 2 === 0) {
            return v / 2;
        } else if (Math.random() > values[idx] / total) {
            return (v - 1) / 2;
        } else {
            return (v + 1) / 2;
        }
    };
}


function stochastic_div2(v) {
    if (v % 2 === 0) {
        return v / 2;
    } else if (Math.random() < 0.5) {
        return (v - 1) / 2;
    } else {
        return (v + 1) / 2;
    }
}


function offers_to_value(
    possible_offers,
    counts,
    our_values,
    possible_other_values
) {
    // Creates a map from all possible_offers to the value for us and expected
    // value for our opponent.
    let offer_values = [];
    for (let i = 0; i < possible_offers.length; i++) {
        let offer = possible_offers[i];
        let our_value = value_of_offer(offer, our_values);
        let worth_for_others = possible_other_values.map((other_values) => value_of_offer_for_others(offer, counts, other_values));
        let exp_worth_for_others = worth_for_others.reduce((x, y) => x + y, 0) / possible_other_values.length;
        offer_values.push({
            offer,
            "others": exp_worth_for_others,
            "total": our_value + exp_worth_for_others,
            "us": our_value
        });
    }
    return offer_values;
}


function value_comparator_adapt(round, max_rounds, total) {
    // Which of the two to value more?

    // return (v1, v2) => {
    //     const alpha = (1 - round / (max_rounds + 2));
    //     const val1 = v1.us + alpha * v2.others;
    //     const val2 = v2.us + alpha * v2.others;
    //     return val1 - val2;
    // };

    return (v1, v2) => {
        if (v1.us < v2.us) {
            return -1;
        } else if (v1.us > v2.us) {
            return +1;
        } else if (Math.abs(v1.others - total * 0.66) < Math.abs(v2.others - total * 0.66)) {
            return +1;
        } else if (Math.abs(v1.others - total * 0.66) > Math.abs(v2.others - total * 0.66)) {
            return -1;
        } else {
            return 0;
        }
    };

    // return (v1, v2) => {
    //     if (v1.us < v2.us) {
    //         return -1;
    //     } else if (v1.us > v2.us) {
    //         return +1;
    //     } else if (v1.total < v2.total) {
    //         return -1;
    //     } else if (v1.total > v2.total) {
    //         return +1;
    //     } else {
    //         return 0;
    //     }
    // };

    // if (v1.total < v2.total) {
    //     return -1;
    // } else if (v1.total > v2.total) {
    //     return +1;
    // } else if (v1.us < v2.us) {
    //     return -1;
    // } else if (v1.us > v2.us) {
    //     return +1;
    // } else {
    //     return 0;
    // }
}


function arr_eq(a1, a2) {
    return (a1.length === a2.length) && a1.every((y, idx) => y === a2[idx]);
}


function prune_valuations(possible_vals, offer_rejected, offer_counter_proposed, counts, log) {
    let new_vals = [];
    for (let i = 0; i < possible_vals.length; i++) {
        let old_sum = 0;
        let new_sum = 0;
        let values = possible_vals[i];

        // This is assuming that new offer for the
        // opponent must have been better than the
        // offer we made.
        for (let j = 0; j < values.length; j++) {
            new_sum += values[j] * (counts[j] - offer_counter_proposed[j]);
            old_sum += values[j] * (counts[j] - offer_rejected[j]);
        }

        if ((old_sum < new_sum) && new_sum > 0) {
            // log(`Accepting: ${new_sum} >= ${old_sum}`);
            new_vals.push(values);
        } else {
            // log(`Rejecting: ${values}`);
        }
    }

    // log(`new_vals: ${new_vals}`);
    return new_vals;
}


function sane_offer(total) {
    return (offer) => ((offer.others >= Math.floor(total / 2) - 1) && (offer.us > total / 2));
    // return (offer) => (offer.us > Math.floor(total / 2));
    // && offer.others > Math.floor(total / 2) - 2);
}


function no_old_offer(old_offers) {
    return (offer_value) => old_offers.every((old_o) => !arr_eq(old_o, offer_value.offer));
}


function no_dominated_offers(old_offers) {
    // Do not make an offer where we are necessarily asking for more than
    // we had asked for in the past.
    return (offer_value) => !old_offers.some((old_o) => old_o.every((x, idx) => x <= offer_value.offer[idx]));
}

function find_best(past_offers_received, new_offer, values, log) {
    let best_value = value_of_offer(new_offer, values);
    let best_offer = new_offer;
    past_offers_received.forEach((past_offer) => {
        let past_offer_value = value_of_offer(past_offer, values);
        if (past_offer_value > best_value) {
            log(`Better past offer = ${past_offer}, value = ${past_offer_value} > ${best_value}`);
            best_offer = past_offer.map((c, idx) => (((values[idx] > 0) && c) || 0));
            best_value = past_offer_value;
        }
    });

    return best_offer;
}


module.exports = class Expert {
    constructor(me, counts, values, max_rounds, log) {
        this.types = counts.length;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.last_offer = null;
        this.me = me;
        this.past_our_offers = [];
        this.past_their_offers = [];
        this.requested = Array.from(this.counts).fill(false);

        this.log(`values = ${values}`);

        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];

        this.obj_set = {
            counts: Array.from(counts),
            valuations: []
        };

        _init_valuations(this.obj_set, new Array(this.types), 0, 0, this.total, this.types);
        this.possible_valuations = this.obj_set.valuations.filter((other_val) => !arr_eq(other_val, this.values));
        this.valuation_likelihood = {}
        this.possible_valuations.forEach((val) => {
            this.valuation_likelihood[val] = 0;
        });

        this.possible_offers = [];

        _init_offers(values, counts, 0, new Array(this.types), this.possible_offers);
        log(`# possible offers = ${this.possible_offers.length}`);
        log(`# possible valuations = ${this.possible_valuations.length}`);
        // log(`# last offer generated = ${this.possible_offers[this.possible_offers.length - 1]}`);
    }

    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;

        if (o && this.last_offer)
        {
            this.possible_valuations = prune_valuations(
                this.possible_valuations,
                this.last_offer,
                o,
                this.counts,
                this.log
            );
        } else {
            // This is our first offer, make it aggressive.
        }

        let most_likely_vals = this.possible_valuations;
        let best_guess_other_val = average_values(this.possible_valuations, this.counts.length);
        if (o) {
            most_likely_vals = [];
            o.forEach((c, idx) => {
                this.requested[idx] = this.requested[idx] || (c < this.counts[idx]);
            });

            const they_keep = o.map((x, idx) => this.counts[idx] - x);
            this.possible_valuations.forEach((val) => {
                this.valuation_likelihood[val] += value_of_offer(they_keep, val);
            });

            let highest_likelihood = Math.max(...Object.values(this.valuation_likelihood));
            this.possible_valuations.forEach((val) => {
                if (this.valuation_likelihood[val] === highest_likelihood) {
                    most_likely_vals.push(val);
                }
            });

            this.log(`highest_likelihood = ${highest_likelihood} most_likely_vals = ${most_likely_vals.join(" - ")}`);

            best_guess_other_val = average_values(
                this.possible_valuations,
                this.counts.length,
                this.possible_valuations.map((val) => this.valuation_likelihood[val])
            );
            this.log(`mean_likely_val = ${best_guess_other_val}`);
        }

        // Creating our offer
        let offer_values = offers_to_value(
            this.possible_offers,
            this.counts,
            this.values,
            // this.possible_valuations
            // [best_guess_other_val]
            most_likely_vals.concat([best_guess_other_val])
        ).
            filter(sane_offer(this.total)).
            // filter(no_dominated_offers(this.past_our_offers)).
            sort(value_comparator_adapt(this.rounds, this.max_rounds, this.total));

        this.log(`Pruned # of offers = ${offer_values.length}, valuations = ${this.possible_valuations.length}, ` +
            `best_offer = ${offer_values[offer_values.length - 1] && offer_values[offer_values.length - 1].offer}` +
            ` requested = ${this.requested}`);

        let new_offer = Array.from(this.counts).map((c, idx) => {
            if (this.values[idx] > 0) {
                return c;
            } else {
                return 0;
            }
        });

        if (offer_values.length === 0) {
            this.log("No possible valuations, remote must be behaving stochastically.");
            // new_offer = new_offer.map(stochastic_div2);
            new_offer = find_best(this.past_their_offers, Array.from(this.counts).fill(0), this.values, this.log.bind(this));
        } else {
            let best_offer = offer_values[offer_values.length - 1];
            this.log(`best_offer => ${best_offer.us} + ${best_offer.others} = ${best_offer.total}`);
            new_offer = best_offer.offer;
        }
        new_offer = find_best(this.past_their_offers, new_offer, this.values, this.log.bind(this));

        // Calculating value of offers
        let value_of_our_offer = value_of_offer(new_offer, this.values);

        if (value_of_our_offer < this.total / 2) {
            let alt_value = 0;
            let alt_offer = null;
            while (alt_value === 0) {
                alt_offer = this.counts.map((c, idx) => (((this.values[idx] > 0) && c) || 0)).
                    // map(stochastic_div2);
                    map(biased_div2(this.values, this.requested));
                alt_value = value_of_offer(alt_offer, this.values);
            }
            if (alt_value > value_of_our_offer) {
                this.log(`Stochastic, bumping up our offer from ${value_of_our_offer} to ${alt_value}`);
                value_of_our_offer = alt_value;
                new_offer = alt_offer;
            } else {
                this.log(`Failed to find a better offer ${alt_value} < ${value_of_our_offer}`);
            }
        }

        let value_of_their_offer = 0;
        if (o) {
            value_of_their_offer = value_of_offer(o, this.values);
        }

        this.log(`new_offer: ${new_offer}, last_offer: ${this.last_offer}, o: ${o} our_value: ${value_of_our_offer} offered_value: ${value_of_their_offer}`);
        this.last_offer = new_offer;

        this.past_our_offers.push(new_offer);
        if (o) {
            this.past_their_offers.push(o);
        }

        // TODO: Check if they have matched any of our old offers or if any
        // of their old offers is better.

        if ((this.rounds === 0 && value_of_their_offer >= Math.floor(this.total / 2)) ||
            (value_of_our_offer <= value_of_their_offer &&
            value_of_their_offer >= Math.floor(this.total / 2))) {
            // Accept their offer.
            return;
        } else {
            return new_offer;
        }
    }
};
