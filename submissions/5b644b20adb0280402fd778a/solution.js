'use strict'; /*jslint node:true*/

function getAllSets(counts, values) {
    counts = counts.map((c, i) => values[i] > 0 ? c : 0);
    let numOfSets = counts.reduce((n, c) => n * (c + 1), 1) - 1;
    let divisors = [];
    for (let i = counts.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1] ? divisors[i + 1] * (counts[i + 1] + 1) : 1;
    }

    let getSet = function getSet(n) {
        return counts.map((c, i) => Math.floor(n / divisors[i]) % (c + 1));
    };

    let orders = new Array(numOfSets).fill(0).reduce((results, _, i) => {
        let p = getSet(i + 1);
        !results.some(r => r.join("") === p.join("")) && results.push(p);
        return results;
    }, []);

    let costs = orders.reduce((res, o) => {
        let cost = getCost(o, values);
        res.indexOf(cost) === -1 && res.push(cost);
        return res;
    }, []).sort((a, b) => b - a);

    return costs.map(c => {
        return orders
            .filter(o => getCost(o, values) === c)
            .sort((a, b) => a.reduce((r, i) => r + i) - b.reduce((r, i) => r + i))[0];
    });
}

function getCost(set, values) {
    return (set || []).reduce((cost, s, i) => cost += s * values[i], 0);
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.rounds = max_rounds;
        this.me = me;
        this.step = 0;

        this.getCost = order => getCost(order, values);
        this.total = this.getCost(counts);
        this.orders = getAllSets(counts, values).filter(o => this.getCost(o) >= this.total * 0.4);
    }
    offer(o) {
        let curOrder = this.orders[this.step++] || this.orders[1] || this.orders[0];

        if (this.getCost(o) >= this.getCost(curOrder)) {
            return;
        }

        if ((this.getCost(o) > this.total * 0.2) && this.me && this.step === this.rounds) {
            return;
        }

        return curOrder;
    }
};
