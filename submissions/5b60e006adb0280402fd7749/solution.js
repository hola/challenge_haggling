'use strict'; /*jslint node:true*/

function giveSomethingAway(counts, total, values, o, co, currentGiveAwayIndex, skipIndex) {
    var giveAwayIndex = counts.length;
    for (let i = 0; i < co.length; i++) {
        if (values[i] && ((o && o[i] < counts[i]) || (!o && counts[i] > 0)) && co[i] > 0 && values[i] < total * 0.6 && i != skipIndex) {
            if (giveAwayIndex == counts.length || values[giveAwayIndex] > values[i]) {
                giveAwayIndex = i;
            } else if (values[giveAwayIndex] == values[i]) {
                if ((!o && counts[i] < counts[giveAwayIndex]) || (o && o[i] < o[giveAwayIndex])) {
                    giveAwayIndex = i;
                }
            }
        }
    }
    if (giveAwayIndex < counts.length) {
        --co[giveAwayIndex];
        return giveAwayIndex;
    }
    return currentGiveAwayIndex;
}
function sum(int_co, values) {
    var total_int_co = 0;
    for (let i = 0; i < int_co.length; i++)
        total_int_co += values[i] * int_co[i];

    return total_int_co;
}

function giveAwayOne(values, co, giveAwayIndexObj) {
    for (let i = 0; i < values.length; i++) {
        if(values[i] == 1 && co[i] > 0 && (co[i] < values[i] || !giveAwayIndexObj.partner[i])) {
            --co[i];
            return;
        }
    }
}

function updateGiveAwayIndex(giveAwayIndexObj, giveAwayIndexNew) {
    if(giveAwayIndexNew < giveAwayIndexObj["mine"].length)
        giveAwayIndexObj["mine"][giveAwayIndexNew] = true;
    giveAwayIndexObj["giveAwayIndex"] = giveAwayIndexNew;
}

function CoWantsEverything(counts, o, co) {
    if (!co.includes(0))
        return true;

    for (let i = 0; i < o.length; i++)
        o[i] = counts[i] - o[i];

    var idxOffer = o.reduce(function(a, e, i) {
        if (e === 0)
            a.push(i);
        return a;
    }, [])

    var idxCntoffer = co.reduce(function(a, e, i) {
        if (e === 0)
            a.push(i);
        return a;
    }, []);

    for (let i = 0; i < idxCntoffer.length; i++) {
        if (!idxOffer.includes(idxCntoffer[i]))
            return false;
    }

    return true;
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.totalCounts = counts.reduce((a, b) => a + b, 0);
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.madeOffers = {
            "mine": [],
            "partner": []
        }
        this.nrObj = 0;
        this.validOffer = [];
        this.giveAway = false;
        this.forceHimToGiveAway = false;
        this.acceptSixty = false;
        this.minOnGiveAway = 0.5;
        this.giveAwayIndexObj = {
            "mine": new Array(counts.length).fill(false),
            "partner": new Array(counts.length).fill(false),
            "giveAwayIndex": null
        };
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];
        this.lastMadeOffer = counts.slice(0);
    }
    offer(o) {
        --this.rounds;
        var total_o = 0;
        var fi = this.values.indexOf(0);
        var li = this.values.lastIndexOf(0);
        var co = this.counts.slice(0);

        if (o) {
            for (let i = 0; i < o.length; i++)
                total_o += this.values[i] * o[i];

            if (this.total == total_o)
                return;

            for (let i = 0; i < co.length; i++) {
                if (!this.values[i]){
                    co[i] = 0;
                    this.giveAwayIndexObj["mine"][i] = true;
                }
            }
            
            for (let i = 0; i < o.length; i++) {
                if (o[i] > 0)
                    this.giveAwayIndexObj["partner"][i] = true;
            }
            
            if(fi != li && this.rounds + 1 == this.max_rounds) {
                if(this.counts[fi] < this.counts[fi])
                    ++co[fi];
                else
                    ++co[li];
                this.lastMadeOffer = co.slice(0);
                this.madeOffers.mine.push(co.toString());
                this.madeOffers.partner.push(o.toString());

                return co;
            }
            
            
            if (((this.rounds + 1 == this.max_rounds && this.me) || (this.rounds + 2 == this.max_rounds && !this.me)) && total_o >= this.total * 0.8)
                this.forceHimToGiveAway = true;

            if (this.forceHimToGiveAway && this.rounds != 0 && co.includes(0)) {
                this.lastMadeOffer = co.slice(0);
                this.madeOffers.mine.push(co.toString());
                this.madeOffers.partner.push(o.toString());
                return co;
            }
            
            if(this.me && this.rounds == 0 && total_o > 0)
                return;
                    
            if (((this.me && this.rounds == 1) || (!this.me && this.rounds == 0)) 
                && this.madeOffers.partner.length >= 2
                && total_o < this.total * this.minOnGiveAway) {
                    this.madeOffers.partner.push(o.toString());
                    if (Array.from(new Set(this.madeOffers.partner.slice(-3))).length == 1 && Array.from(new Set(this.madeOffers.mine.slice(-3))).length == 1) {
                        var ret_co = this.counts.slice(0);
                        for (let m = 0; m < ret_co.length; m++) {
                            if (!this.values[m]){
                                ret_co[m] = 0;
                                this.giveAwayIndexObj["mine"][m] = true;
                            }
                        }
                        var tot = this.total;
                        for (let h = 0; h < this.giveAwayIndexObj.partner.length; h++) {
                            if (this.giveAwayIndexObj.partner[h] == false && this.giveAwayIndexObj.mine[h] == false) {
                                if (tot - this.values[h] >= this.total * this.minOnGiveAway) {
                                    --ret_co[h];
                                    tot = tot - this.values[h];
                                }
                            }
                        }
                        if (tot != this.total){
                            return ret_co;
                        }
                    }
                    this.madeOffers.partner.pop();
            }

            if (o.reduce((a, b) => a + b, 0) < this.nrObj && this.madeOffers.partner.length == 2 && this.madeOffers.partner.includes(o.toString())) {
                this.nrObj = o.reduce((a, b) => a + b, 0);
                this.madeOffers.partner.push(o.toString());
                if (total_o >= this.total * 0.6) {
                    if(sum(this.validOffer, this.values) < sum(o, this.values))
                        this.validOffer = o.slice(0);
                    this.acceptSixty = true;
                }
                this.madeOffers.mine.push(this.lastMadeOffer.toString());
                return this.lastMadeOffer;
            }

            this.nrObj = o.reduce((a, b) => a + b, 0);

            if (!this.giveAway && this.madeOffers.partner.length >= 2 && this.madeOffers.partner.includes(o.toString())) {
                if (((this.rounds == 2 && this.me) || (!this.me && this.rounds == 1)) && (this.totalCounts - this.nrObj) <= 3 && total_o > 0) {
                    if (total_o >= this.total * 0.6 && sum(this.validOffer, this.values) < sum(o, this.values))
                        this.validOffer = o.slice(0);
                } else {
                    if (this.validOffer.length && this.madeOffers.partner[this.madeOffers.partner.length - 1] == o.toString())
                        this.acceptSixty = true;
                    this.giveAway = true;
                }
            }

            this.madeOffers.partner.push(o.toString());
        }

        co = this.counts.slice(0);
        for (let i = 0; i < co.length; i++) {
            if (!this.values[i]){
                co[i] = 0;
                this.giveAwayIndexObj["mine"][i] = true;
            }
        }

        var giveAwayIndex = this.counts.length;
        if (!o) {
            if (!co.includes(0))
                giveAwayIndex = giveSomethingAway(this.counts, this.total, this.values, null, co, giveAwayIndex);
        } else if (CoWantsEverything(this.counts, o.slice(0), co.slice(0))) {
            giveAwayIndex = giveSomethingAway(this.counts, this.total, this.values, o, co, giveAwayIndex);
        }

        var total_co = sum(co, this.values);

        if (total_o >= total_co)
            return;

        if (total_o >= this.total * 0.7 && this.rounds + 1 != this.max_rounds && Array.from(new Set(this.madeOffers.partner)).length > 1) {
            var g = co.slice(0);
            giveSomethingAway(this.counts, this.total, this.values, o, g, giveAwayIndex);
            var t = sum(g, this.values);
            if (t <= total_o && t >= this.total * 0.6)
                return;
        }
        var total_int_co = 0;
    
        if (o && ((this.rounds <= 2 && this.me) || (!this.me && this.rounds <= 1)) && this.giveAway) {
            if (total_o >= this.total * this.minOnGiveAway && this.rounds == 0 && this.me)
                return;
            if (total_o >= sum(this.lastMadeOffer, this.values))
                return;
            if (sum(o, this.values) > sum(this.validOffer, this.values) && !this.acceptSixty) {
                if (total_o >= this.total * this.minOnGiveAway)
                    this.validOffer = o.slice(0);
                this.acceptSixty = true;
            } else {
                if (this.acceptSixty && this.validOffer.length) {
                    if (sum(o, this.values) >= sum(this.validOffer, this.values))
                        return;
                    this.madeOffers.mine.push(this.validOffer.toString());
                    if (!this.me)
                        return this.validOffer.slice(0);
                }
            }
            if (!(this.me && this.rounds == 1 && Array.from(new Set(this.madeOffers.partner)).length > 1 && (this.totalCounts - this.nrObj) <= 3)) {
                var int_co = this.lastMadeOffer.slice(0);
                var giveAwayIndexH = this.giveAwayIndexObj.giveAwayIndex;
                giveAwayIndexH = giveSomethingAway(this.counts, this.total, this.values, o, int_co, giveAwayIndexH);
                total_int_co = sum(int_co, this.values);

                if (total_int_co >= this.total * this.minOnGiveAway) {
                    if (total_o >= total_int_co)
                        return;
                    if (this.giveAwayIndexObj["mine"].toString() === this.giveAwayIndexObj["partner"].toString()) {
                        var i_co = this.lastMadeOffer.slice(0);
                        var giveAwayIndexNew = giveSomethingAway(this.counts, this.total, this.values, o, i_co, giveAwayIndexH, giveAwayIndexH);
                        var total_i_co = sum(i_co, this.values);
                        if (total_i_co >= this.total * this.minOnGiveAway) {
                            if (total_o >= total_i_co)
                                return;
                            updateGiveAwayIndex(this.giveAwayIndexObj, giveAwayIndexNew);
                            updateGiveAwayIndex(this.giveAwayIndexObj, giveAwayIndexH);
                            this.lastMadeOffer = i_co.slice(0);
                            this.madeOffers.mine.push(i_co.toString());
                            return i_co;
                        }

                    }
                    if(total_int_co >= this.total * this.minOnGiveAway + 1)
                        giveAwayOne(this.values, int_co, this.giveAwayIndexObj);
                    updateGiveAwayIndex(this.giveAwayIndexObj, giveAwayIndexH);
                    this.lastMadeOffer = int_co.slice(0);
                    this.madeOffers.mine.push(int_co.toString());
                    return int_co;
                }
                this.madeOffers.mine.push(this.lastMadeOffer.toString());
                return this.lastMadeOffer;
            }
        }
        if(this.rounds == 0 && !this.me && o && total_o >= this.total * 0.4 && Array.from(new Set(this.madeOffers.partner)).length > 3) {
            return;
        }
        if (this.rounds == 0 && !this.me && o && (!(fi != -1 && (!this.giveAwayIndexObj.partner[fi] || !this.giveAwayIndexObj.partner[li])))) {
            if (total_o >= this.total * 0.6)
                return;
            var co_int = co.slice(0);
            giveSomethingAway(this.counts, this.total, this.values, o, co);

            total_int_co = sum(co, this.values);

            if (total_int_co >= this.total * 0.6) {
                if(total_int_co >= this.total * 0.6 + 1)
                    giveAwayOne(this.values, co, this.giveAwayIndexObj);
                return co;
            }
            return co_int;
        }
        
        updateGiveAwayIndex(this.giveAwayIndexObj, giveAwayIndex);
        this.lastMadeOffer = co.slice(0);
        this.madeOffers.mine.push(co.toString());
        return co;
    }
};

