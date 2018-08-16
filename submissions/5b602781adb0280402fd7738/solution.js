'use strict';
/*jslint node:true*/

module.exports = class Bruteforce {
    constructor(me, counts, values, max_rounds, log) {
        this.first = me;
        this.rounds = max_rounds;
        this.log = log;

        this.turn = 0;
        this.turns = [];
        this.allThings = [];
        for (let i = 0; i < counts.length; i++)
            this.allThings.push({index: i, count: counts[i], value: values[i], opponentValue: 0, opponentCounter: 0});
        this.allThings.sort(function (a, b) {
            if (a.value < b.value)
                return 1;
            if (a.value > b.value)
                return -1;
            return 0;
        });

        this.map = [];
        this.totalCount = 0;
        this.totalValue = 0;
        for (let i = 0; i < this.allThings.length; i++) {
            let item = this.allThings[i];
            this.map[item.index] = i;
            this.totalValue += item.count * item.value;
            this.totalCount += item.count;
        }
        this.greed = 1.65;

        debugger;
        this.makeVariants();
    }

    offer(offer) {
        debugger;
        if (offer) {
            this.turns.push(offer.slice());
            var offerValue = this.getOfferValue(offer);
            if (this.turns.length > 2) {
                this._estimateRejection(this.turns[this.turns.length - 2]);
            }
            this._estimateOffer(offer);
            this._estimateVariants();
        }

        let variant = this.getBestVariant();
        if (this.turn > 1 && variant.value > 0 && offerValue / variant.value > 0.9) return;
        else if (!this.first && this.turn === this.rounds - 1 && variant.value > 0 && offerValue / variant.value > 0.7) return;
        let answer = new Array(this.allThings.length).fill(0);
        variant.items.map(function (x) {
            answer[x] += 1;
        });
        //this.printDebugInfo(offer, answer);
        this.turns.push(answer.slice());
        this.turn++;
        this._lessGreed();
        debugger;
        return answer;
    }

    getOfferValue(offer) {
        let sum = 0;
        for (let i = 0; i < offer.length; i++) {
            sum += this.getThing(i).value * offer[i];
        }
        return sum;
    }

    _lessGreed() {
        this.greed -= Math.pow(this.rounds-this.turn, 2)/Math.pow(this.rounds,2);
    }

    getThing(i) {
        return this.allThings[this.map[i]];
    }

    _estimateRejection(our) {
        let sum = 0;
        let count = 0;
        for (let i = 0; i < our.length; i++) {
            let item = this.getThing(i);
            sum += item.opponentCounter * our[i];
            count = item.count - our[i];
        }
        let remaining = sum / 0.75 * 0.25;

        for (let i = 0; i < our.length; i++) {
            let item = this.getThing(i);
            let opponentNumber = item.count - our[i];
            if (opponentNumber > 0) {
                item.opponentCounter += remaining * opponentNumber / item.count;
            }
        }
        this._normalizeValues();
    }

    _estimateOffer(counts, weight = 1.0) {
        for (let i = 0; i < counts.length; i++) {
            let item = this.getThing(i);
            let opponentCount = item.count - counts[i];
            if (opponentCount > 0) {
                item.opponentCounter += weight * opponentCount / item.count;
            }
        }

        this._normalizeValues();
    }

    _normalizeValues() {
        let sum = 0;
        for (let i = 0; i < this.allThings.length; i++) {
            sum += this.allThings[i].opponentCounter;
        }
        if (sum > 0) {
            let k = this.totalValue / sum;
            for (let i = 0; i < this.allThings.length; i++) {
                this.allThings[i].opponentValue = this.allThings[i].opponentCounter * k / this.allThings[i].count;
            }
        }
    }

    _estimateVariants() {
        for (let i = 0; i < this.variants.length; i++) {
            let variant = this.variants[i];
            let variantCounts = new Array(this.allThings.length).fill(0);
            variant.items.map(function (x) {
                variantCounts[x] += 1;
            });
            variant.opponentValue = 0;
            for (let j = 0; j < variantCounts.length; j++) {
                let item = this.getThing(j);
                variant.opponentValue += (item.count - variantCounts[j]) * item.opponentValue;
                variant.sumValue = variant.value + variant.opponentValue;
            }
        }
    }

    getBestVariant() {
        debugger;
        let self = this;
        let preferences = this.variants.filter(function (item) {
            if (item.value / item.opponentValue >= self.greed && item.value / item.opponentValue < 3) {
                return true;
            }
            return false;
        });
        preferences = preferences.sort(function (a, b) {
            if ('sumValue' in a) {
                if (a.sumValue < b.sumValue)
                    return 1;
                if (a.sumValue > b.sumValue)
                    return -1;
            } else {
                if (a.value < b.value)
                    return 1;
                if (a.value > b.value)
                    return -1;
            }
            if (a.items.length < b.items.length)
                return -1;
            if (a.items.length > b.items.length)
                return 1;
            return 0;
        });
        if (preferences.length > 0)
            return preferences[0];
        return this.variants[0];
    }

    makeVariants() {
        const powerLimit = 150;
        let last = -1;
        let sumLength = 0, sumCounts = 0;
        let counts = this.allThings.map(function (x, index) {
            if (last !== -1 || sumLength * sumCounts > powerLimit) {
                return 0;
            } else if ((sumLength + 1) * (sumCounts + x.count) < powerLimit) {
                sumLength += 1;
                sumCounts += x.count;
                return x.count;
            } else {
                last = index;
                let i = x.count - 1;
                while (i > 0 && (sumLength + 1) * (sumCounts + i) > powerLimit) i--;
                return i;
            }
        });
        if (last >= 0 && last < counts.length - 1) counts.splice(last + 1, counts.length);

        this.variants = [];
        for (let k = 1; k <= this.totalCount; k++) {
            let comb = new Combination(counts, k);
            let newSet = null;
            while (newSet = comb.nextSet) {
                let variant = {
                    items: [],
                    value: 0
                };
                for (let i = 0; i < newSet.length; i++) {
                    let item = this.allThings[newSet[i]];
                    variant.items.push(item.index);
                    variant.value += item.value;
                }
                this.variants.push(variant);
            }
        }

        this.variants = this.variants.sort(function (a, b) {
            if (a.value < b.value)
                return 1;
            if (a.value > b.value)
                return -1;
            if (a.items.length < b.items.length)
                return -1;
            if (a.items.length > b.items.length)
                return 1;
            return 0;
        });
    }

    printDebugInfo(offer, answer) {
        let str = 'Bruteforce\n';
        if (offer) {
            for (let i = 0; i < offer.length; i++) {
                str += "(" + offer[i] + "-" + (this.getThing(i).count - offer[i]) + ") ";
            }
            str += '\n';
        }
        for (let i = 0; i < answer.length; i++) {
            str += "(" + answer[i] + "-" + (this.getThing(i).count - answer[i]) + ") ";
        }
        str += '\n';
        for (let i = 0; i < answer.length; i++) {
            str += "(" + Math.round(this.getThing(i).opponentValue * 100) / 100 + ") ";
        }
        this.log(str);
    }
};

class Combination {
    constructor(limits, k) {
        this.limits = limits.slice(0);
        this.k = k;
        this.count = 0;
        this.sum = 0;
        for (let i = 0; i < limits.length; i++) {
            this.sum += limits[i];
        }
        if (this.sum >= k) {
            this.current = [];
            for (let i = 0, j = 0; i < k; i++) {
                if (this.limits[j] === 0) j++;
                this.current[i] = j;
                this.limits[j] -= 1;
            }
        }
    }

    _nextSet() {
        let next = false;
        for (let i = this.k - 1; i >= 0; --i)
            if (this.current[i] < this.limits.length - 1) {
                for (let j = i; j < this.k; j++)
                    if (this.current[j] !== -1)
                        this.limits[this.current[j]] += 1;
                ++this.current[i];
                this.limits[this.current[i]] -= 1;
                for (let j = i + 1; j < this.k; j++) {
                    let newValue = this.current[j - 1];
                    if (this.limits[newValue] === 0) newValue++;
                    if (newValue >= this.limits.length) {
                        next = true;
                        for (let k = j; k < this.k; k++) this.current[k] = -1;
                        break;
                    }
                    this.limits[newValue] -= 1;
                    this.current[j] = newValue;
                }
                if (next) {
                    next = false;
                    continue;
                }
                return true;
            }
        return false;
    }

    get nextSet() {
        if (this.sum >= this.k) {
            if (this.count++ !== 0) {
                if (this._nextSet()) return this.current.slice(0);
            } else return this.current.slice(0);
        }

        return null;
    }
}