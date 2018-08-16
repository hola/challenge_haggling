'use strict'; /*jslint node:true*/
// in my coordinates: my_offer, enemy_offer_invert
// in enemy coordinates: enemy_offer, my_offfer_invert

function make_value_combination(counts, values, index, total) {
    if (index >= counts.length) {
        let local_sum = 0;
        for (let i = 0; i < counts.length; i++) {
            local_sum += counts[i] * values[i];
        }
        if (local_sum == total) {
            return [values.slice()];
        } else {
            return [null];
        }
    } else {
        let combs = [];
        for (let i = 0; i <= total; i++) {
            values[index] = i;
            var comb = make_value_combination(counts, values, index + 1, total);
            for (let j = 0; j < comb.length; j++) {
                if (comb[j] != null) {
                combs.push(comb[j]);
            }
            }
            
        }
        return combs;
    }

}

function make_all_value_combination(counts, total) {
    var values = [];
    var index = 0;
    var all_combs = make_value_combination(counts, values, index, total)
    return all_combs;
}

function find_top_value_combs(total_value_combs, enemy_offers) {
    var top_value_combs = [];
    var max_sum = -1;
    for (let i = 0; i < total_value_combs.length; i++) {
        let local_sum = 0;
        for (let o_index = 0; o_index < enemy_offers.length; o_index++) {
            for (let j = 0; j < total_value_combs[i].length; j++) {
                local_sum += enemy_offers[o_index][j] * total_value_combs[i][j];
            } 
        }
        if (local_sum == max_sum) {
            top_value_combs.push(total_value_combs[i]);
        } else if (local_sum > max_sum) {
            max_sum = local_sum;
            top_value_combs = [];
            top_value_combs.push(total_value_combs[i]);
        }
    }
    return top_value_combs;
}

function add_it_offer(self, offer) {
    var off = []
    for (let i = 0; i < self.counts.length; i++) {
        off.push(self.counts[i] - offer[i])
    }
    self.enemy_offers.push(off);
}

function make_count_comb(counts, max_counts, index) {
    if (index >= max_counts.length) {
        return [counts.slice()];
    } else {
        let combs = [];
        for (let i = 0; i <= max_counts[index]; i++) {
            counts[index] = i;
            var comb = make_count_comb(counts, max_counts, index + 1);
            for (let j = 0; j < comb.length; j++) {
                if (comb[j] != null) {
                    combs.push(comb[j]);
                }
            }
        }
        return combs;
    }
}

function make_all_counts_comb(max_counts) {
    var counts = [];
    var index = 0;
    var all_combs = make_count_comb(counts, max_counts, index)
    return all_combs;
}

function calc_sum(values, counts) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i] * counts [i];
    }
    return sum;
}

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
  }

module.exports = class Agent {

    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.current_round = 0;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.total_value_combs = make_all_value_combination(this.counts, this.total)
        this.enemy_offers = [];
        this.total_count_combs = make_all_counts_comb(this.counts)
        this.log(values)
        this.my_offers = []
        // this.log(this.total_count_combs)
    }

    offer(o) {
        this.log(`${this.current_round} current round`);
        this.current_round++;

        //check maximum for me
        if (this.check_max_value(o)) {
            return;
        }

        //turn preparation
        if (o) {
            add_it_offer(this, o);
            var top_value_combs = find_top_value_combs(this.total_value_combs, this.enemy_offers, this.counts)
            // this.log(top_value_combs);
        } else {
            return this.counts;
        }


        let winscore_pairs = this.make_winscore_pairs(this.values, this.total_count_combs, this.total_value_combs, this.enemy_offers)
        // this.log("winscore_pairs count:" + winscore_pairs.length);
        //try to accept their offer
        let best_pair = null;
        if (this.try_accept_enemy_offer(winscore_pairs, o, best_pair)) {
            this.log("accept their offer")
            return;
        }

        //try to select best offer
        best_pair = this.try_select_optimal_pair(winscore_pairs);
        if (best_pair == null) {
            this.log("Best pair is null")
            return;
        }
        this.my_offers.push(best_pair.counts);
        return best_pair.counts;
    }

    check_max_value(o) {
        if (o) {
            let sum = 0;
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
            if (sum>=this.total)
                return true; 
        } 
        return false;   
    }

    invert_count(old_counts) {
        let new_counts = []
        for (let i = 0; i < this.counts.length; i++) {
            new_counts.push(this.counts[i] - old_counts[i])
        }
        return new_counts
    }

    make_winscore_pairs(values, all_count_combs, enemy_value_combs, enemy_offers) {
        let pairs_array = []
        for (let i = 0; i < all_count_combs.length; i++) {
            let pair = {};
            let my_sum = calc_sum(all_count_combs[i], values);
            let enemy_total_sum = 0;
            let enemy_total_count = 0;
            for (let e_index = 0; e_index < enemy_value_combs.length; e_index++) {
                // for (let eoi = 0; eoi < enemy_offers.length; eoi++) {
                //     enemy_total_count++;
                //     enemy_total_sum += calc_sum(enemy_value_combs[e_index], enemy_offers[eoi]);
                // }
                enemy_total_count++;
                enemy_total_sum += calc_sum(enemy_value_combs[e_index], this.invert_count(all_count_combs[i]));
            }
            if (enemy_total_sum == 0) {
                continue
            }
            pair.my_sum = my_sum;
            pair.enemy_sum = enemy_total_sum / enemy_total_count;
            pair.counts = all_count_combs[i];
            pairs_array.push(pair);
        }
        return pairs_array
    }

    select_pairs_in_borders(winscore_pairs, my_border, enemy_border, max_my_border=10, max_enemy_border=10) {
        let pairs = []
        for (let i = 0; i < winscore_pairs.length; i++) {
            let pair = winscore_pairs[i]
            if (pair.my_sum >= my_border && pair.my_sum <= max_my_border
                && pair.enemy_sum >= enemy_border && pair.enemy_sum <= max_enemy_border) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    find_top_pairs_with_max_diff(winscore_pairs, interval) {
        let top_pairs = []

        let max_diff = 0.0;
        for (let i = 0; i < winscore_pairs.length; i++) {
            let pair = winscore_pairs[i]
            let diff = pair.my_sum - pair.enemy_sum;
            if (diff > max_diff) {
                max_diff = diff;
            }
        }
        for (let i = 0; i < winscore_pairs.length; i++) {
            let pair = winscore_pairs[i]
            let diff = pair.my_sum - pair.enemy_sum;
            if (Math.abs(diff - max_diff) <= interval) {
                top_pairs.push(pair);
            }                        
        }
        return top_pairs;
    }

    remove_used_before_pairs(pairs_array) {
        let used_index = []
        for (let i = 0; i < pairs_array.length; i++) {
            let is_used = false
            for (let j = 0; j < this.my_offers; j++) {
                let is_same = true
                for (k = 0; k < this.my_offers[j].length; k++) {
                    if (pairs_array[i].counts[k] != this.my_offers[j][k]) {
                        is_same = false;
                    }
                is_used |= is_same
                }
            }
            if (is_used) {
                used_index.push(i);
            }
        }
        for (let i = used_index.length - 1; i >= 0; i--) {
            pairs_array.splice(used_index[i], 1);
        }
    }

    try_select_optimal_pair(winscore_pairs) {
        this.log("try_select_optimal_pair");
        let baa = [
        [ 
            { mbb: 7, ebb: 0, mtb: 10, etb: 8, diff: 1},
        ],
        [ 
            { mbb: 7, ebb: 0, mtb: 10, etb: 8, diff: 1},
        ],
        [ 
            { mbb: 7, ebb: 0, mtb: 10, etb: 8, diff: 1},
        ],
        [ 
            { mbb: 8, ebb: 0, mtb: 10, etb: 8, diff: 1},
        ],
        [ 
            { mbb: 8, ebb: 0, mtb: 10, etb: 8, diff: 1},
            { mbb: 6, ebb: 0, mtb: 10, etb: 7, diff: 1},
        ]
        ]
        var borders_array = baa[this.current_round - 1];
        this.remove_used_before_pairs(winscore_pairs)
        for (let i = 0; i < borders_array.length; i++) {
            var border_data = borders_array[i]
            var higher_pairs = this.select_pairs_in_borders(winscore_pairs, border_data.mbb, border_data.ebb, border_data.mtb, border_data.etb);
            var top_pairs = this.find_top_pairs_with_max_diff(higher_pairs, border_data.diff);
            // for (let ti = 0; ti < higher_pairs.length; ti++) {
            //     this.log(higher_pairs[ti].counts);
            // }
            this.log("_____")
            for (let ti = 0; ti < top_pairs.length; ti++) {
                this.log(top_pairs[ti].counts);
            }
            
            
            if (top_pairs.length > 0) {
                let best_pair = top_pairs[randomInteger(0, top_pairs.length - 1)];
                return best_pair;
            }
        }
        
        if (winscore_pairs.length > 0) {
            return winscore_pairs[randomInteger(0, winscore_pairs.length - 1)];
        }
        return null;   

         
    }

    try_accept_enemy_offer(winscore_pairs, enemy_offer_invert) {
        this.log("try to accept enemy offer");
        let my_pair = null;
        for (let i = 0; i < winscore_pairs.length; i++) {
            let pair = winscore_pairs[i]
            let equal = true;
            for (let j = 0; j < pair.counts.length; j++) {
                if (enemy_offer_invert[j] != pair.counts[j]) {
                    equal = false;
                    break;
                }
            }
            if (equal) {
                my_pair = pair;
                break;
            }
        }
        if (my_pair == null) {
            this.log("cant find pair when try to accept enemy offer");
            return false;
        }
        this.log("my sum: " +  my_pair.my_sum + " enemy_sum: " + my_pair.enemy_sum);
        if (my_pair.my_sum > my_pair.enemy_sum && my_pair.my_sum >= 8) {
            return true;
        } 
        if (this.current_round == 5 && ((my_pair.my_sum > my_pair.enemy_sum && my_pair.my_sum >=7) || (my_pair.my_sum >= 8 && my_pair.enemy_sum < 9.5 ))) {
            return true;
        }
        return false;

    }
};








