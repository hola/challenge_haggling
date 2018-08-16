'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;                                       // Counts
        this.values = values;                                       // My values
        this.total_rounds = max_rounds;                             // Total number of rounds
        this.left_rounds = max_rounds;                              // Number of remaining rounds
        this.log = log;
        this.total = 0;                                             // Maximal reward (total reward)
        for (let i = 0; i<counts.length; i++) this.total += counts[i]*values[i];
        this.last_reward = this.total;                              // Last reward
        this.me = me;                                               // Flag who start first (0 - I start first, 1 - oponent start first)
        this.oponent_optimal = [];                                  // Optimal offers
        this.optimal_wins = [];                                     // My wins in cases of optimal offers
        this.last_offer = new Array(this.counts.length).fill(0);	// My last offer
        this.special_offer = new Array(this.counts.length).fill(0); // Array with offer of special cases
    }

    offer(o) {
        this.log(`${this.left_rounds} rounds left`);

        // Variables
        let current_reward = 0;
        let wins = [0];
        let index_optimal = 0;

        // Prediction of optimal offers
        if (o != undefined) {
            // Statements
            // If this offer is first offer from oponent
            let stat1 = this.oponent_optimal.length == 0;
            // If oponent change his offer
            let oponent_want = [this.counts[0] - o[0], this.counts[1] - o[1], this.counts[2] - o[2]];
            let stat_offer1 = oponent_want[0] != 0;
            let stat_offer2 = oponent_want[1] != 0;
            let stat_offer3 = oponent_want[2] != 0;
            let stat_offer = this.last_offer[0] != stat_offer1 || this.last_offer[1] != stat_offer2 || this.last_offer[2] != stat_offer3;
            // If this round is third round, oponent change his offer and I start the game (second offer)
            let stat2 = stat_offer && (this.left_rounds == this.total_rounds - 2) && this.me == 0;
            // If this round is second round, oponent change his offer and oponent start the game (second offer)
            let stat3 = stat_offer && (this.left_rounds == this.total_rounds - 1) && this.me == 1;

            if (stat1 || stat2 || stat3) {
                // Detect optimal offers
                this.detect_optimal_offers(stat_offer1, stat_offer2, stat_offer3);
                this.special_offer = this.specials(oponent_want[0], oponent_want[1], oponent_want[2]);
            }

            this.last_offer[0] = stat_offer1;
            this.last_offer[1] = stat_offer2;
            this.last_offer[2] = stat_offer3;

            wins = this.optimal_wins;

            // If detection of optimal offers success
            if (this.optimal_wins.length != 0) {
            	// Index of next offer with maximal win for me
            	index_optimal = this.optimal_wins.indexOf(wins.reduce(function (a, b) {return Math.max(a,b)}));
        	}
        }

        // Acception
        if (o) {
            let sum = 0;
            for (let i = 0; i<o.length; i++) sum += this.values[i]*o[i];

            // Accept if offer more than 70% or more than my last offer
            if (sum >= this.total*0.7 || sum >= this.last_reward) return;

            // Accept if its last round, script have the last word and offer is no zero value
            if (this.left_rounds == 1 && this.me == 1 && sum >= 1) return;
        }

        o = new Array(this.counts.length).fill(0);
        
        // Make offer
        // If special case is detected
        if (this.special_offer[0] + this.special_offer[1] + this.special_offer[2] > 0) o = this.special_offer;
        // If optimazed offers is detected
        else if (this.oponent_optimal.length > 0) {
            o = this.oponent_optimal[index_optimal];
            if (this.oponent_optimal.length > 1) {
                this.oponent_optimal.splice(index_optimal, 1);
                this.optimal_wins.splice(index_optimal, 1);
            }
        }
        else {
            for (let i = 0; i<o.length; i++) {
                if (this.values[i] == 0) o[i] = 0;
                else o[i] = this.counts[i];
            }
        }
        
        for (let i = 0; i < o.length; i++) current_reward += o[i]*this.values[i];

        this.last_reward = current_reward;
        this.left_rounds--;

        return o;
    }

    // Function to detect optimal possible offers (offers which maximazes sum of my win and oponent win)
    detect_optimal_offers(w1, w2, w3) {
        // i,j,k - values of oponent
        // w1,w2,w3 - flags which tell what types of items oponent wants
        // m - optimal offer (its offer which maximazes sum of my win and oponent win) 

        // Variables
        let m = [0, 0, 0];
        let my_win = 0;
        let oponent_win = 0;
        let stat1 = 0;
        let stat2 = 0;
        let stat3 = 0;
        let optimal_possible_offers = [];
        let minimal_wins = [];
        this.oponent_optimal = [];
        this.optimal_wins = [];

        // Values limits
        if (w1 == 1) stat1 = Math.round(this.total/this.counts[0]);
        if (w2 == 1) stat2 = Math.round(this.total/this.counts[1]);
        if (w3 == 1) stat3 = Math.round(this.total/this.counts[2]);

        // Detection of optimal possible offers
        for (let i = 0; i <= stat1; i++) {
            for (let j = 0; j <= stat2; j++) {
                for (let k = 0; k <= stat3; k++) {
                    // If sum equal to total value and its no my values
                    if (this.counts[0]*i + this.counts[1]*j + this.counts[2]*k == this.total && !(this.values[0] == i && this.values[1] == j && this.values[2] == k)) {
                        m = this.detect_optimal_offer_by_values(this.counts[0], this.counts[1], this.counts[2], this.values[0], this.values[1], this.values[2], i, j, k);
                        my_win = m[0]*this.values[0] + m[1]*this.values[1] + m[2]*this.values[2];
                        oponent_win = (this.counts[0]-m[0])*i + (this.counts[1]-m[1])*j + (this.counts[2]-m[2])*k;

                        // If m its new optimal offer combination add it to the array of optimal offers
                        if (this.find_value(optimal_possible_offers, m) == -1) {
                            minimal_wins.push(my_win);
                            optimal_possible_offers.push(m);
                        }
                    }
                }
            }
        }

        this.oponent_optimal = optimal_possible_offers;
        this.optimal_wins = minimal_wins;
    }

    // Function to detect optimal offer (offer which maximazes sum of my win and oponent win) by counts, my values and oponent values
    detect_optimal_offer_by_values(a1, a2, a3, u1, u2, u3, x1, x2, x3) {
        // a1,a2,a3 - counts of items
        // u1,u2,u3 - my values
        // x1,x2,x3 - oponent values
        // m - optimal offer (what I want to keep myself)

        let m = [0, 0, 0];
        let max = 0;
        let value = 0;

        for (let i = 0; i <= this.counts[0]; i++) {
            for (let j = 0; j <= this.counts[1]; j++) {
                for (let k = 0; k <= this.counts[2]; k++) {
                    value = (a1-i)*x1 + (a2-j)*x2 + (a3-k)*x3 + u1*i + u2*j + u3*k;
                    if (value > max) {
                        max =value;
                        m[0] = i; m[1] = j; m[2] = k;
                    }
                }
            }
        }

        return m;
    }

    // Function to check if values set exist in the array
    find_value(array, value) {
        for (let i = 0; i < array.length; i++) {
        	if (array[i][0] == value[0] && array[i][1] == value[1] && array[i][2] == value[2]) return i;
        }

        return -1;
    }

    // Function to check special cases
    specials(w1, w2, w3) {
        if (w1 == 0 && w2 == 0 && w3 == 2) return [this.counts[0], this.counts[1], 1];
        else if (w1 == 0 && w2 == 2 && w3 == 0) return [this.counts[0], 1, this.counts[2]];
        else if (w1 == 2 && w2 == 0 && w3 == 0) return [1, this.counts[1], this.counts[2]];

        return [0, 0, 0];
    }
};