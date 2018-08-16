'use strict'; /*jslint node:true*/

// helpers
const stringify_array_of_arrays = arr => arr.map(x=>`(${x.toString()})`).join(';');
const calc_gain = (offer, valuation) => offer.map((offer_item,i)=>offer_item*valuation[i]).reduce((a, b) => a + b, 0);
const make_range = (num, min, max) => [...Array(num).keys()].map(i => min + (max-min)*i/(num-1));


//require('./global.js')

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.n = counts.length;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;


        this.total = calc_gain(counts, values);

        this.log(`Initial values: Counts:(${this.counts}) Valuation:(${this.values}) Total:${this.total}`);

        // n, counts, total
        let _array_equals = function(x1, x2){
            for (let i = 0; i < x1.length; i++) {
                if (x1[i] !== x2[i])
                    return false;
            }
            return true;
        };

        const possible_valuations = function(counts, values, i, current_total, overall_total) {
            let res = [];
            const count = counts[i];
            const max = (overall_total - current_total)/count | 0;
            if (i === counts.length-1) {
                if (current_total + max*count === overall_total) {
                    res.push(values.concat([max]));
                }
            }
            else {
                for (let j = 0; j <= max; j++) {
                    res = res.concat(possible_valuations(counts, values.concat([j]), i+1, current_total+j*count, overall_total));
                }
            }
            return res;
        };

        this.counterpart_options = possible_valuations(counts, [], 0, 0, this.total);
        this.counterpart_options = this.counterpart_options.filter( x => !_array_equals(this.values, x));

        this.offers_own = [];
        this.offers_counter = [];

        this.log(`All possible CP valuation options: ${stringify_array_of_arrays(this.counterpart_options)}`);
    }
    offer(o){
        // hyperparameters
        const counterpart_approve_threshold = 0.5;
        const counterpart_decline_threshold = 0.5; // assume non-altruistic behavior
        // const accept_demand_by_rounds = make_range(this.max_rounds, .45, .8); // mildly altruistic
        // const offer_demand_by_rounds = make_range(this.max_rounds, .5, .9); // somewhat pushy
        // const accept_demand_by_rounds = make_range(this.max_rounds, .45, .8); // semi-altruistic
        // const offer_demand_by_rounds = make_range(this.max_rounds, .5, .8); // somewhat pushy
        const accept_demand_by_rounds = make_range(this.max_rounds, .5, .8); // semi-altruistic
        const offer_demand_by_rounds = make_range(this.max_rounds, .6, .9); // somewhat pushy
        //const accept_demand_by_rounds = [0.5,0.6,0.7,0.7,0.8]; // deviate on the last round
        //const offer_demand_by_rounds = [0.6,0.7,0.8,0.9,1.0];

        // locals
        let _counts = this.counts;
        let _counterpart_options = this.counterpart_options;
        let _log = this.log;

        // helper
        const reverse_offer = offer => _counts.map((count,i) => count-offer[i]);

        const expected_counterpart_gain = function(o) { // o should be reversed
            let sum = 0;
            for (const opt of _counterpart_options) {
                sum += calc_gain(o, opt)
            }
            return sum / _counterpart_options.length;
        };

        const rule_out = function(offers_own, offers_counter, counterpart_options, total) {

            const rational_offer = function(opt) {
                for (let o of offers_own) {
                    if (calc_gain(reverse_offer(o), opt) >= total * counterpart_approve_threshold)
                        return false;
                }
                for (let o of offers_counter) {
                    if (calc_gain(o, opt) < total * counterpart_decline_threshold)
                        return false;
                }
                return true;
            };

            return counterpart_options.filter(opt => !rational_offer(opt))
        };

        _log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o)
        {
            this.offers_counter.push(o);

            const last_count = this.counterpart_options.length;
            this.counterpart_options = rule_out(this.offers_own, this.offers_counter, this.counterpart_options, this.total);
            _log(`Ruled out ${last_count-this.counterpart_options.length} options. Remaining options: ${this.counterpart_options.map(x=>`(${x.toString()})`).join(';')}`);

            const counter_gain = expected_counterpart_gain(reverse_offer(o));
            const my_gain = calc_gain(o, this.values);
            _log(`Partner offer (${o}) expected CP gain ${counter_gain} own gain ${my_gain}`);

            _log(`Demands by rounds: (${accept_demand_by_rounds}) Accepting demand >= ${this.total*accept_demand_by_rounds[this.rounds]}`);
            if (my_gain>=this.total*accept_demand_by_rounds[this.rounds])
                return;
        }

        // some shitty 3rd party code
        const flatten = (arr) => [].concat.apply([], arr);
        const product = (...sets) =>
          sets.reduce((acc, set) =>
            flatten(acc.map(x => set.map(y => [ ...x, y ]))),
            [[]]);

        const all_options = product(...this.counts.map(n => [...Array(n+1).keys()]));

        const considerable_options = all_options.filter(o => calc_gain(o, this.values)
            >= this.total * offer_demand_by_rounds[this.rounds]);

        _log(`Considerable options: (Demands by rounds: (${offer_demand_by_rounds})(min demand ${this.total * offer_demand_by_rounds[this.rounds]}) ${considerable_options.map(x => `(${x.toString()})`).join(';')}`);

        const exp_gains = considerable_options.map(o => expected_counterpart_gain(reverse_offer(o)));

        // even more trashy impl
        const weighted = (...weightMap) => weightMap
          .map(({0: value, 1: weight}) => new Array(weight).fill(value))
          .reduce((acc, current) => [...acc, ...current]);
        const random = (array) => array[Math.floor(Math.random() * array.length)];

        const o_index = random(weighted(...exp_gains.map(x=>Math.round(Math.pow(x,2)*5+1)).map((weight,i) => [i, weight])));
        o = considerable_options[o_index];

        const counter_gain = expected_counterpart_gain(reverse_offer(o));
        const my_gain = calc_gain(o, this.values);

        this.log(`My offer (${o}) expected CP gain ${counter_gain} own gain ${my_gain}`);

        this.offers_own.push(o);

        return o;
    }
};
