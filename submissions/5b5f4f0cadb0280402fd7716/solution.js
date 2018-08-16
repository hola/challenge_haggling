'use strict';
/*jslint node:true*/

const MIN_OFFERED_SUM = .2;
const MIN_ACCEPTED_SUM = .9;

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.log = log;

        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.round = 0;

        log(`counts, ${counts.join(', ')}, books: ${counts[0]}, hats: ${counts[1]}, balls: ${counts[2]}`);
        log(`values, [${values.join(', ')}], book: $${values[0]}, hat: $${values[1]}, ball: $${values[2]}`);
        log(`rounds: ${max_rounds}`);

        this.total = 0;
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
        }

        this.combinations = [];
        this.makeAllCombinations();
        log('not sorted combinations ' + this.combinations.map(c => `[${c.o.join(',')}] $${c.sum}`).join('; '))

        this.combinations.sort((a, b) => a.sum < b.sum ? 1 : -1);
        this.currentComb = -1;

        // убираем совсем дешёвые комбинации
        this.minSumToAccept = Math.floor(this.total * MIN_OFFERED_SUM);
        // this.combinations = this.combinations.filter(c => c.sum >= this.minSumToAccept);

        log('combinations ' + this.combinations.map(c => `[${c.o.join(',')}] $${c.sum}`).join('; '))

        this.sumToAccept = Math.min(Math.floor(this.total * MIN_ACCEPTED_SUM), this.combinations[0].sum);

        this.rivalsPreferences = null;

        if (this.me === 0) log(`I am first`);
        else log(`I am second`);
    }

    offer(o) {
        this.round++;

        if (this.me === 1) {
            this.log(``);
            this.log(`Round ${this.round}`);
        }

        if (o) {
            const sum = this.calculateSum(o);
            this.log(`Rival's offer ${o.join(', ')} ($${sum})`);

            this.updateRivalsPreferences(o);

            if (sum >= this.sumToAccept) return;

            // последний раунд, принимаем любое ненулевое предложение
            if (this.round === this.rounds && sum > 0) {
                return;
            }
        }

        if (this.me === 0) {
            this.log(``);
            this.log(`Round ${this.round}`);
        }

        const comb = this.getNextCombination();

        this.updateSumToAccept();

        this.log(`My offer ${comb.o.join(', ')} ($${comb.sum})`);
        return comb.o;
    }

    calculateSum(o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++) {
            sum += this.values[i] * o[i];
        }
        return sum;
    }

    createOffer(o, itemIndex, count) {
        o = [...o];
        o[itemIndex] = count;
        return o;
    }

    makeCombinations(o, itemIndex) {
        if (!this.counts[itemIndex]) return;

        const maxCount = this.values[itemIndex] > 0 ? this.counts[itemIndex] : 0;
        for (let itemCount = 0; itemCount <= maxCount; itemCount++) {
            const o2 = this.createOffer(o, itemIndex, itemCount);

            if (itemIndex === o.length - 1) {
                const sum = this.calculateSum(o2);
                if (sum > 0) {
                    this.combinations.push({ o: o2, sum });
                }
            } else {
                this.makeCombinations(o2, itemIndex + 1);
            }
        }
    }

    makeAllCombinations() {
        const o = [...this.counts];
        for (let i = 0; i < o.length; i++) {
            o[i] = 0;
        }
        this.makeCombinations(o, 0);
    }

    getNextCombinationSum() {
        const i = this.currentComb;
        const c = this.getNextCombination();
        this.currentComb = i;
        return c.sum;
    }

    getNextCombination() {
        this.currentComb++;

        // если кончились, начинаем с начала
        if (!this.combinations[this.currentComb]) this.currentComb = 1;

        while (this.nextShouldBeSkipped()) {
            const comb = this.combinations[this.currentComb];
            this.log(`Skip ${comb.o.join(', ')} ($${comb.sum})`);

            this.currentComb++;
        }

        return this.combinations[this.currentComb] || this.combinations[0];
    }

    nextShouldBeSkipped() {
        const i = this.currentComb;
        const c = this.combinations[i];

        if (!c) return false;

        // если у 1-го предложения всё по максимуму
        if (i === 0 && c.o.every((count, i) => count === this.counts[i])) return true;

        if (this.rivalsPreferences) {
            for (let j = 0; j < this.rivalsPreferences.length; j++) {
                const p = this.rivalsPreferences[j];

                // если что-то не интересует противника, пропускаем комбинации, где мы даём это противнику
                if (p === 0 && this.values[j] > 0 && c.o[j] < this.counts[j]) {
                    return true;
                }
            }
        }

        return false;
    }


    updateRivalsPreferences(o) {
        if (!this.rivalsPreferences) {
            this.rivalsPreferences = [...this.counts];
            for (let i = 0; i < this.rivalsPreferences.length; i++) {
                this.rivalsPreferences[i] = 0;
            }
        }

        for (let i = 0; i < o.length; i++) {
            if (this.counts[i] - o[i] > 0) {
                this.rivalsPreferences[i]++;
            }
        }
        this.log(`Rival's preferences ${this.rivalsPreferences.join(', ')}`);
    }

    updateSumToAccept() {
        // const nextSum = this.combinations[this.currentComb + 1] ? this.combinations[this.currentComb + 1].sum : this.combinations[this.combinations.length - 1].sum;
        const nextSum = this.getNextCombinationSum();
        this.sumToAccept = Math.max(this.minSumToAccept, Math.min(this.sumToAccept, nextSum));

        this.log(`I will accept $${this.sumToAccept}`);
    }
};
