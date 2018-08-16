'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(firstMove, counts, values, max_rounds, log) {
        this.init(firstMove, counts, values, max_rounds, log)
    }
    offer(o) {
        // if (o && !!this.steps[this.step] && !(this.steps[this.step].rival)) {
        //     this.steps[this.step].rival = o
        // } else {
            this.steps.push({
                rival: o
            })
        // }
        if (o) {
            this.analyzeOffer(o)
        }
        let offer
        if (this.step === 0) {
            offer = this.createStrategy(o)
        } else {
            offer = this.updateStrategy(o)
        }
        this.steps[this.step].offer = offer
        // if (o) {
            this.step++
        // }
        // this.steps.push({ rival: o, offer: offer })
        // this.config.log(offer.offer)
        return offer.offer
    }
    analyzeOffer(o) {
        let rivalOffer = this.diffCounts(o)
        this.rivalWantsAll = this.isEqual(rivalOffer, this.config.counts)
        // let rivalHistory = []
        // this.steps.forEach(s => {if (s && s.rival) { rivalHistory.push(this.diffCounts(s.rival))}})
        if (!this.rivalWantsAll) {
            let reArr = [];
            for (let i = 0; i < this.config.counts.length; i++) {
                if (rivalOffer[i] === this.config.counts[i]) {
                    if (this.step > this.config.maxRounds / 4) {
                        reArr.push('[^0]\\d+')
                    } else {
                        reArr.push('\\d+')
                    }
                } else {
                    if (this.step === 0) {
                        if (rivalOffer[i] === 0) {
                            if (this.config.counts[i] > 1) {
                                reArr.push('0(?!\\d)')
                            } else {
                                reArr.push('(?:1(?!\\d)|0(?!\\d))')
                            }
                        } else {
                            reArr.push('(?:1(?!\\d)|0(?!\\d))')
                        }
                    } else {
                        if (rivalOffer[i] === 0) {
                            if (this.config.counts[i] > 1) {
                                reArr.push('(?:1(?!\\d)|0(?!\\d))')
                            } else {
                                reArr.push('(?:1(?!\\d)|0(?!\\d)|2(?!\\d))')
                            }
                        } else {
                            reArr.push('(?:1(?!\\d)|0(?!\\d)|2(?!\\d))')
                        }
                    }
                }
            }
            this.estRivalValues = this.rivalValues.filter(rv => rv.join(',').match(new RegExp('^' + reArr.join(',') + '$')))
            // if (this.step > 1 || rivalOffer.reduce((s, o) => s + (+o === 0), 0) > 1) {
                this.estRivalValues = this.estRivalValues.filter(rv => rv.every((rvi, i) => (!rivalOffer[i] || rvi !== 0)))
            // }
            // this.estRivalValues.forEach(erv => { this.config.log(erv) })
        }
    }
    init(firstMove, counts, values, maxRounds, log) {
        this.config = {
            firstMove: !firstMove,
            counts: counts,
            values: values,
            maxRounds: maxRounds,
            log: log,
            total: counts.reduce((s, c, i) => (s + c * values[i]), 0),
        }
        this.config.haveOnlyOneValuable = counts.some(c => c === this.total)
        this.config.haveOneValuable = counts.some(c => c > this.total / 2)
        this.variants = this.calcVariants(counts, values)
        this.oVariants = {}
        this.variants.forEach((li, idx) => (
            this.oVariants[li[0].join(',')] = idx
        ))
        this.rivalValues = this.getPossibleRivalValues(counts, this.config.total, 0)
        this.steps = []
        this.step = 0
    }
    diffCounts(offer) {
        return this.config.counts.map((c, i) => (c - offer[i]))
    }
    maxRivalProfit(offer, rivalValues, excludeValues) {
        const rVals = rivalValues || this.rivalValues,
            me = this
        return rVals.reduce((max, rv) => {
            if (!excludeValues || !excludeValues.some(ev => (me.isEqual(rv, ev)))) {
                const oSum = offer.reduce((s, o, i) => (s + o * rv[i]), 0)
                return max.sum > oSum ? max : (max.sum === oSum ? [].concat([max.values], [rv]) : { sum: oSum, values: [rv] })
            } else { return max }
        }, { sum: 0, values: null })
    }
    createStrategy(offer) {
        let res
        // if (offer) {
        //     res = this.getExampleOffer(offer)
        //     if (res) {
        //         this.exampleOffered = true
        //     }
        // }
        // if (!res) {
            res = this.getFirstOffer()
        // }
        return res
    }
    getExampleOffer(offer, excludeValues) {
        let res
        const total = this.config.total,
            rivalOffer = this.diffCounts(offer)
        let rivalVals = this.estRivalValues
        if (!rivalVals) {
            rivalVals = this.rivalValues.filter(rv => (rivalOffer.reduce((s, o, i) => (s + o * rv[i]), 0) === total))
        }
        if (!rivalVals) {
            return { offer: null, isNotExample: true }
        }
        let startIndex = 0
        if (this.step > 0 && this.steps[this.step - 1].testExample) {
            startIndex = this.oVariants[this.steps[this.step - 1].offer.join(',')] + 1 || 0
        }
        const vars = this.variants.slice()
        for (let i = startIndex; i < vars.length; i++) {
            let v = vars[i],
                rProfit = this.maxRivalProfit(this.diffCounts(v[0]), rivalVals, excludeValues);
            if (!rProfit) { break }
            if (rProfit.sum <= v[1] && rProfit.sum >= (this.config.total / 2)) {
                // this.config.log([v[0], rProfit.sum, v[1], this.config.total])
                let saveRivalValues = rProfit.values.slice()
                if (excludeValues) {
                    saveRivalValues = saveRivalValues.concat(excludeValues)
                }
                // this.config.log(saveRivalValues)
                // saveRivalValues.forEach(srv => { this.config.log(srv) })
                res = { offer: v[0], rivalValues: saveRivalValues, testExample: true }
                break
            }
        }
        if (!res) {
            res = { offer: this.variants[this.step + 1 + Math.floor(this.step * this.config.maxRounds / 20)][0], exampleCollision: true }
        }
        return res
    }
    getFirstOffer() {
        let res
            // const list = this.variants,
            //     oList = this.oVariants
        res = { offer: this.variants[1][0].slice() }
            // const reg = new RegExp(this.config.counts.map((c) => (c === 1 ? 1 : '\\d*')).join(','))
            // let vars = Object.keys(oList).filter(k => k.match(reg)).map((k) => oList[k]).map(i => list[i]);
            // vars.sort((a, b) => (b[1] - a[1] === 0 ? a[0].reduce((s, e) => (s + e), 0) - b[0].reduce((s, e) => (s + e), 0) : a[1] - b[1]))
            // for (let i = 0; i < vars.length; i++) {
            //     const v = vars[i];
            //     const mrp = this.maxRivalProfit(this.diffCounts(v[0]))
            //     if (mrp && (mrp.sum <= v[1])) {
            //         res = { offer: v[0] }
            //         break
            //     }
            // }
        if (!res) {
            res = { offer: this.variants[this.step + 1 + Math.floor(this.step * this.config.maxRounds / 20)][0] }
        }
        return res
    }
    updateStrategy(offer) {
        if (offer) {
            const offered = offer.reduce((s, o, i) => (s + o * this.config.values[i]), 0)
                // this.config.log(offered)
            if (offered >= this.config.total - 1 || (!this.config.firstMove && offered >= this.config.total * 0.7)) {
                return {
                    offer: undefined
                };
            } else if (!this.config.firstMove && this.roundsLeft() <= 2 && offered >= 3 + Math.random() * this.config.total / 4) {
                return {
                    offer: undefined
                };
            } else if (!this.config.firstMove && this.roundsLeft() <= 1 && offered >= 2 + Math.random() * this.config.total / 4) {
                return {
                    offer: undefined
                };
            }
        }
        // const rivalOffer = this.diffCounts(offer)
        // this.config.log([this.step, this.isEqual(this.steps[this.step - 1].rival, offer), this.steps[this.step - 1].testExample])

        if ((this.step > 0 && this.steps[this.step - 1].rival && this.isEqual(this.steps[this.step - 1].rival, offer)) && (this.steps[this.step - 1].offer.testExample)) {
            // this.config.log('here')
            // this.config.log(this.steps[this.step - 1].rivalValues)
            return this.getExampleOffer(offer, this.steps[this.step - 1].offer.rivalValues)
        }
        const prevOffer = this.steps[this.step - 1].offer.offer
        const prevOfferIndex = this.getVariantIndex(prevOffer)
        const prevValue = prevOffer.reduce((s, o, i) => (s + o * this.config.values[i]), 0)
        const prevOfferItems = prevOffer.reduce((s, o) => (s + o), 0)
        const totalItems = this.config.counts.reduce((s, o) => (s + o), 0)
        if (this.config.firstMove && this.roundsLeft() <= 1 && Math.random() >= 0.25) { // last round - more gold
            // if (prevValue === 10) {
            //     if (totalItems - prevOfferItems >= 3)
            return {
                offer: this.steps[this.step - 2].offer.offer
            }
            //     else {
            //         return {
            //             offer: prevOffer.slice()
            //         }
            //     }
            // }
            // return {
            //     offer: prevOffer.slice()
            // }
        }
        if (this.config.firstMove && this.roundsLeft() <= 1) {
            return {
                offer: this.steps[this.step - 2].offer.offer
            }
        }
        if (this.config.haveOnlyOneValuable) {
            let acceptVars = []
            for (let i = 0; i < this.variants.length; i++) {
                if (this.variants[i][1] === this.config.total) {
                    acceptVars.push(this.variants[i][0].slice())
                } else {
                    break
                }
            }
            if (this.roundsLeft() <= 1) {
                return { offer: acceptVars[acceptVars.length - 1] }
            }
            if (acceptVars[this.step + 1]) {
                return { offer: acceptVars[this.step + 1] }
            } else {
                return {
                    offer: acceptVars[acceptVars.length - 1]
                }
            }
            // const resOffer = []
            // const totalItems = this.config.counts.reduce((s, o) => s + o, 0)
            // const totalTypes = this.config.counts.length
            // for (let i = 0; i < this.config.counts.length; i++) {
            //     if (this.config.values[i]) {
            //         resOffer.push(0)
            //         continue
            //     }

            // }
        }
        if (this.config.haveOneValuable) {
            if (this.config.firstMove || this.step < this.config.maxRounds / 2) {
                return { offer: this.variants[this.step + 1][0] }
            } else {
                let ix = 0,
                    minValue
                this.config.values.forEach(v => { if (v > this.config.total / 2) { minValue = v } })
                for (let i = 0; i < this.variants.length; i++) {
                    if (this.variants[i][1] === minValue) {
                        ix = i
                        break
                    }
                }
                return {
                    offer: this.variants[ix + (this.step - Math.ceil(this.config.maxRounds / 2))][0]
                }
            }
        }
        if (this.estRivalValues && this.estRivalValues.length > 0) {
            let res
            for (let i = 0; i < this.variants.length; i++) {
                const v = this.variants[i];
                const mrp = this.maxRivalProfit(this.diffCounts(v[0]), this.estRivalValues)
                if (mrp && (mrp.sum <= v[1]) && v[1] < this.config.total && v[1] >= this.config.total - this.step - 1) {
                    res = { offer: v[0] }
                    break
                }
            }
            if (res) {
                return res
            }
        }
        return {
            offer: this.variants[this.step + 1 + Math.floor(this.step * this.config.maxRounds / 20)][0]
        }
    }
    isEqual(arr1, arr2) {
        return arr1.every((a, i) => (+a === +arr2[i]))
    }
    roundsLeft() {
        return this.config.maxRounds - this.step - 1
    }
    getOfferedRivalProfits(rivalOffer) {
        const res = this.rivalValues.map((rv) => (
                [rivalOffer.reduce((s, o) => (s + o * rv), 0), rv]
            ))
            // res.sort ?
        return res
    }
    getVariantIndex(variant) {
        return this.oVariants[variant.join(',')]
    }
    calcVariants(counts, values) {
        let z = counts.map(r => 0);
        let list = counts.reduce((res, item, ix) => {
            let tmp = [];
            for (let i = 1; i <= item; i++) {
                res.forEach((r) => (
                    tmp.push([r[0].slice(0, ix).concat(i, z.slice(ix + 1)), r[1] + i * values[ix]])
                ));
                tmp.push([z.slice(0, ix).concat(i, z.slice(ix + 1)), i * values[ix]]);
            }
            return res.concat(tmp);
        }, []);
        list.sort((a, b) => (b[1] - a[1] === 0 ? a[0].reduce((s, e) => (s + e), 0) - b[0].reduce((s, e) => (s + e), 0) : b[1] - a[1]));
        return list;
    }
    getPossibleRivalValues(counts, leftSum, ix) {
        const res = [];
        for (let j = 0; j <= leftSum; j++) {
            if ((ix < (counts.length - 1) && (leftSum - counts[ix] * j) >= 0) || (ix == (counts.length - 1) && (leftSum - counts[ix] * j) === 0)) {
                if (ix < counts.length - 1) {
                    const tmp = [j]
                    const vals = this.getPossibleRivalValues(counts, leftSum - counts[ix] * j, ix + 1)
                    if (vals && vals.length > 0) {
                        vals.forEach((v) => {
                            if (v && (v.length === (counts.length - ix - 1))) {
                                res.push(tmp.concat(v))
                            }
                        })
                    }
                } else {
                    res.push([j])
                }
            }
        }
        return res;
    }
}
