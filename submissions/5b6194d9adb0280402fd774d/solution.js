const discount = 0.5;
const obstinateMinProfitPart = 0.6;
const compliantMinProfitPart = 0.5;
const relationDisbalance = 1;

class KindBob {

    constructor(me, counts, values, roundCount, log) {
        this.me = me;
        this.roundCount = roundCount;
        this.log = log;

        this.valueSum = Util.product(values, counts);
        this.minValue = values.reduce((a, b) => Math.min(a, b), this.valueSum);

        this.initTypes(counts, values);
        this.initGreedyParams();

        this.round = 0;
    }

    initTypes(counts, values) {
        this.types = [];
        for (let i = 0; i < counts.length; i++) {
            let opponentValue = this.valueSum / (counts.length * counts[i]);
            let demand = counts[i];
            this.types.push(new Type(i, counts[i], values[i], opponentValue, demand));
        }
    }

    initGreedyParams() {
        let minProfitPart = (this.me === 0) ? obstinateMinProfitPart : compliantMinProfitPart;
        this.greedyStep = (this.valueSum * (1 - minProfitPart) - this.minValue) / (this.roundCount - 1);
    }

    offer(o) {
        this.round++;
        if (o) {
            if (this.isDeal(o)) return undefined;
            this.updateOpponentValues(o);
        }
        return this.prepareResponse();
    }

    isDeal(o) {
        let receivedProfit = 0;
        for (let i = 0; i < o.length; i++) {
            let type = this.types[i];
            receivedProfit += type.value * o[i];
        }

        if ((this.me === 1) && (this.round === this.roundCount) && (receivedProfit > 0)) {
            return true;
        }

        let minProfit = this.currentMinProfit();
        let deal = minProfit <= receivedProfit;
        return deal;
    }

    updateOpponentValues(o) {
        let demandSum = 0;
        for (let i = 0; i < this.types.length; i++) {
            let type = this.types[i];
            type.demand = (type.demand * discount) + (type.count - o[i]);
            demandSum += type.demand;
        }
        if (demandSum === 0) return;
        this.types.forEach((type) => {
            type.opponentValue = this.valueSum * type.demand / (demandSum * type.count);
        });
    }

    prepareResponse() {
        let sortedTypes = this.types.slice();
        sortedTypes.sort((a, b) => b.relativeValue - a.relativeValue);

        let response = new Array(this.types.length).fill(0);

        let minProfit = this.currentMinProfit();
        let profit = 0;

        for (let i = 0; i < sortedTypes.length; i++) {
            let type = sortedTypes[i];
            for (let j = 0; j < type.count; j++) {
                profit += type.value;
                response[type.index]++;
                if (profit >= minProfit) {
                    return response;
                }
            }
        }
        this.log(`shit happened`)
    }

    currentMinProfit() {
        return this.valueSum - this.minValue - (this.greedyStep * (this.round - 1));
    }
}

class Type {

    constructor(index, count, value, opponentValue, demand) {
        this.index = index;
        this.count = count;
        this.value = value;
        this.opponentValue = opponentValue;
        this.demand = demand;
    }

    get relativeValue() {
        if (this.value === 0) {
            return 0;
        }
        if (this.opponentValue === 0) {
            return Number.POSITIVE_INFINITY;
        }
        return Math.pow(this.value, relationDisbalance) / this.opponentValue;
    }
}

class Util {

    static product(a, b) {
        let product = 0;
        for (let i = 0; i < a.length; i++) {
            product += a[i] * b[i];
        }
        return product;
    }
}

module.exports = KindBob;