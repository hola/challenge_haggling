'use strict';

const
    VERSION = 53,
    filter = (p, f) => state => p(state) ? f(state) : adviceEmpty(state),
    or = (...args) => (...argsInner) => args.some(a => a(...argsInner)),
    and = (...args) => (...argsInner) => args.every(a => a(...argsInner)),
    not = f => arg => !f(arg),
    ifElse = (pred, ok, fail) => (...args) => pred(...args) ? ok(...args) : fail(...args),

    isFirstMove = state => state.me.firstMove,
    isFirstRound = state => state.round === 1,
    isLastRound = state => state.round === state.rounds,
    isEverythingValuable = state => state.objects.every(object => object.value),
    isSingleValuable = state => state.objects.some(object => object.value === state.total),
    isSingleValuableCnt = state => state.objects.some(object => object.count > 1 && object.count * object.value === state.total),

    getOfferCounts = (state, f) => state.objects.map(f.bind(null, state)),
    objIsValuable = (state, object) => object.value,
    cntZero = _ => 0,
    cntMax = (state, object) => object.count,
    cntWithoutSomeValuables = (state, object, idx) => {
        let item = state.valuablesToOffer.find(o => o.idx === idx);

        return item ? object.count - item.count : object.count;
    },
    cntRoundPerc = (state, object) => Math.round(object.count * .75 * (1 - (state.round - 1) / (state.rounds - 1))),

    advice = (cntCb, reason, weight) => state => [getOfferCounts(state, cntCb), reason, weight],
    adviceEmpty = state => advice(cntZero, '', 0)(state);

module.exports = class Agent {
    constructor(me, counts, values, rounds, log) {
        this.log = log;
        let objects = counts.map((count, idx) => ({
                idx,
                count,
                value: values[idx],
                possibleCounts: [...Array(count + 1).keys()].map(i => ({idx: idx, count: i, value: values[idx] * i}))
            })),
            total = this.calcTotal(objects);

        let getAllValuablesCounts = (valuables, idx) => {
            return valuables[idx].possibleCounts
                .map(i => valuables[idx + 1]
                        ? getAllValuablesCounts(valuables, idx + 1).map(item => [{idx: i.idx, count: i.count, value: i.value}].concat(item))
                        : [[{idx: i.idx, count: i.count, value: i.value}]])
                .reduce((a, v) => a.concat(v), []);
        }

        this.log(objects.map((obj, idx) => ` [(${idx}) count: ${obj.count}, value:${obj.value}]`));
        this.state = {
            round: 0,
            rounds,
            objects,
            total,
            canGiveBySum: getAllValuablesCounts(objects.filter(object => object.value), 0)
                .reduce((a, v) => {
                    let sum = v.reduce((a, v) => a + v.value, 0);
                    a[sum] = a[sum] || [];
                    a[sum].push(v);
                    return a;
                }, {}),
            rival: {
                offers: [],
                weights: objects.map(object => 1 / object.count), //initial unknown
                expectedValues: null
            },
            me: {
                firstMove: me === 0,
                offers: [],
                canGiveValue: 0
            }
        }

        const maxObjectsCount = counts.map(i => Math.floor(this.state.total / i))

        let calcPossibleValues = (idx, total) => {
            let values = [...Array(maxObjectsCount[idx] + 1).keys()]
                .reduce((a, value) => {
                    let remainder = total - value * counts[idx];
                    if(remainder >= 0) {
                        a.push({idx, count: counts[idx], value, remainder});
                    }
                    return a;
                }, [])

            if(counts.length === idx + 1) {
                return values;
            } else {
                return values.map(val => calcPossibleValues(idx + 1, val.remainder)
                    .map(v => [val].concat(v))
                ).reduce((a, v) => a.concat(v), [])
            }
        }
        this.state.allPossibleValues = calcPossibleValues(0, this.state.total)
            .filter(items => items[items.length - 1].remainder === 0)
            .map(items => items.map(i => i.value))
            .filter(items => items.toString() !== values.toString());
    }
    offer(offer) {
        let result;

        this.update(offer);
        this.log(`round ${this.state.round}/${this.state.rounds}`);

        if(!offer || !this.isAccepted(offer)) {
            result = this.makeOffer();
            this.isAccepted(result, true); //log
        }

        if(result) {
            this.state.me.offers.push(result);
        }

        this.log(`v${VERSION} result: ${result}`);
        return result;
    }
    update(offer) {
        this.state.round++;

        if(offer) {
            this.state.rival.offers.push(offer);
            let offers = this.state.rival.offers;
            this.state.rival.weights = this.state.objects
                .map((object, idx) => offers
                    .reduce((a, v, oidx) => {
                        let diff = object.count - v[idx];

                        if(oidx) {
                            diff = .7 * diff + .3 * a;
                        }

                        return diff;
                    }, 0) / object.count
                )
        }

        let canGiveMinValue = Math.min(...this.state.objects
                .filter(object => object.value > 0 && object.value < this.state.total / 3)
                .map(object => object.value * Math.round(object.count * .6))
            );

        let canGiveStat = [{
                pred: state => state.rival.offers.length > 0 && state.rival.offers.every(offer => offer.every(i => i === 0)),
                calc: state => state.total * state.round / state.rounds / 1.75,
                weight: 50
            }, {
                pred: state => state.rival.offers.length > 1 && state.rival.offers
                    .map(this.calcOfferTotal.bind(this))
                    .every(offer => offer <= state.total * .3),
                calc: state => {
                    let k = state.round / state.rounds;
                    return state.total * (.1 + k ** 2 / 2.5);
                },
                weight: 1
            }, {
                pred: and(isEverythingValuable, isFirstMove, not(isLastRound)),
                calc: state => {
                    let k = state.round / state.rounds;
                    return Math.max(canGiveMinValue, state.total * k ** 2 / 2.25);
                },
                weight: 10
            }, {
                pred: and(isEverythingValuable, not(isFirstMove), not(isLastRound)),
                calc: state => {
                    let k = state.round / state.rounds;
                    return Math.max(canGiveMinValue, state.total * k ** 3 / 1.5);
                },
                weight: 10
            }, {
                pred: not(isFirstMove), //fallback
                calc: state => {
                    let k = state.round / state.rounds;
                    return state.total * k ** 5 / 1.1;
                },
                weight: 1
            }, {
                pred: isFirstMove, //fallback
                calc: state => {
                    let k = state.round / state.rounds;
                    return state.total * k ** 5/ 2.25;
                },
                weight: 1
            }]
            .map(item => item.pred(this.state) ? [item.calc(this.state), item.weight] : [0, 0])
            .reduce((stat, item) => {
                let [value, weight] = item;

                stat.weight += weight;
                stat.value += value * weight;

                return stat;
            }, {
                value: 0,
                weight: 0
            });

        this.state.me.canGiveValue = canGiveStat.weight
            ? Math.round(canGiveStat.value / canGiveStat.weight)
            : 0;

        let expectedValuesWeights = this.state.allPossibleValues
            .map((values, idx) => ({idx, values}))
            .filter(i => {
                return !this.state.me.offers.some((offer, idx) => offer
                    .map((count, idx) => (this.state.objects[idx].count - count) * i.values[idx])
                    .reduce((a, v) => a + v, 0) >= this.state.total * .9
                )
            })
            .map(i => ({
                idx: i.idx,
                values: i.values,
                weight: i.values
                    .map((value, idx) => ({idx, value: value * this.state.objects[idx].count / this.state.total}))
                    .reduce((a, v) => a + v.value * this.state.rival.weights[v.idx], 0)
            }))
            .filter(i => i.weight >= .75)

        let expectedValues = expectedValuesWeights.reduce((a, v) => a.concat([{values: this.state.allPossibleValues[v.idx], weight: v.weight}]), [])
        if(expectedValues.length) {
            let totalWeight = expectedValuesWeights.reduce((a, v) => a + v.weight, 0);
            this.state.rival.expectedValues = expectedValues
                .reduce((a, v) => {
                    v.values.forEach((i, idx) => a[idx] += i * v.weight);

                    return a;
                }, this.state.objects.map(_ => 0))
                .map(i => i / totalWeight)
        } else {
            this.state.rival.expectedValues = null;
        }
        this.log(`expected values for rival: ${this.state.rival.expectedValues}`);
        this.state.valuablesToOffer = this.getValuablesToOffer(this.state.me.canGiveValue, isFirstMove(this.state) ? .45 : .35) || [];
    }
    makeOffer() {
        let result,
            stat = [
                filter(
                    and(
                        state => state.me.canGiveValue > 0,
                        or(
                            and(isFirstRound, isEverythingValuable),
                            and(not(isSingleValuable), not(isSingleValuableCnt))
                        )
                    ),
                    advice(ifElse(objIsValuable, cntWithoutSomeValuables, cntZero), `value without some valuables, give some other`, 10)
                ),
                filter(
                    or(isSingleValuable, isSingleValuableCnt),
                    advice(ifElse(objIsValuable, cntMax, cntRoundPerc), 'single valuable', 100)
                ),
                advice(ifElse(objIsValuable, cntMax, cntRoundPerc), 'fallback', 1)
            ]
            .map(f => f(this.state))
            .filter(res => res[2]) //weight
            .reduce((stat, item) => {
                let [count, reason, weight] = item;

                stat.weight += weight;
                stat.count = stat.count.map((val, idx) => val + count[idx] * weight)
                stat.reasons.push(`<${reason}>`);

                return stat;
            }, {
                count: this.state.objects.map(_ => 0),
                reasons: [],
                weight: 0
            });

        if(stat.weight) {
            result = stat.count.map(val => Math.round(val / stat.weight));
        } else {//if no fallback
            result = getOfferCounts(this.state, cntMax);
        }
        this.log(`stat: ${Object.keys(stat).map(k => ` ${k}: ${stat[k]}`)}`);
        this.log(`result: ${result}`)
        return result;
    }
    isAccepted(offer, my = false) {
        let total = this.calcOfferTotal(offer),
            totalForRival = this.calcTotalForRival(offer);

        this.log(`check offer total: ${total}/${totalForRival}/${this.state.total} (${my ? 'my' : 'rival'})`);

        return total >= totalForRival || total >= this.state.total - this.state.me.canGiveValue;
    }
    calcTotal(objects) {
        return objects.reduce((a, v) => a + v.count * v.value, 0);
    }
    calcTotalForRival(offer) {
        let result = this.state.total;
        if(this.state.rival.expectedValues) {
            result = offer.reduce((a, v, idx) => a + (this.state.objects[idx].count - v) * this.state.rival.expectedValues[idx], 0);
        }
        return result;
    }
    calcOfferTotal(offer) {
        return this.calcTotal(this.state.objects.map((object, idx) => ({
            count: offer[idx],
            value: object.value
        })));
    }
    getValuablesToOffer(totalValue, k) {
        let possibleVariants = Object.keys(this.state.canGiveBySum)
                .filter(k => +k > 0 && +k <= totalValue)
                .reduce((a, v) => a.concat(this.state.canGiveBySum[v]), []),
            found;

        if(possibleVariants.length) {
            found = this.getMaxWeightForItems(possibleVariants, k);
        }

        return found;
    }
    getMaxWeightForItems(arr, k1) {
        let found;

        let k = k1 + (1 - (this.state.round - 1) / (this.state.rounds - 1)) * (1 - k1);
        if(this.state.rival.expectedValues) {
            found = arr
                .map(items => ({weight: items.reduce((a, v) => a + v.count * this.state.rival.expectedValues[v.idx], 0), items, total: items.reduce((a, v) => a + v.value, 0)}))
                .map(i => Object.assign(i, {w: k * i.weight + (1 - k) * (this.state.total - i.total)}))
                .sort((a, b) => b.w - a.w)[0]; //best
        }
        if(!found) {
            found = arr
                .map(items => ({weight: items.reduce((a, v) => a + v.count * this.state.rival.weights[v.idx], 0), items}))
                .sort((a, b) => k <= .5 ? a.weight - b.weight : b.weight - a.weight)[0];
        }

        return found ? found.items : arr[0];
    }
};
