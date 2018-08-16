'use strict'; /*jslint node:true*/

/*
 * Solution sent by Valentin Ionita @vanntile for Hola Haggling Challenge
 */

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.roundsLeft = max_rounds;
        this.no = 0;
        this.log = log;

        // this.total is the total value of the items
        this.total = 0;
        // how much do I want
        this.limit = 0.5;
        // an useful array of zeroes
        this.zero = new Array(this.counts.length).fill(0);

        // this.offers is an array of the offers received
        this.offers = [];
        this.offers.push(this.counts.slice());
        // my last offer
        this.lastoffer = this.zero.slice();
        // this.valuesSummed is an array of the total values of each category
        this.valuesSummed = [];
        for (let i = 0; i < counts.length; i++) {
            let j = counts[i] * values[i];
            this.valuesSummed.push(j);
            this.total += j;
        }
        let max = Math.max(...this.valuesSummed);
        // what I like to get, as a probability
        this.like = this.valuesSummed.map(x => x / max);
        // gradient
        this.gradient = [];
        this.gradient.push(this.zero.slice());
        // weights
        this.weights = [];

        /*
         * Defining local functions
         */
        this.compareArrays = function(array1, array2) {
            for (let i = 0; i < array1.length; ++i) {
                if (array1[i] != array2[i])
                    return 0;
            }
            return 1;
        };

        this.update = function() {
            var idx,
                o = Array.from(this.zero),
                lastoffer = Array.from(this.lastoffer),
                weights = Array.from(this.weights);

            
            for (idx = 0; idx < this.counts.length; ++idx) {
                if (this.like[idx] === 0) {
                    o[idx] = 0;
                } else{
                    if (this.like[idx] + weights[idx] >= 1) {
                        if (lastoffer[idx] !== this.counts[idx]) {
                            o[idx] = lastoffer[idx] + 1;
                        } else {
                            o[idx] = lastoffer[idx];
                        }
                    } else {
                        if (lastoffer[idx] !== 0) {
                            o[idx] = lastoffer[idx] - 1;
                        } else {
                            o[idx] = lastoffer[idx];
                        }
                    }
                }
            }

            this.lastoffer = o.slice();
            return this.lastoffer;
        };
    }
    offer(o){
        this.roundsLeft--;

        if (!o) {
            if (Math.random() > 0.5) {
                // Offer all zero values initially
                o = this.counts.slice();
                for (let i = 0; i < o.length; i++) {
                    if (this.values[i] === 0)
                        o[i] = 0;
                }
                this.lastoffer = o.slice();
                return o;
            } else {
                // Offer nothing to keep the data upper hand
                this.lastoffer = this.counts.slice();
                return this.counts;
            }
        } else {
            /* 
             * If the offer's value is greater than this.total * this.limit
             * accept, whatever happens.
             */
            let sum = this.values.reduce((acc, curr, idx) => {
                return acc + curr * o[idx];
            }, 0);
            if (sum >= this.total * this.limit) {
                return;
            }

            // new offer received
            this.no++;
            this.offers.push(o.slice());
            // calculate the latest gradient
            this.gradient.push([]);
            o.forEach((x, i) => {
                this.gradient[this.no][i] = this.offers[this.no - 1][i] - x;
            });
        }

        if (this.roundsLeft === 1) {
            /*
             * We'll try the best of the previous received offers and hope
             */

            var bestoffer = 1,
                bestsum = 0;
            for (let i = 1; i < this.offers.length; ++i) {
                let sum = 0;
                for (let j = 0; j < this.values.length; ++j) {
                    sum = sum + this.values[j] * this.offers[i][j];
                }

                if (sum > bestsum) {
                    bestsum = sum;
                    bestoffer = i;
                }
            }

            o = this.offers[bestoffer].slice();
            return o;
        }


        /*
         * We try a version based on gradients and weights to update our
         * lastoffer with to the new offer, o;
         * Each time we get a new offer we calculate the new gradient then we
         * recalculate the weigth based on how many rounds passed.
         * Afterwards, we update the lastoffer based on weights and what I like.
         */

        // recalculating weights
        this.weights = this.zero.slice();
        for (let i = 1; i <= this.no; ++i) {
            for (let j = 0; j < this.counts.length; ++j) {
                if ((Math.sign(this.gradient[i][j]) !== -1) &&
                    (this.offers[i][j] !== this.counts[j])) {
                    this.weights[j]++;
                }
            }
        }
        for(let i = 0; i < this.counts.length; ++i) {
            this.weights[i] = this.weights[i] / this.no;
        }

        return this.update();;


        /*
         * Return the same offer
         */
        o.forEach((_, idx) => {
            o[idx] = this.counts[idx] - o[idx];
        });
        this.lastoffers = o.slice();
        return o;
    }
};