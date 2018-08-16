const __exports = {};

const define = function (moduleName, dependencies, callback) {
    const moduleExports = __exports[moduleName] = {};
    const args = [null, moduleExports];
    for (let i = 2; i < dependencies.length; i++) {
        args.push(__exports[dependencies[i]]);
    }
    callback.apply(null, args)
}
var Order;
(function (Order) {
    Order[Order["Asc"] = 0] = "Asc";
    Order[Order["Desc"] = 1] = "Desc";
})(Order || (Order = {}));
Array.prototype.orderBy = function (...predicates) {
    const compare = (a, b) => {
        for (let item of predicates) {
            const aValue = item.selector(a);
            const bValue = item.selector(b);
            if (item.order === Order.Asc && aValue > bValue || item.order === Order.Desc && aValue < bValue) {
                return 1;
            }
            if (item.order === Order.Asc && aValue < bValue || item.order === Order.Desc && aValue > bValue) {
                return -1;
            }
        }
        return 0;
    };
    return this.sort(compare);
};
Array.prototype.equal = function (other) {
    if (this.length !== other.length) {
        return false;
    }
    for (let i = 0; i < this.length; i++) {
        if (this[i] !== other[i]) {
            return false;
        }
    }
    return true;
};
define("solution", ["require", "exports", "./array"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HistoryItem {
        constructor(me, offer) {
            this.me = me;
            this.offer = offer;
        }
    }
    class Offer {
        constructor(counts, value, p) {
            this.counts = counts;
            this.value = value;
            this.p = p;
            this.count = counts.reduce((acc, count) => acc + count);
        }
    }
    class RivalValues {
        constructor(values, value, p) {
            this.values = values;
            this.value = value;
            this.p = p;
        }
    }
    const randomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    module.exports = class {
        constructor(me, counts, values, max_rounds, log) {
            this.counts = counts;
            this.values = values;
            this.max_rounds = max_rounds;
            this.log = log;
            this.round = 0;
            this.history = [];
            this.myFirstP = 0.9;
            this.myLastButOneP = 0.6;
            this.myLastP = 0.2;
            this.rivalFirstP = 0.9;
            this.rivalLastP = 0.4;
            this.epsilonP = 0.05;
            this.me = me === 0;
            this.length = counts.length;
            this.totalValue = this.getValue(counts, values);
            this.allOffers = this.getAllOffers();
            this.allRivalValues = this.getAllRivalValues();
            this.myProbabilities = this.getMyProbabilities();
            this.rivalProbabilities = this.getProbabilities(this.rivalFirstP, this.rivalLastP, this.max_rounds);
        }
        getValue(o, values = this.values) {
            return o.reduce((acc, count, i) => acc + count * values[i], 0);
        }
        getAllOffers() {
            const allOffers = [];
            this.setNextOffers(new Array(), 0, allOffers);
            allOffers.orderBy({ order: Order.Desc, selector: _ => _.value });
            return allOffers;
        }
        setNextOffers(counts, index, allOffers) {
            for (let count = 0; count <= this.counts[index]; count++) {
                counts[index] = count;
                counts.fill(0, index + 1);
                if (index === this.length - 1) {
                    const copy = counts.slice();
                    const value = this.getValue(copy);
                    const p = this.getP(value);
                    allOffers.push(new Offer(copy, value, p));
                }
                if (index + 1 < this.length) {
                    this.setNextOffers(counts, index + 1, allOffers);
                }
            }
        }
        getAllRivalValues() {
            const allValues = [];
            this.setNextRivalValues(new Array(this.length), 0, allValues);
            return allValues;
        }
        setNextRivalValues(values, index, allValues) {
            for (let value = 0; value <= this.totalValue; value++) {
                values[index] = value;
                values.fill(0, index + 1);
                const totalValue = this.getValue(this.counts, values);
                if (totalValue > this.totalValue) {
                    break;
                }
                if (totalValue === this.totalValue && index === this.length - 1) {
                    allValues.push(values.slice());
                }
                if (index + 1 < this.length) {
                    this.setNextRivalValues(values, index + 1, allValues);
                }
            }
        }
        getMyProbabilities() {
            const result = this.getProbabilities(this.myFirstP, this.myLastButOneP, this.max_rounds - 1);
            result.push(this.myLastP);
            return result;
        }
        getProbabilities(firstP, lastP, count = this.max_rounds) {
            const delta = (lastP - firstP) / (count - 1);
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(firstP + delta * i);
            }
            return result;
        }
        getP(value) {
            return value / this.totalValue;
        }
        inverse(o) {
            return o.map((count, i) => this.counts[i] - count);
        }
        getRivalCountStatistics() {
            const rivalHistory = this.history.filter(_ => !_.me);
            const result = new Array(this.length);
            result.fill(0);
            for (let item of rivalHistory) {
                for (let i = 0; i < this.length; i++) {
                    result[i] += item.offer[i];
                }
            }
            for (let i = 0; i < this.length; i++) {
                result[i] = result[i] / rivalHistory.length;
            }
            return result;
        }
        valuesCount(values) {
            return values.reduce((acc, value) => acc + value > 0 ? 1 : 0, 0);
        }
        excludeFreeCounts(offers) {
            return offers.filter(offer => !offer.counts.some((count, i) => count > 0 && this.values[i] === 0));
        }
        excludeEverything(offers) {
            return offers.filter(offer => !offer.counts.equal(this.counts));
        }
        getAvailableOffers() {
            let allOffers = this.excludeFreeCounts(this.allOffers);
            if (allOffers.length > 1) {
                allOffers = this.excludeEverything(allOffers);
            }
            let p = this.myProbabilities[this.round];
            if (p > allOffers[0].p) {
                p = allOffers[0].p - this.epsilonP;
            }
            return allOffers.filter(_ => _.p >= p);
        }
        diff(counts1, counts2) {
            return counts1.reduce((acc, count, i) => acc + Math.pow(count - counts2[i], 2), 0);
        }
        findFirstOffer() {
            let myOffers = this.allOffers.filter(_ => _.p >= 1);
            if (myOffers.length > 1) {
                myOffers = this.excludeEverything(this.excludeFreeCounts(myOffers));
            }
            else {
                myOffers = this.excludeFreeCounts(this.allOffers);
                const filtered = myOffers.filter(_ => _.p >= this.myFirstP && _.p < 1);
                if (filtered.length > 0) {
                    myOffers = filtered;
                }
            }
            const index = randomInt(0, myOffers.length - 1);
            return myOffers[index].counts;
        }
        findOffer() {
            let myOffers = this.getAvailableOffers();
            const rivalHistory = this.history.filter(_ => !_.me);
            if (rivalHistory.length > 0) {
                const countStatistics = this.getRivalCountStatistics();
                const countStatisticsP = countStatistics.map((count, i) => count / this.counts[i]);
                const allRivalValues = this.allRivalValues.map(values => {
                    const value = this.getValue(countStatistics, values);
                    return new RivalValues(values, value, this.getP(value));
                });
                allRivalValues.orderBy({ order: Order.Desc, selector: _ => _.value }, { order: Order.Desc, selector: _ => this.valuesCount(_.values) });
                const rivalValues = allRivalValues[0].values;
                const myOffersMap = myOffers.map(offer => {
                    const inverseOffer = this.inverse(offer.counts);
                    const rivalValue = this.getValue(inverseOffer, rivalValues);
                    const rivalP = this.getP(rivalValue);
                    const diff = this.diff(inverseOffer, countStatistics);
                    return {
                        offer: offer,
                        rivalValue: rivalValue,
                        rivalP: rivalP,
                        diff: diff
                    };
                });
                myOffersMap.orderBy({ order: Order.Desc, selector: _ => _.rivalValue }, { order: Order.Desc, selector: _ => _.offer.value }, { order: Order.Asc, selector: _ => _.offer.count });
                let myOffer = myOffersMap[0];
                const rivalP = this.rivalProbabilities[this.round];
                const filteredMyOffersMap = myOffersMap.filter(_ => _.rivalP >= rivalP);
                if (filteredMyOffersMap.length > 0) {
                    filteredMyOffersMap.orderBy({ order: Order.Desc, selector: _ => _.offer.value }, { order: Order.Asc, selector: _ => _.offer.count });
                    myOffer = filteredMyOffersMap[0];
                }
                return myOffer.offer.counts;
            }
            const index = randomInt(0, myOffers.length - 1);
            return myOffers[index].counts;
        }
        checkOffer(o) {
            const value = this.getValue(o);
            const p = this.me && this.round >= this.max_rounds - 1 ? 0.4 : this.myProbabilities[this.round];
            return this.getP(value) >= p;
        }
        offer(o) {
            let myOffer;
            if (o === undefined) {
                myOffer = this.findFirstOffer();
            }
            else {
                this.history.push(new HistoryItem(false, this.inverse(o)));
                if (this.checkOffer(o)) {
                    return undefined;
                }
                myOffer = this.findOffer();
            }
            this.history.push(new HistoryItem(true, myOffer));
            this.round++;
            return myOffer;
        }
    };
});

//# sourceMappingURL=solution.js.map
