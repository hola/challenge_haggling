"use strict"
module.exports = class {
    // me is 0 if your turn is first, and 1 if your turn is second.
    // counts is an array of integers, describing how many of each type of object there is. This array is between 2 and 10 elements long.
    // values is an array of integers the same length as counts, describing how much every object is worth to you.
    // max_rounds is the limit on the number of rounds in the negotiations; a round is two turns, one by each partner.
    // log is a function which your code can call to output a message for debugging (console.log won't work).
    constructor(me, counts, values, max_rounds, log){
        this.me = me
        this.counts = counts
        this.values = values
        this.rounds = max_rounds
        this.currentRound = 0
        this.log = log
        this.maxValue = counts.reduce((sum, obj, i) => {sum += values[i]*obj; return sum} , 0)
        this.combinations = this.generateCombinations()
        this.median = this.calculateMedian(this.combinations.map(c => c[c.length - 1]))
        this.combinationsByValue = this.getCombinationsByValue()
        this.combinationsByValueSorted = Object.keys(this.combinationsByValue)
                                                .reduce((acc, cur) => {
                                                    acc[cur] = this.combinationsByValue[cur].sort(this.sortCombinations)
                                                    return acc
                                                }, {})
        this.Q = 0.5
        this.P = 0
        this.offerValues = Object.keys(this.combinationsByValueSorted).map(Number)
        log(`values: ${this.values}`)
        log(`counts: ${this.counts}`)
        log(`offerValues: ${this.offerValues}`)
        // log(`combinations: ${Object.keys(this.combinationsByValueSorted)}`)
        log(`median: ${this.median}`)
    }
    sortCombinations(a,b) {
        const totalValueA = a.reduce((x,y) => x+y, 0)
        const totalValueB = b.reduce((x,y) => x+y, 0)
        return totalValueA - totalValueB
    }

    getCombinationsByValue() {
        return this.combinations.reduce((acc, comb) => {
            if (!acc[comb[comb.length - 1]])
                acc[comb[comb.length - 1]] = []
            acc[comb[comb.length - 1]].push(comb)
            return acc
        }, {})
    }

// o is an array of integers the same size as counts, which describes how many of each type of object the partner offers to you
    // if your turn is first, and this is the first round, o is undefined.
    // The offer method should return undefined if you accept the offer (except when o is undefined). Otherwise,
    // it should be an array of integers the same size as counts, describing how many of each type of object you want for yourself
    // There is a timeout of 1 second per turn, If the code times out, throws an exception or returns an invalid value,
    // it is regarded as walking away from the negotiations, and neither partner receives anything.


    //Algorithm - use different strategy when i'm giving the last offer (my turn is the second)
    // - for this option (last offer by me) - always give offer with maximum value (for me) - with different combinations
    // when the opponent gives an offer with sufficient value (which in this case - the maximum value), accept it
    // - for the second option - accept always the last offer (unless it worth 0 to me), make offers with ascending value (19, 13, 4...)
    // in case the opponent gives an offer with enough value (more that the next offer i'm going to give) - accept it


    //Next try
    // For each combination of items, calculate:
    // - value
    // - enumerator for the maxValue number of offer with the same value (why do we need it?)
    // - number of items left (for the opponent offer)

    // Offer evaluation:
    // Split it into 2, the first part will talk about when we are the first bidders
    // We have a const P which changes according to the round we play (P*Round).
    // 1. Calculate median value for the offers - make an offer with Math.max(1, Math.ciel(Median-P*Round))
    // 2. In case the value of the offer is greater equals the median value => accept it
    //
    // In case we are second bidders (we give the last offer):
    // Q is a constant that changes during the evaluation
    // 1. for each round give the following offer Math.max(1, Math.ciel(MaxValue - Q*Round))

    // For each batch of runs we must check the stats for each Q, P

    //TODO:
    //If the last offer equals 0 => don't accept it
    //Delete an offer i give from the combination list
    //Cannot read property 'shift' of undefined

    // Sending offer

    calculateCombinationValue(count){
        let sum = 0
        count.forEach((c, i) => sum += c * this.values[i])
        return sum
    }
    calculateMedian(numbers) {
        // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
        this.log(`Available values (except 0): ${numbers}`)
        numbers = numbers.slice(0);
        const middle = (numbers.length + 1) / 2
        const sorted = numbers.sort((a, b) => a - b)
        return (sorted.length % 2) ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;
    }
    shift(offerList, value){
        const offer = offerList[value].shift()
        if(offerList[value].length === 0){
            delete offerList[value]
            const index = this.offerValues.indexOf(value)
            this.offerValues.splice(index, 1)
            this.median = this.calculateMedian(Object.keys(offerList).map(Number))
        }
        return offer
    }
    // First step - build combinations table
    generateCombinations(){
        const max = this.counts.length-1
        let r = []
        const arg = this.counts.map(count => [...Array(count+1).keys()])
        const helper = (arr, i) => {
            for (let j=0, l=arg[i].length; j<l; j++) {
                let a = arr.slice(0)
                a.push(arg[i][j])
                if (i === max) {
                    let combinationValue = this.calculateCombinationValue(a)
                    if (combinationValue)
                        r.push(a.concat([combinationValue] ))
                }
                else
                    helper(a, i+1)
            }
        }
        helper([], 0)
        return r
    }
    getClosestValueTo(value){
        this.log(`in closest value to ${value}`)
        if(this.offerValues[0] > value)
            return this.offerValues[0]
        while(true){
            if (this.offerValues.includes(value)){
                return value
            } else {
                value -= 1
            }
        }
    }
    offer(o){
        this.log(`Round ${this.currentRound} begins`)
        this.currentRound++
        // I'm the second player, and therefore i'm giving the last offer
        if(this.me) {
            this.log(`I'm the second player`)
            if (o) {
                let offerValue = o.reduce((sum, obj, i) => {
                    sum += obj * this.values[i];
                    return sum
                })
                this.log(`The offer i got values: ${offerValue}`)
                if (offerValue >= this.median)
                    return
            }
            // Prepare an offer
            let offerValue = Math.max(1, this.getClosestValueTo(Math.ceil(this.maxValue - this.Q*this.currentRound)))
            this.log(`Round: ${5 - this.rounds}, offerValue: ${offerValue}`)
            let offer = this.combinationsByValueSorted[offerValue][0]
            let myOffer = offer.slice()
            myOffer.splice(-1,1)
            this.log(`my offer:  ${myOffer}`)
            return myOffer
        } else {
            if (o) {
                this.log(`got an offer ${o}`)
                let sum = o.reduce((sum, obj, i) => {
                    sum += obj * this.values[i];
                    return sum
                })
                this.log(`offer value: ${sum}`)
                //Accept order that are greater than the total value we can get
                if (sum >= this.maxValue / 2)
                    return
                //This is the last round - agree to the offer only if the value is greater than 0
                if (this.currentRound+1 === this.rounds && sum > 0)
                    return
            }
            //Build offer => get the median value, and offer the best offer for him (max items left)
            let offerValue = this.getClosestValueTo(Math.max(1, Math.ceil(this.median-this.P*this.currentRound)))
            this.log(`offerValue: ${offerValue}`)
            let offer = this.shift(this.combinationsByValueSorted, offerValue)
            let myOffer = offer.slice()
            myOffer.splice(-1,1)
            this.log(`my offer:  ${myOffer}`)
            return myOffer
        }
    }
}