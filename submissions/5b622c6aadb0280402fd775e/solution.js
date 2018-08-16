'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        //изменения здесь
        this.THERESHOLD = 9;
        this.minimal = -1;
        this.who_first = me;
        this.min_index;
        this.return_values = this.values.slice();
        this.return_counts = this.counts.slice();
        this.outerArr = [];
        this.alreadyOffered = [];
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
        }
        this.offerIndex;
    }

    summarize(arr) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++)
            sum += this.values[i] * arr[i];
        return sum;
    }

    addToOuter(arr) {
        if (this.outerArr.length == 0) {
            this.outerArr.push(arr);
            return;
        }
        let hasDuplicate = true;
        for (let i = 0; i < this.outerArr.length; i++) {
            let a = this.equal(this.outerArr[i], arr);
            if (a) {
                return;
            }
            hasDuplicate = a;

        }
        if (!hasDuplicate) {
            this.outerArr.push(arr);
        }
    }

    offer(o) {
        if (this.rounds == 5) {
            this.minimi(this.counts, 0);
            this.deleteUneven();
            this.bubbleSort(this.outerArr);
        }
        this.rounds--;
        if (o) {
            let sum;
            sum = this.summarize(o);
            if (this.rounds == 0 && this.who_first == 1 && sum != 0) {
                return;
            }
         
            if (sum > this.THERESHOLD)
                return;
        }
        
        if(this.THERESHOLD>7){
            this.THERESHOLD--;
        }
        
    
        return this.makeOffer();
    }

    makeOffer() {
        let offer;
        
        if (!this.offerIndex) {
            this.offerIndex = this.outerArr.length - 1;
            offer = this.outerArr[this.offerIndex];
            this.offerIndex--;
            return this.optimizeOffer(offer);
        }
      

        offer = this.outerArr[this.offerIndex];
        if(this.summarize(this.outerArr[this.offerIndex]) < 7) {
            this.offerIndex = this.outerArr.length;
        }
        
        this.offerIndex--;
        return this.optimizeOffer(offer);
    }

    optimizeOffer(offer) {
        for (let i = offer.length; i >= 0; i--) {
            if (this.values[i] == 0) {
                offer[i] = 0;
            }
        }
        return offer;
    }

    minimi(o, index) {
        let arr = o.slice();
        if (index == arr.length) {
            return;
        }

        for (let i = arr[index]; i >= 0; i--) {
            arr[index] = i;
            let additionArr = arr.slice();
            this.addToOuter(additionArr);
            arr[index] = i;
            this.minimi(arr, index + 1);
            this.minimi(arr, index + 2);
        }
    }

    equal(arr1, arr2) {
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
                if (this.summarize(arr[j]) > this.summarize(arr[j + 1])) {
                    var max = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = max;
                }
        return arr;
    }

    deleteUneven() {
        for (let i = 0; i < this.outerArr.length; i++) {
            if (this.outerArr[i][0] == this.counts[0] &&
                this.outerArr[i][1] == this.counts[1]
                && this.outerArr[i][2] == this.counts[2]) {
                this.outerArr.splice(i, 1);
                break;
            }
        }
    }
};