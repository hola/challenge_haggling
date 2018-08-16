const discount = 0.5;

class Haggler {

    constructor(me, counts, values, roundCount, log) {
        this.me = me;
        this.roundCount = roundCount;
        this.log = log;

        this.valueSum = Util.product(values, counts);
        this.minValue = values.reduce((a, b) => Math.min(a, b), this.valueSum);

        this.initTypes(counts, values);

        this.round = 0;
    }

    initTypes(counts, values) {
        this.types = [];

        let countSum = counts.reduce((a, b) => a + b, 0);
        let opponentValue = this.valueSum / countSum;

        for (let i = 0; i < counts.length; i++) {
            this.types.push(new Type(i, counts[i], values[i], opponentValue));
        }
    }

    offer(o) {
        this.round++;
        if (o) this.updateOpponentValues(o);
        this.updateKeepCounts();
        this.updateProfits();
        if (o && this.isDeal(o)) return undefined;
        return this.prepareResponse();
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

    updateKeepCounts() {
        let ourMaxProfit = 0;
        let theirMaxProfit = 0;
        this.types.forEach((type) => {
            if ((type.value > 0) && (type.value >= type.opponentValue)) {
                type.keepCount = type.count;
                ourMaxProfit += type.count * type.value;
            } else {
                type.keepCount = 0;
                theirMaxProfit += type.count * type.opponentValue;
            }
        });
        let disbalanceSum = ourMaxProfit - theirMaxProfit;

        if (disbalanceSum > 0) {
            this.giveObjects(disbalanceSum);
        } else if (disbalanceSum < 0) {
            this.takeObjects(disbalanceSum);
        }

        let ourBalanceProfit = 0;
        let theirBalanceProfit = 0;
        this.types.forEach((type) => {
            ourBalanceProfit += type.keepCount * type.value;
            theirBalanceProfit += (type.count - type.keepCount) * type.opponentValue;
        });
    }

    giveObjects(disbalanceSum) {
        this.balanceObjects(
            disbalanceSum,
            (type) => type.keepCount,
            (count, type) => type.keepCount = count
        )
    }

    takeObjects(disbalanceSum) {
        this.balanceObjects(
            disbalanceSum,
            (type) => type.count - type.keepCount,
            (count, type) => type.keepCount = type.count - count
        )
    }

    balanceObjects(disbalanceSum, countGetter, countSetter) {
        let direction = Math.sign(disbalanceSum);
        let moveSum = Math.abs(disbalanceSum);

        let sortedTypes = this.types.slice();
        sortedTypes.sort((a, b) => direction * (a.disbalance - b.disbalance));

        let i = 0;
        while ((i < sortedTypes.length) && (moveSum > 0)) {
            let type = sortedTypes[i];
            let count = countGetter(type);
            if ((count > 0) && (type.value + type.opponentValue > 0)) {
                let maxMoveCount = Math.round(moveSum / (type.value + type.opponentValue));
                let moveCount = Math.min(count, maxMoveCount);
                countSetter(count - moveCount, type);
                moveSum -= moveCount * (type.value + type.opponentValue);
            }
            i++;
        }
    }

    updateProfits() {
        this.minProfit = 0;
        this.types.forEach((type) => {
            this.minProfit += type.keepCount * type.value;
        });

        if (this.round === 1) {
            this.aimProfit = this.valueSum - this.minValue;
        } else {
            this.aimProfit -= Math.max(this.aimProfit - this.minProfit, 0) / (this.roundCount - this.round + 1);
        }
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

        let deal = this.aimProfit <= receivedProfit;
        return deal;
    }

    prepareResponse() {
        let response = [];
        this.types.forEach((type) => {
            response.push(type.keepCount);
        });

        let sortedTypes = this.types.slice();
        sortedTypes.sort((a, b) => b.disbalance - a.disbalance);

        let moveSum = this.aimProfit - this.minProfit;

        let i = 0;
        while ((i < sortedTypes.length) && (moveSum > 0)) {
            let type = sortedTypes[i];
            let index = type.index;
            let count = type.count - response[index];
            if ((count > 0) && (type.value > 0)) {
                let maxMoveCount = Math.round(moveSum / type.value);
                let moveCount = Math.min(count, maxMoveCount);
                response[index] += moveCount;
                moveSum -= moveCount * type.value;
            }
            i++;
        }
        return response;
    }
}

class Type {

    constructor(index, count, value, opponentValue) {
        this.index = index;
        this.count = count;
        this.value = value;
        this.opponentValue = opponentValue;
        this.demand = count;
        this.keepCount = count;
    }

    get disbalance() {
        return this.value - this.opponentValue;
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

module.exports = Haggler;