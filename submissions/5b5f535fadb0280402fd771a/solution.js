'use strict'

const MIN_OFFER_VALUE = 4

module.exports = class Agent {

    constructor (me, counts, values, max_rounds, log) {
        this.values = values

        this.myOffers = this.getMyOffers(counts, max_rounds, me)
        this.nextOfferIndex = 0
    }

    offer (offer) {

        const myOffer = this.myOffer()

        if (this.offerValue(offer) >= this.offerValue(myOffer)) {
            return
        }

        this.patchMyOffers(offer)

        return myOffer
    }

    myOffer () {

        const offer = this.myOffers[this.nextOfferIndex++]

        return offer ? offer : this.myOffers[this.myOffers.length - 1]
    }

    patchMyOffers (offer) {

        const offerValue = this.offerValue(offer)

        if (offerValue < MIN_OFFER_VALUE) {
            return
        }

        const offerToReplaceIndex = this.myOffers
            .findIndex(myOffer => offerValue >= this.offerValue(myOffer))

        this.myOffers[offerToReplaceIndex] = offer
    }

    offerValue (offer = []) {
        return offer.reduce((value, itemsCount, item) => {
            const itemsValue = itemsCount * this.values[item]
            return value + itemsValue
        }, 0)
    }

    getMyOffers (counts, rounds, me) {

        if (me) { rounds-- }

        const offers = this.getAcceptableOffersByDesc(counts)

        const maxValue = this.offerValue(offers[0])
        const minValue = this.offerValue(offers[offers.length - 1])

        const range = maxValue - minValue

        const step = range / ( rounds - 1 )

        const myOffers = []

        let lastStoredOfferIndex = -1

        for (let v = maxValue, i = 0; i < rounds; v -= step, i++) {

            let closestItemIndex = lastStoredOfferIndex + 1,
                minDistance = Infinity

            for (let j = lastStoredOfferIndex + 1; j < offers.length; j++) {
                const currentDistance = Math.abs(this.offerValue(offers[j]) - v)
                if (currentDistance < minDistance) {
                    minDistance = currentDistance
                    closestItemIndex = j
                }
            }

            if (offers[closestItemIndex]) {
                myOffers.push(offers[closestItemIndex])
                lastStoredOfferIndex = closestItemIndex
            }
        }

        return myOffers
    }

    getAcceptableOffersByDesc (counts) {

        const offers = allPossibleOffers(counts)

        return offers
            .filter(offer => this.offerValue(offer) >= MIN_OFFER_VALUE)
            .filter(offer => offer.every((n, index) => !n || this.values[index] !== 0))
            .sort((o1, o2) => this.offerValue(o2) - this.offerValue(o1))
    }
}

function allPossibleOffers (counts) {

    let offers = []

    for (const count of counts) {
        offers = combine(offers, count)
    }

    return offers
}

function combine (prefixCombinations = [], count) {

    const combinations = []

    for (let c = 0; c <= count; c++) {
        if (prefixCombinations.length) {
            for (const comb of prefixCombinations) {
                combinations.push(comb.concat(c))
            }
        } else {
            combinations.push([c])
        }
    }

    return combinations
}
