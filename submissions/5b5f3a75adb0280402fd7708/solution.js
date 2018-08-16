'use strict';
/*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;

        this.minOfferSize = 0.5;
        this.stepsBeforMinOffer = max_rounds - 1;
        this.discountStep = (1 - this.minOfferSize) / this.stepsBeforMinOffer;

        this.log = log;
        this.total = 0;

        this.itemCounts = 0;
        this.itemsValues = [];
        for (let i = 0; i < counts.length; i++) {
            let itemValue = counts[i] * values[i];
            this.total += itemValue;
            this.itemCounts += counts[i];
            this.itemsValues.push({id: i, value: values[i]});
        }

        // более дорогие предметы кладем раньше
        this.itemsValues.sort(function (a, b) {
            if (a.value > b.value) {
                return -1;
            }
            if (a.value < b.value) {
                return 1;
            }
            return 0;
        });

        this.items = new Array(this.itemCounts);
        this.itemsPosition = new Array(this.itemCounts);

        let k = 0;
        for (let i = 0; i < this.itemsValues.length; i++) {
            for (let j = 0; j < counts[this.itemsValues[i].id]; j++) {
                this.items[k] = values[this.itemsValues[i].id];
                this.itemsPosition[k] = this.itemsValues[i].id;
                k++;
            }
        }

        this.matrix = this.knapsack();
        this.currentOffer = [];
    }

    // задача о рюкзаке. Заполняем матрицу загрузки рюкзака методом динамического программирования
    knapsack() {
        let Weight = this.total + 1;
        let itemsCount = this.itemCounts + 1;

        let matrix = new Array(Weight);

        let w, i = 0;
        for (w = 0; w < Weight; w++) {
            matrix[w] = new Array(itemsCount);
            if (0 === w) {
                for (i = 0; i < itemsCount; i++) {
                    matrix[w][i] = 0;
                }
            }

            matrix[w][0] = 0;
        }

        for (i = 1; i < itemsCount; i++) {
            for (w = 1; w < Weight; w++) {
                matrix[w][i] = matrix[w][i - 1];
                if (this.items[i - 1] <= w) {
                    let c = matrix[w - this.items[i - 1]][i - 1] + this.items[i - 1];
                    matrix[w][i] = matrix[w][i] < c ? c : matrix[w][i];
                }
            }
        }

        return matrix;
    }

    // вытаскиваем предметы из рюкзака на заданную стоимость
    findItemsInKnapsack(w, i) {
        if (0 === this.matrix[w][i]) {
            return undefined;
        }

        if (this.matrix[w][i - 1] === this.matrix[w][i]) {
            this.findItemsInKnapsack(w, i - 1);
        } else {
            this.currentOffer.push(i - 1);
            this.findItemsInKnapsack(w - this.items[i - 1], i - 1)
        }
    }

    // Реальная сумма оффера для целевой суммы. Рюкзак заполняется неравномерно, возможно, что мы не влезем в целевое предложение, поэтому возьмем
    // больше, чтобы не торговаться в убыток
    getCurrentRealSum(offerSum) {
        while (this.matrix[offerSum][this.itemCounts] < offerSum) {
            offerSum++;
        }
        return offerSum;
    }

    // формируем свой оффер
    ourOffer(acceptableOfferSum) {
        this.currentOffer = [];
        this.findItemsInKnapsack(this.getCurrentRealSum(Math.round(acceptableOfferSum)), this.itemCounts);

        let offer = new Array(this.counts.length).fill(0);

        for (let i = 0; i < this.currentOffer.length; i++) {
            offer[this.itemsPosition[this.currentOffer[i]]]++;
        }
        return offer;
    }

    // сумма предложенного нам оффера
    sum_offer(o) {
        if (o) {
            let sum = 0;
            for (let i = 0; i < o.length; i++) {
                sum += this.values[i] * o[i];
            }
            return sum;
        }
        return 0;
    }

    // текущий порог на который мы соглашаемся
    currentAcceptableOffer() {
        let discount = 1 - this.discountStep * (this.max_rounds - this.rounds - 1);
        discount = discount < this.minOfferSize ? this.minOfferSize : discount;

        return this.total * discount;
    }

    offer(o) {
        this.log(`${this.rounds} rounds left`);
        //this.log(`their offer ${o}`);
        this.rounds--;

        let acceptableOfferSum = this.currentAcceptableOffer();
        //this.log(`Current acceptable offer : ${acceptableOfferSum}`);

        if (o) {
            let sum = this.sum_offer(o);
            if (sum >= acceptableOfferSum)
                return;
        }

        o = this.ourOffer(acceptableOfferSum);

        //this.log(`my offer: ${o}`);
        return o;
    }
};
