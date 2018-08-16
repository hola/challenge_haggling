'use strict'; /*jslint node:true*/

module.exports = class {
    constructor(me, counts = [], values = [], max_rounds, log = console.log){
        // convert to boolean
        this.imFirst = !me
        this.counts = counts
        this.values = values
        this.rounds = max_rounds
        this.log = log
        this.total = 0
        // minimum valuable item index
        this.minValueIndex = this.values.reduce((maxValueSoFar, currentElement, currentIndex, arr) => currentElement < arr[maxValueSoFar] ? currentIndex : maxValueSoFar, 0)
    }
    offer(offerReceived = 'we do not care about the offer because we are trying to maximize profit, but we need to listen to the other side at least to not seem like a jerk :)'){
        this.log(`${this.rounds} rounds left`)
        this.rounds--
        if(this.rounds === 0){
            // last round
            if(this.imFirst){
                this.log(`final round, negotiating all items except least valuable for max profit`)
                let countsWithoutLeastValuableItem = this.counts.slice(0)
                countsWithoutLeastValuableItem[this.minValueIndex] -= 1
                return countsWithoutLeastValuableItem
            } else {
                this.log(`final round, accepting any offer`)
                // im second accept
                return undefined
            }
        } else {
            this.log(`another round, request all items`)
            // request everything
            return this.counts
        }
    }
};