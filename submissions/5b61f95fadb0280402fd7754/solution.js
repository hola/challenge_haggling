'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.THERESHOLD = 9;
        this.me = me;
        this.return_values = this.values.slice();
        this.return_counts = this.counts.slice();
        this.offers = [];
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
        }
    }
    calculation(arr) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++)
            sum += this.values[i] * arr[i];
        return sum;
    }

    addOffer(arr) {
        if (this.offers.length == 0) {
            this.offers.push(arr);
            return;
        }
        let hasDuplicate = true;
        for (let i = 0; i < this.offers.length; i++) {
            let a = this.compare(this.offers[i], arr);
            if (a) {
                return;
            }
            hasDuplicate = a;

        }
        if (!hasDuplicate) {
            this.offers.push(arr);
        }
    }

    offer(o) {
        if (this.rounds == 5) {
            this.recursiveMakeOffers(this.counts, 0);
            this.dropVarious();
            this.bubbleSort(this.offers);
        }
        this.rounds--;
        if (o) {
            let sum;
            sum = this.calculation(o);
            if (this.rounds == 0 && this.me == 1 && sum != 0) {
                return;
            }
            if (sum >= this.THERESHOLD)
                return;
        }
        this.THERESHOLD--;
        return this.makeOffer();
    }

    makeOffer() {
        let offer;
        if (!this.offerIndex) {
            this.offerIndex = this.offers.length - 1;
            offer = this.offers[this.offerIndex];
            this.offerIndex--;
            return offer;
        }

        
        if (this.calculation(this.offers[this.offerIndex]) < 6) {
            this.offerIndex = this.offers.length-1;
        }
        offer = this.offers[this.offerIndex];
        this.offerIndex--;
        return offer;
    }

    reductionOffer(offer) {
        for (let i = offer.length; i >= 0; i--) {
            if (this.values[i] == 0) {
                offer[i] = 0;
            }
        }
        return offer;
    }

    recursiveMakeOffers(o, index) {
        let arr = o.slice();
        if (index == arr.length) {
            return;
        }

        for (let i = arr[index]; i >= 0; i--) {
            arr[index] = i;
            let additionArr = arr.slice();
            this.addOffer(this.reductionOffer(additionArr));
            arr[index] = i;
            this.recursiveMakeOffers(arr, index + 1);
            this.recursiveMakeOffers(arr, index + 2);
        }
    }

    compare(arr1, arr2) {
        let equal = true;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                equal = false;
            }
        }
        return equal;
    }

    bubbleSort(arr) {
        var count = arr.length - 1;
        for (var i = 0; i < count; i++)
            for (var j = 0; j < count - i; j++)
                if (this.calculation(arr[j]) > this.calculation(arr[j + 1])) {
                    var max = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = max;
                }
        return arr;
    }

    dropVarious() {
        for (let i = 0; i < this.offers.length; i++) {
            if (this.offers[i][0] == this.counts[0] &&
                this.offers[i][1] == this.counts[1]
                && this.offers[i][2] == this.counts[2]) {
                this.offers.splice(i, 1);
                break;
            }
        }
    }
};
