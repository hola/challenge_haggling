'use strict';

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.round = 0;
        this.leftRounds = max_rounds;
        this.total = this.product(counts);
        this.types = counts.length;
        this.log = log;
        this.init();
    }

    initSteps() {
        this.steps = this.offersAll
            .map(o => {return {
                offer: o,
                p1: this.product(o, this.values),
                c1: this.sum(o)
            }})
            .sort((a, b) => (b.p1 !== a.p1) ? (b.p1 - a.p1) : (b.c1 - a.c1))
            .slice(0, 5)
            .filter(o => o.p1 >= this.minP);

    }

    initOffers() {
        let offers = [];
        let offer = [0,0,0];
        for (offer[0] = this.counts[0]; offer[0] >= 0; offer[0]--) {
            for (offer[1] = this.counts[1]; offer[1] >= 0; offer[1]--)
                for (offer[2] = this.counts[2]; offer[2] >= 0; offer[2]--) {
                    offers.push(offer.slice());
                }
        }
        offers.pop();
        offers.shift();

        // this.sortSets(this.values, offers);
        const myValues = this.values;
        offers.sort((b, a) => this.product(myValues, a) - this.product(myValues, b));

        let goodOffers = [];

        for (let i = 0; i < offers.length; i++) {
            offer = offers[i];
            let mySumPrice = this.product(offer, this.values);
            let herOffer = this.minus(this.counts, offer);
            let herMaxPrice = this.maxGoodsSumPrice(herOffer);

            if ((mySumPrice > 5)
            //&& (herMaxPrice >= 5)
            ) {
                goodOffers.push(offer);
                //console.log(offer, mySumPrice, '     ', herOffer, herMaxPrice);
            }
        }

        this.myAvailableOffers = goodOffers;
    }

    sortStat(stat, kf) {
        let p1, p2;
        stat.sort((a, b) => {
            p1 = this.product(b.profits, kf);
            p2 = this.product(a.profits, kf);
            return p1 - p2;
        });
    }

    allOffers(counts) {
        if (!counts) counts = this.counts;
        let offers = [];
        for (let i1 = 0; i1 <= counts[0]; i1++) {
            for (let i2 = 0; i2 <= counts[1]; i2++) {
                for (let i3 = 0; i3 <= counts[2]; i3++) {
                    offers.push([i1, i2, i3]);
                }
            }
        }
        offers.shift();
        offers.pop();
        return offers;
    }

    stat(valuations) {
        if (!valuations) valuations = this.valuations;
        let stat = [];

        let offers = this.offersAll;
        let values1 = this.values;

        for (let k = 0; k < offers.length; k++) {
            let offer = offers[k];
            let offer2 = this.minus(this.counts, offer);
            let p1 = this.product(offer, values1);

            let statNumbers = this.newArray(this.total + 1);
            let allP = [];

            valuations.forEach(values2 => {
                let p2 = this.product(offer2, values2);
                statNumbers[p2]++;
                allP.push(p2);
            });

            let statSum = 0;
            let row = this.newArray(this.total + 1);
            let profits = this.newArray(this.total + 1);

            for (let s = 10; s >= 0; s--) {
                statSum += statNumbers[s];
                let avgP1 = statSum / valuations.length * p1;
                let avgP2 = allP.filter(p => p >= s).reduce((sum, p) => sum + p, 0) / allP.length;
                let deltaP = avgP1 - avgP2;
                let profit = avgP1 + deltaP / 30;

                row[s] = {avgP1, avgP2, deltaP, profit};
                profits[s] = profit;
            }
            stat.push({offer, offer2, p1, row, profits})
        }

        this.sortStat(stat, this.kf);

        return stat;
    }

    init() {
        this.kf = this.newArray(this.total + 1);
        this.kf[3] = 1/2;
        this.kf[4] = 1/2;
        this.minK = 1;
        this.minP = 3;
        this.valuations = [];
        this.initAllValues(this.counts, new Array(this.types), 0, 0);

        this.offersAll = this.allOffers(this.counts);
        this.offers = [];
        this.offers2 = [];
        this.myOffers = [];

        this.initSteps();
        this.checkExampleEnable = true;
    }


    offer(offer) {
        this.round++;
        this.leftRounds--;

        let p = 0;

        if (offer !== undefined) {
            this.offers.push(offer);
            this.offers2.push(this.minus(this.counts, offer));

            p = this.product(offer, this.values);

            if (p === 10) return;
            if (this.me === 1 && p >= 8) return;

        }

        if (this.isExample() && !(this.me === 1 && this.leftRounds === 0)) {
            let myOffer = this.makeOfferExample();
            if (myOffer) this.myOffers.push(myOffer);
            if (myOffer !== false) return myOffer;
        }

        if (this.me === 1 && this.leftRounds === 1) {
            let oppOffer = this.bestOffer(5);
            if (oppOffer) {
                return oppOffer.offer;
            } else {
                this.kf = this.newArray(this.total + 1);
                this.kf[4] = 2/3;
                this.kf[5] = 1/3;
                let stat = this.stat(this.valuationsFind());
                if (stat[0].p1 >= 3) return stat[0].offer;
            }
        }

        if (this.me === 1 && this.leftRounds === 0) {
            if (this.product(offer, this.values) >= this.minK) {
                return;
            }
        }

        if (this.me === 0 && this.leftRounds === 0) {
            let stat = this.stat(this.valuationsFind());
            let oppOffer = this.bestOffer(stat[0].p1);
            if (oppOffer) {
                return oppOffer.offer;
            }
            if (stat[0].p1 >= this.minP) return stat[0].offer;
        }

        let myOffer = this.makeOffer(p);
        if (myOffer !== undefined) {
            this.myOffers.push(myOffer);
        }
        return myOffer;
    }

    valuationsFind() {
        let offers = [];
        for (let i = 0; i < this.offers2.length; i++) { 
            let skip = false;
            for (let j = 0; j < offers.length; j++) { 
                if (this.isPos(this.minus(this.offers2[i], offers[j]))) {
                    skip = true;
                    break;
                }
            }
            if (!skip) {
                offers.push(this.offers2[i]);
            }
        }

        let valuations = this.valuations.filter(values => {
            let ok = true;
            let prev = this.total;
            offers.forEach(offer => {
                let curr = this.product(offer, values);
                if (curr > prev) {
                    ok = false;
                }
                prev = curr;
            });
            if (prev < this.minK) ok = false;
            return ok;
        });

        if (valuations.length > 5) {
            let expensiveObjects = this.newArray(this.counts.length);
            for (let i = 0; i < this.offers2.length; i++) {
                let offer = this.offers2[i];
                expensiveObjects = this.add(expensiveObjects, this.div(offer, this.counts))
            }
            let expensiveIndexes = this.maxValuesIndexes(expensiveObjects);

            if (expensiveIndexes.length) {
                let valuationsByExpensive = valuations.filter(offer => {
                    let maxIndexes = this.maxValuesIndexes(offer);
                    let ok = false;
                    for (let i = 0; i < maxIndexes.length; i++) {
                        if (expensiveIndexes.indexOf(maxIndexes[i]) !== -1) ok = true;
                    }
                    return ok;
                });
                if (valuationsByExpensive.length > 0) {
                    valuations = valuationsByExpensive;
                }
            }
        }

        return valuations;
    }

    maxValuesIndexes(offer) {
        let expensiveIndexes = [];
        let expensiveMax = 0;
        for (let i = 0; i < offer.length; i++) {
            if (offer[i] > expensiveMax) {
                expensiveMax = offer[i];
                expensiveIndexes = [i];
            } else if (offer[i] === expensiveMax){
                expensiveIndexes.push(i);
            }
        }
        return expensiveIndexes;
    }

    valuationsFindExample() {
        let offer = this.offers2[0];
        if (this.isEqual(offer, this.counts)) return this.valuations;

        let zeroIndexes = [];
        for (let i = 0; i < offer.length; i++) {
            if (offer[i] === 0) zeroIndexes.push(i);
        }

        return this.valuations.filter(values => {
            for (let i = 0; i < zeroIndexes.length; i++) {
                if (values[zeroIndexes[i]] !== 0) return false;
            }
            return true;
        });
    }

    offersStatExample(valuations, minK) {
        let stat = [];
        let offer2;

        this.offersAll
            .forEach(offer => {
                let p1 = this.product(offer, this.values);
                if (p1 < this.minK) return;

                offer2 = this.minus(this.counts, offer);
                let mask2 = this.newArray(valuations.length);
                valuations.forEach((values, i) => {
                    mask2[i] = +(this.product(offer2, values) >= minK);
                });
                if (this.sum(mask2) > 0) {
                    let c1 = this.sum(offer);
                    stat.push({p1, c1, offer, offer2, mask2});
                }
            });

        stat.sort((a, b) =>
            (b.p1 !== a.p1)
                ? b.p1 - a.p1
                : b.c1 - a.c1
        );
        return stat;
    }

    makeOffer(p) {
        let i = this.round - 1;
        while ((this.steps[i] === undefined) || (this.steps[i].p1 < p)) {
            i--;
        }
        if (this.steps[i] === undefined) return this.counts;
        return this.steps[i].offer;
    }

    makeOfferExample() {
        let valuations = this.valuationsFindExample();
        let mask = this.newArray(valuations.length);
        let minK = this.total / 2;
        let offer2;

        this.myOffers.forEach(offer => {
            offer2 = this.minus(this.counts, offer);
            valuations.forEach((values, i) => {
                if (this.product(offer2, values) >= minK) mask[i] = 1;
            });
        });

        if (this.sum(mask) === mask.length) {
            this.checkExampleEnable = false; 
            return false;
        }

        let offers = this.findOffersForExample(mask, this.offersStatExample(valuations, minK), 0, this.leftRounds);
        if (!offers) {
            return false;
        }

        if (!offers.items.length) return false;

        return offers.items[0];
    }

    findOffersForExample(mask, stat, iFrom, leftRounds) {
        let items = [];
        let newMask;
        let countNew;
        let mask2;
        let coverage, maxCoverage = 0;
        let result, maxResult = 0;
        let subItems;
        let statCount = stat.length;
        let coverageFull = 1 - 0.1;

        for (let i = iFrom; i < statCount; i++) {
            newMask = mask.slice();
            countNew = 0;
            mask2 = stat[i].mask2;
            for (let j = 0; j < mask.length; j++) {
                if (mask[j] === 0 && mask2[j] === 1) {
                    countNew++;
                    newMask[j] = 1;
                }
            }
            if (!countNew) continue;

            coverage = countNew / newMask.length;
            result = coverage * stat[i].p1;

            if (coverage < coverageFull && leftRounds > 0 && i < statCount - 1) {
                subItems = this.findOffersForExample(newMask, stat, i + 1, leftRounds - 1);
                if (subItems) {
                    coverage += subItems.coverage;
                    result += subItems.result;
                }
            }

            if (result > maxResult) {
                maxResult = result;
                maxCoverage = coverage;
                items = [stat[i].offer];
                if (subItems) {
                    items = items.concat(subItems.items);
                }
                if (coverage > coverageFull) break;
            }
        }

        return maxResult
            ? {
                items,
                coverage: maxCoverage,
                result: maxResult
            }
            : false;
    }

    isExample() {
        if (!this.checkExampleEnable) return false;

        if (this.offers2.length < 2) return false;

        for (let i = 1; i < this.offers2.length; i++) {
            if (!this.isEqual(this.offers2[i], this.offers2[i-1])) {
                this.checkExampleEnable = false;
                return false;
            }
            let o = this.offers2[i];
            for (let j = 0; j < this.counts.length; j++) {
                if (o[j] !== 0 && o[j] !== this.counts[j]) {
                    this.checkExampleEnable = false;
                    return false;
                }
            }
        }
        return true;
    }

    sum(offer) {
        let result = 0;
        for (let i = offer.length; i--;) {
            result += offer[i];
        }
        return result;
    }

    max(offer) {
        let result = 0;
        for (let i = offer.length; i--;) {
            if (offer[i] > result) result = offer[i];
        }
        return result;
    }

    minus(o1, o2) {
        let result = new Array(o1.length);
        for (let i = o2.length; i--;) {
            result[i] = o1[i] - o2[i];
        }
        return result;
    }

    add(o1, o2) {
        let result = new Array(o1.length);
        for (let i = o2.length; i--;) {
            result[i] = o1[i] + o2[i];
        }
        return result;
    }

    div(o1, o2) {
        let result = new Array(o1.length);
        for (let i = o2.length; i--;) {
            result[i] = o2[i] ? o1[i] / o2[i] : o1[i] * 1e6;
        }
        return result;
    }

    product(count, values) {
        if (values === undefined) values = this.values;
        let result = 0;
        for (let i = count.length; i--;) {
            result += count[i] * values[i];
        }
        return result;
    }

    newArray(len, def) {
        def = def | 0;
        let result = new Array(len);
        for (let i = len; i--;) {
            result[i] = def;
        }
        return result;
    }

    isEqual(o1, o2) {
        for (let i = o1.length; i--;) {
            if (o1[i] !== o2[i]) return false;
        }
        return true
    }

    isPos(o) {
        for (let i = o.length; i--;) {
            if (o[i] < 0) return false;
        }
        return true;
    }

    initAllValues(counts, values, i, total_value){
        let count = counts[i];
        let max = (this.total-total_value)/count|0;
        if (i==this.types-1)
        {
            if (total_value+max*count==this.total)
            {
                values[i] = max;
                if (!this.isEqual(this.values, values)) {
                    this.valuations.push(Array.from(values));
                }
            }
            return;
        }
        for (let j = 0; j<=max; j++)
        {
            values[i] = j;
            this.initAllValues(counts, values, i+1, total_value+j*count);
        }
    }

    bestOffer(p) {
        let offers = this.offers.map(o => {
            return {
                p1: this.product(this.values, o),
                s: this.sum(o),
                offer: o,
            }
        })
            .filter(s => s.p1 >= p)
            .sort((a, b) => b.p1 - a.p1 || b.s - a.s);
        if (offers.length) {
            return offers[0];
        }
        return null;
    }

    filterFavorableSets(offer, sets, minValue) {
        let good = [];
        let value;
        for (let j = 0; j < sets.length; j++) {
            value = this.product(offer, sets[j]);
            if (value >= minValue) {
                good.push(sets[j]);
            }
        }
        // console.log(offer, minValue, good);

        return good;
    }

    sortSets(offer, sets) {
        return sets.sort((a, b) => this.product(offer, a) - this.product(offer, b));
    }

    maxGoodsSumPrice(offer) {
        let maxPrices = this.maxGoodsPrices(offer);
        return this.product(offer, maxPrices);
    }
    maxGoodsPrices(offer) {
        return [
            this.maxGoodsPrice(offer, 0),
            this.maxGoodsPrice(offer, 1),
            this.maxGoodsPrice(offer, 2),
        ];
    }
    maxGoodsPrice(offer, i) {
        return (10 / this.counts[i])|0;
    }


};
