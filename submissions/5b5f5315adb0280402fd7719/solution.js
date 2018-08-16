class Utility {
    constructor (counts, values, log) {
        this.counts = counts
        this.values = values
        this.log = log
    }

    /**
     * Gets all possible permutations of offers based on the counts of items
     * 
     * @return {Array}
     */
    getOfferPermutations () {
        let variations = {}
        for (let i = 0; i < this.counts.length; i++) {
            let tmp = this.counts.slice()
            let itemCount = this.counts[i]
            while (itemCount >= 0) {
                for (let n = 0; n < tmp.length; n++) {
                    if (n == i) {
                        tmp[n] = itemCount
                    } else {
                        tmp[n] = tmp[n] - 1 >= 0 ? tmp[n] - 1 : this.counts[n]
                    }

                    let forSave = Array.from(tmp)
                    let forSaveKey = forSave.join('')
                    variations[forSaveKey] = forSave
                }
                itemCount--
            }
        }
        return Object.values(variations)
    }

    /**
     * Return the total value of an offer
     * @param {*} offer 
     */
    getOfferValue (offer) {
        let self = this
        return offer.reduce((acc, count, i) => {
            return acc + (count * self.values[i])
        }, 0)
    }

    /**
     * Sort a list of offers by value ASC
     * @param {Array} offers 
     * @return {Array}
     */
    sortOffersByValueAsc (offers) {
        let self = this
        return offers.sort((a, b) => self.getOfferValue(a) - self.getOfferValue(b))
    }

    /**
     * filters a list of offer permutations by keeping offers
     * of duplicate values (my POV) that would most likely be most acceptable to opponent (most count of an item opp POV)
     * 
     * @param {Array} offers 
     * @return {Array}
     */
    filterByBestOpponentValue (offers) {
        let map = {}
        let self = this
        return offers.filter(offer => {
            let val = self.getOfferValue(offer)
            let totalCounts = offer.reduce((acc, item) => acc + item, 0)
            if (map[val]) {
                if (totalCounts < map[val].reduce((acc, item) => acc + item, 0)) {
                    map[val] = offer
                    return true
                }
                return false
            } else {
                map[val] = offer
                return true
            }
        })
    }

    /**
     * Checks if 2 arrays are equal
     * 
     * @param {Array} a 
     * @param {Array} b 
     * @reutnr {Boolean}
     */
    isSameArray (a, b) {
        return JSON.stringify(a) == JSON.stringify(b)
    }

    /**
     * Checks if an offer is the for everything
     * 
     * @param {Array} offer 
     * @return {Boolean}
     */
    isEverythingOffer (offer) {
        return this.isSameArray(offer, this.counts)
    }

    /**
     * Get my offer based on round
     * 
     * @param {*} offers 
     * @param {*} round 
     * @return {Array}
     */
    getMyOffer (offers, round) {
        let index = offers.length - round
        if (index < 0) {
            index = offers.length + index
        } else if (index === offers.length) {
            index = offers.length - 1
        }
        return offers[index]
    }
}

let util = null

module.exports = class Agent {
    constructor(me, counts, values, maxRounds, log) {
        this.counts = counts
        this.values = values
        this.rounds = maxRounds
        this.maxRounds = maxRounds

        util = new Utility(counts, values, log)

        this.total = util.getOfferValue(counts)
        this.log = log
        this.me = me

        let self = this

        this.offers = util.sortOffersByValueAsc(util.getOfferPermutations())
            .filter(offer => !util.isEverythingOffer(offer))
            .filter(offer => util.getOfferValue(offer) !== 0)
            .filter(offer => util.getOfferValue(offer) >= Math.round(self.total * .6))

        this.offers = util.filterByBestOpponentValue(this.offers)
    }

    offer(o) {
        let myOffer = util.getMyOffer(this.offers, this.maxRounds - this.rounds)
        if (!myOffer) {
            myOffer = this.offers[this.offers.length - 1]
        }
        let myOfferValue = util.getOfferValue(myOffer)
        this.minimumAcceptance = myOfferValue

        if (o) {
            let offerValue = util.getOfferValue(o)
            if (
                offerValue >= this.minimumAcceptance ||
                (!this.rounds && offerValue)
            ) {
                return
            }
        }

        return myOffer
    }
}