'use strict';
/*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;
        this.maxTotal = this.total(counts);
        this.first = true;
        this.myLast = !!me;
        this.setMyZeros();
        this.hisZeros = new Set();
        this.itemCount = 0;
        this.offers = [];
        this.minAccepteble = this.maxTotal * 0.75;
        for (let i = 0; i < counts.length; i++)
            this.itemCount += counts[i];
    }

    total(counts) {
        if (!counts) return 0;
        let sum = 0;
        for (let i = 0; i < counts.length; i++)
            sum += counts[i] * this.values[i];
        return sum;
    }

    setMyZeros() {
        this.myZeros = new Set([]);
        for (let i = 0; i < this.values.length; i++)
            if (this.values[i] == 0)
                this.myZeros.add(i);
    }

    setHisZeros(o) {
        if (!o || this.offers.length > 0)
            return;
        for (let i = 0; i < this.values.length; i++)
            if (this.counts[i] == o[i])
                this.hisZeros.add(i);
    }

    logOffer(log, o) {
        if (!o)
            return;
        let res = [];
        res.push(this.total(o));
        for (let i = 0; i < o.length; i++) {
            res.push({v: this.values[i], c: this.counts[i], o: o[i]});
        }
        res.push(this);
        this.log(log + JSON.stringify(res));
    }

    minOffer() {
        if (this.rounds > this.max_rounds / 2)
            return this.maxTotal; // наверняка потом предложат по-лучше
        const minRate = 0.4;
        let rate = minRate + (1 - minRate) * this.rounds / this.max_rounds;
        if (this.rounds <= 1)
            rate = 0.3;
        return this.maxTotal * rate;
    }

    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.logOffer("he ==> ", o);
        this.setHisZeros(o);
        if (o)
            this.offers.push(o);
        if (o && !this.first) // в первом раунде не соглашаемся, смотрим что будет дальше
        {
            let sum = this.total(o);
            if (sum >= Math.max(this.minOffer(), this.minAccepteble))
                return;
        }
        let myOffer = this.counts.slice();
        for (let i of this.myZeros) {
            myOffer[i] = 0;
        }
        if (!this.first && o) {
            myOffer = this.myOffer(o);
        }
        this.first = false;
        this.logOffer("me ==> ", myOffer);
        this.rounds--;
        if (!this.myLast && this.rounds == 0 && this.total(o) > 0)
            return; // хоть что-то
        if (this.total(myOffer) <= this.total(o))
            return; // просто соглашаемся
        return myOffer;
    }

    bestOffer() {
        if (this.offers.length == 0)
            return [0];
        let sorted = this.offers.sort((a, b) => this.total(b) - this.total(a));
        return sorted[0];
    }

    myOffer(o) {
        let items = [];
        for (let i = 0; i < this.values.length; i++) {
            let sort = this.values[i]
            //let sort = this.values[i] + (this.hisZeros.has(i) ? 0 : 0.5); // не нужно?
            if (!this.hisZeros.has(i))
                items.push({num: i, val: this.values[i], count: this.counts[i], ord: sort});
        }
        items.sort((a, b) => a.ord - b.ord);
        let myOffer = this.counts.slice();
        let min = this.minOffer();
        this.log("min: " + min);
        while (true) {
            let item = items[0];
            if (!item)
                break;
            if (item.count <= 0) {
                items.shift();
                continue;
            }
            if (this.total(myOffer) - item.val < min)
                break;
            item.count--;
            myOffer[item.num] = item.count;
            this.log(JSON.stringify(myOffer));
            this.log(JSON.stringify(items));
            //this.itemCount += counts[i];
        }
        this.log("total: " + this.total(myOffer));

        let bestOffer = this.bestOffer();
        if (this.total(myOffer) < this.total(bestOffer))
            return bestOffer;
        return myOffer;
    }
};
