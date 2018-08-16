'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts; // array of numbers of every item
        this.values = values; // array of item values
        this.max_rounds = max_rounds; // number of rounds (5)
        this.rounds = max_rounds; 
        this.log = log;
        this.total = this.total_value(counts); // total value of a set (10)
        this.best_set = [0, 0, 0]; // best set suggested by the opponent
        this.first = false; // i'm the first or second
        this.possible_sets = this.all_sets(counts);
        this.set_index = 0;
        this.last_op_suggestion = [20, 20, 20]; // the last set syggested by the opponent
    }

    offer(suggestion){
        this.rounds--;
        // if we get a suggestion
        if (suggestion) {
            // if we get the max value set, agree
            if (this.total_value(suggestion) === this.total) {
                return;
            }

            // save the best set suggested by the opponent
            if (this.total_value(suggestion) > this.total_value(this.best_set)) {
                this.best_set = suggestion;
            }

            // if last round, suggest the max value set suggested by the opponent
            // or agree on its last suggestion if it's not 0 for me
            if (this.rounds === 0) {
                if (this.first) {return this.best_set;}
                if (this.total_value(suggestion) !== 0) {return;}
            }

            if (this.rounds === 1) {
                this.last_op_suggestion = suggestion;
            } else {
                // if the opponent is not a good person and don't want to haggle, we don't want it either
                if (suggestion.toString() === this.last_op_suggestion.toString()) {
                    return this.possible_sets[this.set_index-1];
                }
            }

            // if we get more valuable set than we're gonna suggest, agree
            if (this.total_value(suggestion) >= this.total_value(this.possible_sets[this.set_index]))
            {
                return;
            } else {
                // if we're gonna suggest less valuable set than the best, return the best
                if (this.total_value(this.best_set) > this.total_value(this.possible_sets[this.set_index])) {
                    return this.best_set;
                } else {
                // suggest a set with less value
                return this.less_value_set();
                }
            }

        } else {
            // if we make a suggestion first
            // make the suggestion with the max value
            this.first = true;
            return this.less_value_set();
        }
    }

    less_value_set(){
        if (this.possible_sets.length - 2 === this.set_index) {
            return this.possible_sets[this.possible_sets.length - 2];
        }
        this.set_index += 1;
        return this.possible_sets[this.set_index-1];
    }

    all_sets(counts){
        var max_v_set = counts;

        var items = []; // array of all possible numbers of every item
        for (let i = 0; i<max_v_set.length; i++){
            items.push([]);
            for (let j = 0; j<max_v_set[i]+1; j++){
                items[i].push(max_v_set[i]-j);
            }
        }

        var all_possible_sets = this.cartesianProduct(items);
        for (let i = 0; i<all_possible_sets.length; i++){
            all_possible_sets[i].push(this.total_value(all_possible_sets[i]));
        }
        
        all_possible_sets.sort(this.sortfunc).reverse();

        for (let i = 0; i<all_possible_sets.length; i++){
            all_possible_sets[i].pop();
        }
        return all_possible_sets;
    }

    sortfunc(a, b) {
        if (a[a.length-1] < b[b.length-1]) {
            return -1;
        }
        if (a[a.length-1] > b[b.length-1]) {
            return 1;
        }
        return 0;
    }

    cartesianProduct(arr) {
        return arr.reduce(function(a,b){
            return a.map(function(x){
                return b.map(function(y){
                    return x.concat(y); 
                }) 
            }).reduce(function(a,b){
                return a.concat(b)
            },[]) }, [[]]) }

    total_value(suggestion){
        // total price of the item set suggested
        var total = 0;
        for (let i = 0; i<this.values.length; i++)
            total += suggestion[i] * this.values[i];
        return total;
    }
};
