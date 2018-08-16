'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];
        this.max_rounds = max_rounds;

        this.enemyValueableItems = [];
        this.myValueableItems = [];
        this.commonValueableItems = [];
        this.onlyMyValueableItems = [];
        this.onlyEnemyValueableItems = [];
        this.enemyOffer = [];
        this.myOffer = [];
        this.minIndex = 0;
        this.threshold = 100;
        this.offerSum;
        this.myValueableItems = this.counts.slice();
        for (let i = 0; i < this.counts.length; i++) {
            if (!this.values[i])
                this.myValueableItems[i] = 0;
        }
    }
    reduce(a1, a2) {
        let arr = [];
        for (let i = 0; i < a1.length; i++) {
            if (a1[i] > a2[i])
                arr[i] = a1[i] - a2[i];
            else {
                arr[i] = 0;
            }
        }
        return arr;
    }
    common(a1, a2) {
        let arr = [];
        for (let i = 0; i < a1.length; i++) {
            arr[i] = Math.abs(this.counts[i] - a2[i] - a1[i]);
        }
        return arr;
    }

    offer(o) {

        this.log(`${this.rounds} rounds left`);
        this.threshold = (100 - 50 / (this.max_rounds) * (this.max_rounds - this.rounds)) / 100;
        this.rounds--;
        // if (this.rounds === this.rounds) {
        //     o = this.counts.slice();
        //     for (let i = 0; i < o.length; i++) {
        //         if (!this.values[i])
        //             o[i] = 0;
        //     }
        //     return o;
        // }
        if (o) {
            for (let i = 0; i < this.counts.length; i++) {
                if (!this.values[i])
                    this.myValueableItems[i] = 0;
            }
            this.enemyValueableItems = this.reduce(this.counts, o).slice();
            this.onlyEnemyValueableItems = this.reduce(this.enemyValueableItems, this.myValueableItems).slice();
            this.onlyMyValueableItems = this.reduce(this.myValueableItems, this.enemyValueableItems).slice();
            this.commonValueableItems = this.common(this.enemyValueableItems, this.myValueableItems).slice();
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            this.log(`
                v ${this.values}
                c ${this.counts}
                o ${o} 
                mv ${this.myValueableItems} 
                ev ${this.enemyValueableItems} 
                oev ${this.onlyEnemyValueableItems} 
                omv ${this.onlyMyValueableItems} 
                common ${this.commonValueableItems}
                sum ${sum}`);
                
            if (sum >= this.total * this.threshold) {
                return;
            }
            for (let i = 0; i < this.myOffer.length; i++) {
                if (this.values[i] === 0) {
                    this.myValueableItems[i] = 0;
                    this.commonValueableItems[i] = 0;
                }
            }

            for (let i = 0; i < this.values.length; i++) {
                this.myOffer[i] = Math.max(this.myValueableItems[i], this.commonValueableItems[i])
            }
            

            let minPrice = 10, minIndex = -1, minCounts = 10;
            for (let i = 0; i < this.myOffer.length; i++) {
                if (this.values[i] < minPrice && this.values[i] > 0 && this.commonValueableItems[i] > 0) {
                    minPrice = this.values[i];
                }
            }
            for (let i = 0; i < this.myOffer.length; i++) {
                if (this.myValueableItems[i] < minCounts && this.values[i] == minPrice && minPrice < 5 && this.myValueableItems[i] > 0) {
                    minIndex = i;
                    minCounts = this.myValueableItems[i];
                }
            }
            for (let i = 0; i < this.values.length; i++) {
                this.myOffer[i] = Math.max(this.myValueableItems[i], this.commonValueableItems[i])

            }
            if (minIndex > -1){ 
                this.myOffer[minIndex] -= 1;
                if (this.sum(this.myOffer) < this.total * this.threshold) {
                     this.myOffer[minIndex] += 1;
                }
                else{
                    if(this.commonValueableItems[minIndex] > 0)this.commonValueableItems[minIndex] = this.commonValueableItems[minIndex]- 1;
                    if(this.myValueableItems[minIndex] > 0)this.myValueableItems[minIndex] = this.myValueableItems[minIndex] - 1;
                }
                for (let i = 0; i < this.values.length; i++) {
                    this.myOffer[i] = Math.max(this.myValueableItems[i], this.commonValueableItems[i])
    
                }
            }
            
            
            this.offerSum = this.sum(this.myOffer);
            if (this.offerSum >= this.total * this.threshold) {
                return this.myOffer;
            }
            return this.myOffer;
        }
        o = this.counts.slice();
        for (let i = 0; i<o.length; i++)
        {
            if (!this.values[i])
                o[i] = 0;
        }
        return o;
    }
    sum(myOffer) {
        let offerSum = 0;
        for (let i = 0; i < this.values.length; i++)
            offerSum += this.values[i] * myOffer[i];
        return offerSum;
    }
};
