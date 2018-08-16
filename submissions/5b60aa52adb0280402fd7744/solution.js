'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];

        this.bestSumOffer = 0;
        this.immediateAcceptThreshold = this.total * (1 - 0.2718); // e
        this.leapThreshold = Math.ceil(this.max_rounds * 0.36787944117); // 1/e
        this.acceptSumAfterLeapThreshold = this.total / 2;
        this.log(`It is I, I immediately will accept at ${this.immediateAcceptThreshold}, will leap at round ${this.leapThreshold} for the amount of ${this.acceptSumAfterLeapThreshold}`);

        this.offersGraph = [];
        this.passOffers = [];
        this.buildOfferGraph();

    }
    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        // should I accept? -- optimal stop solution (1/e), detect aggressive behavior
        if (o) {
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            this.log(`The counter offer sum is ${sum}, the best offer yet is ${this.bestSumOffer}`);
            if (sum >= this.immediateAcceptThreshold) { // if the sum offered is greater then a threshold, agree
                this.log(`I accept, for ${sum} is greater or equal to my immediateAcceptThreshold at ${this.immediateAcceptThreshold}`);
                return;
            }

            // TODO: case I see the same too aggressive behavior

            if (this.rounds <= this.leapThreshold) // if the current amount of rounds is greater then the leap threshold which is 1/e of the total rounds amount
                if (sum >= this.bestSumOffer && sum >= this.acceptSumAfterLeapThreshold) { // accept only if the sum is greater or equal then the accepted threshold after leap
                    this.log(`I accept, for I already leaped and ${sum} is greater or equal to the best offer and my acceptSumAfterLeapThreshold at ${this.acceptSumAfterLeapThreshold}`);
                    return;
                }
            this.bestSumOffer = sum > this.bestSumOffer ? sum : this.bestSumOffer; // update best offer sum
        }
        // make an offer -- give minimum items, maximize own items value, make the counter side to make a good counter offer.
        o = this.makeOffer();
        this.passOffers.push(o);
        this.log(`This is my I offer ${o.print()}`);
        return o.myItems;
    }
    makeOffer() {
        this.log(`making an offer`);
        let o = this.offersGraph.shift();
        // if offer stack is empty
        if (!o) {
            if (this.passOffers.length <= 0) return this.defaultOffer();
            this.offersGraph = this.passOffers;
            this.passOffers = [];
            o = this.makeOffer();
        }
        // find the delta in items from the last offer
        let lastPassOffer = this.passOffers.length > 0 ? this.passOffers[this.passOffers.length - 1] : null;
        if (lastPassOffer && this.findDelta(o, lastPassOffer) < 0) { // since the last offer is same or worse to current offer, get a better offer
            o = this.makeOffer();
        }
        return o && o.sum >= this.acceptSumAfterLeapThreshold ? o : this.defaultOffer();
    }
    // find the delta from the last offer
    findDelta(o, lo) {
        let delta = 0;
        for (var i in o.counterItems) {
            delta += o.counterItems[i] - lo.counterItems[i];
        }
        this.log(`delta ${delta}`);
        return delta;
    }
    defaultOffer() {
        return new Offer("default", this.counts, [], this.values);
    }
    buildOfferGraph() {
        this.log(`counts: ${JSON.stringify(this.counts)}`);
        this.log(`values: ${JSON.stringify(this.values)}`);
        let mi = []; // my items
        let ci = []; // counter items
        let n = 0; // id - number of offers
        let c = 0; // count the index in counts array

        // recursive - get every option of items
        let colfunc = (c) => {

            // build the base all zeroes offer
            if (c == this.counts.length) {
                let a = [];
                a[0] = [];
                for (let i = 0; i < this.counts.length; i++) {
                    a[0][i] = 0;
                }
                return a;
            }
            // recursive, each item possibility created in its turn
            let r_arr = [];
            let o_arr = colfunc(c + 1);
            for (let j = 0; j <= this.counts[c]; j++) {
                for (let i = 0; i < o_arr.length; i++) {
                    var arr = o_arr[i].slice();
                    arr[c] = j;
                    r_arr.push(arr);
                }
            }
            return r_arr;
        }
        let a = colfunc(c);
        // build offer object from items options
        for (let i = 0; i < a.length; i++) {
            mi = a[i];
            for (let j = 0; j < a[i].length; j++) {
                ci.push(this.counts[j] - a[i][j]); // calc the counter items
            }
            let offer = new Offer(n, mi, ci, this.values);
            if (offer.sum >= this.acceptSumAfterLeapThreshold) { // don't even push offers that are lower sum than acceptSumAfterLeapThreshold
                this.offersGraph.push(offer);
                n++
            }
            ci = [];
        }
        // sort highest sum top
        this.offersGraph.sort((a, b) => {
            return b.sum - a.sum;
        });
        // print offers graph
        for (let o in this.offersGraph) {
            this.log(`graph: ${this.offersGraph[o].print()}`);
        }
    }
};

class Offer {
    constructor(id, myItems, counterItems, values) {
        this.id = id;
        this.values = values;
        this.myItems = myItems;
        this.counterItems = counterItems;
        this.calcSum();
        this.calcNumOfItems();
    }
    calcSum() {
        this.sum = 0;
        for (let i = 0; i < this.values.length; i++) {
            this.sum += this.values[i] * this.myItems[i];
        }
    }
    calcNumOfItems() {
        this.numOfCounterItems = 0;
        for (let i = 0; i < this.counterItems.length; i++) {
            this.numOfCounterItems += this.counterItems[i];
        }
    }
    print() {
        return `offer #${this.id} sum: ${this.sum} myitems: ${JSON.stringify(this.myItems)} numOfCounterItems: ${this.numOfCounterItems} counteritems: ${JSON.stringify(this.counterItems)}`;
    }
}