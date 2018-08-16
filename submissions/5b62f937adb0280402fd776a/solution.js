'use strict';
/*jslint node:true*/

const ACCEPT_OFFER = "accept_offer";
const DO_NOT_ACCEPT_OFFER = "do_not_accept_offer";

const fold = (value) => (ifEmpty, ifExist) => value == null ? ifEmpty() : ifExist(value);
const iff = (value) => (ifTrue, ifFalse) => Boolean(value) ? ifTrue() : ifFalse();
const inspect = (value, fn) => {
    fn(value);
    return value
};

const map = (value, fn) => fn(value);

const minAccept = 0.7;
const lastMinAccept = 0.3;
const greatOffer = 0.8;

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.log = log;

        this.counts = Object.freeze(counts);
        this.values = Object.freeze(values);
        this.allValuable = Object.freeze(this.values.map((v, i) => v > 0 ? this.counts[i] : 0));
        log("All: " + this.allValuable);

        this.goodsCount = counts.length;
        this.totalRounds = max_rounds;
        this.total = counts.reduce((sum, count, index) => sum + this.values[index] * count, 0);
        this.isFirstMove = me === 0;

        this.myOffers = [];
        this.compOffers = [];
        this.currentRound = 0;

        this.possibleOffers = this.allPossibleOffers();

        log("First move: " + this.isFirstMove);
        log(values)
    }

    offer(o) {
        this.currentRound++;

        if (o) {
            this.log("Comp offer: " + this.calculateValue(o));
            this.compOffers = [...this.compOffers, o];
        }

        return map(
            fold(o)(
                () => this.allValuable,
                (offer) => iff(this.isGreatOffer(offer))(
                    () => ACCEPT_OFFER,
                    () => this.processOffer(offer)
                )
            ),
            (o) => {
                this.log("My offer: " + o);
                switch (o) {
                    case ACCEPT_OFFER:
                        return undefined;
                    case DO_NOT_ACCEPT_OFFER:
                        return this.allValuable;
                    default:
                        /* if (this.compOffers.length > 0 && o) {
                             this.log("Estimated value for comp: " + this.calculateCompValue(o, this.estimatedCompValues()));
                         }*/
                        this.myOffers = [...this.myOffers, o];
                        return o;
                }
            });
    }

    isGreatOffer(offer) {
        return this.calculateValue(offer) >= greatOffer
    }

    allPossibleOffers() {
        function allOptions(arr, index, cb) {
            if (index === arr.length - 1) {
                const a = [...arr];
                for (let i = a[index]; i >= 0; i--) {
                    cb([...a]);
                    a[index]--;
                }
            } else {
                const a = [...arr];
                for (let i = a[index]; i >= 0; i--) {
                    allOptions(a, index + 1, cb);
                    a[index]--;
                }
            }
        }

        let result = [];
        allOptions(this.allValuable, 0, (offer) => {
            const value = this.calculateValue(offer);
            if (value > 0) {
                result = [...result, {offer, value}]
            }
        });

        return result;
    }

    possibleOffersSorted() {
        const compValues = this.estimatedCompValues();
        this.log("Comp values: " + compValues);
        return [...this.possibleOffers]
            .map(o => ({...o, compValue: this.calculateCompValue(o.offer, compValues)})).sort((o1, o2) => {
                let result = o2.value - o1.value;
                if (Math.abs(result) <= 0.01) {
                    return o2.compValue - o1.compValue;
                }

                return result;
            })
    }

    processOffer(offer) {
        const myOffer = this.executeStrategy(
            offer,
            this.reduceMyValue.bind(this),
            this.acceptIfSomeValue.bind(this)
        );

        return iff(this.isBetterOffer(myOffer, offer))
        (
            () => inspect(ACCEPT_OFFER, () => this.log("Accepting offer as it is better than mine")),
            () => myOffer
        )
    }

    isBetterOffer(offer, otherOffer) {
        return offer !== ACCEPT_OFFER && offer !== DO_NOT_ACCEPT_OFFER && this.calculateValue(offer) <= this.calculateValue(otherOffer)
    }

    reduceMyValue(offer) {
        const possibleOffers = this.possibleOffersSorted();
        this.log("Possible offers: " + JSON.stringify(possibleOffers));
        const max = possibleOffers.find(myOffer => !this.madeThisOffer(myOffer.offer) && myOffer.compValue > 0 && myOffer.value >= minAccept);

        this.log("Max: " + JSON.stringify(max));

        return iff(max)(
            () => max.offer,
            () => {
                const valuableOffers = possibleOffers.filter(myOffer => myOffer.compValue > 0 && myOffer.value >= minAccept)
                    .sort((o1, o2) => o2.compValue - o1.compValue);
                if (valuableOffers.length === 0) {
                    return this.allValuable;
                }

                const maxValue = valuableOffers[0].compValue;
                const sameValue = valuableOffers.reduce((arr, o) => iff(o.compValue - maxValue <= 0.1)
                (
                    () => [...arr, o],
                    () => arr
                ), []);
                this.log("Choosing best valuable for competitor: " + JSON.stringify(sameValue));
                const random = Math.round(Math.random() * (sameValue.length - 1));
                this.log("Choosing " + random + " of " + (sameValue.length - 1) + " randomly");
                return sameValue[random].offer;
            }
        )
    }


    executeStrategy(offer, defaultStrategy, finalOffer) {
        return iff(this.isFinalOffer())(
            () => inspect(finalOffer(offer), (fo) => this.log("Processing final offer: " + fo)),
            () => iff(this.isMyFinalOffer())(
                () => this.bestOfferForMe(),
                () => iff(this.isMyLastOffer())(
                    () => this.bestOfferForComp(),
                    () => defaultStrategy(offer)
                )
            )
        )
    }

    bestOfferForComp() {
        const possible = this.possibleOffersSorted().filter(o => o.compValue > 0 && o.value >= lastMinAccept).sort((o1, o2) => {
            return o2.compValue - o1.compValue
        });
        this.log("Best possible for comp: " + JSON.stringify(possible));
        if (possible.length === 0) {
            return this.allValuable;
        } else {
            this.log("Making best offer for comp: " + JSON.stringify(possible[0]));
            return possible[0].offer;
        }
    }

    bestOfferForMe() {
        const possible = this.possibleOffersSorted().filter(o => o.compValue > 0).sort((o1, o2) => {
            let diff = o2.value - o1.value;
            if (Math.abs(diff) < 0.01) {
                diff = o1.compValue - o2.compValue
            }

            return diff
        });
        this.log("Best possible: " + JSON.stringify(possible));
        if (possible.length === 0) {
            return this.allValuable;
        } else {
            this.log("Making best offer for me: " + JSON.stringify(possible[0]));
            return possible[0].offer;
        }
    }

    acceptIfSomeValue(offer) {
        return iff(this.calculateValue(offer) > 0)(
            () => ACCEPT_OFFER,
            () => DO_NOT_ACCEPT_OFFER
        )
    }

    madeThisOffer(offer) {
        return !!this.myOffers.find(prev => this.isTheSameOffer(prev, offer))
    }


    isTheSameOffer(offer1, offer2) {
        return !offer1.find((count, index) => count !== offer2[index])
    }

    isMyFinalOffer() {
        return this.currentRound === this.totalRounds && this.isFirstMove
    }

    isMyLastOffer() {
        return this.currentRound === this.totalRounds - 1 && !this.isFirstMove
    }

    isFinalOffer() {
        return this.currentRound === this.totalRounds && !this.isFirstMove;
    }

    estimatedCompValues() {
        if (this.compOffers.length === 0) {
            return undefined;
        }
        let sum = this.emptyOffer();
        for (let i = 0; i < this.compOffers.length; i++) {
            const compOffer = this.compOffers[i];
            for (let j = 0; j < this.goodsCount; j++) {
                sum[j] += (this.counts[j] - compOffer[j]) / this.counts[j];
            }
        }

        let avg = [];
        for (let i = 0; i < this.goodsCount; i++) {
            avg.push(sum[i] / this.compOffers.length)
        }

        this.log("Avg: " + avg);

        let k = 1 / this.goodsCount;

        let values = [];

        for (let i = 0; i < this.goodsCount; i++) {
            values.push(k * avg[i])
        }

        return values;
    }

    calculateCompValue(offer, compValues) {
        return offer.reduce((sum, count, index) => sum + compValues[index] * (this.counts[index] - count), 0)
    }

    emptyOffer() {
        let offer = [];
        for (let i = 0; i < this.goodsCount; i++) {
            offer.push(0);
        }

        return offer;
    }

    calculateValue(counts) {
        return counts.reduce((sum, count, index) => sum + this.values[index] * count, 0) / this.total;
    }
};



