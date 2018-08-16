'use strict'; /*jslint node:true*/

function _getPossibleOffers(counts, c) {
    let result = [];
    for (let i = 0; i <= counts[c]; i++) {
        if (c === counts.length - 1) {
            result.push([i]);
        }
        else {
            for (let offer of _getPossibleOffers(counts, c + 1)) {
                result.push([i, ...offer]);
            }
        }
    }
    return result;
}

function getPossibleOffers(counts) {
    return _getPossibleOffers(counts, 0);
}

function _getPossibleValues(counts, sum, c) {
    if (c === counts.length - 1) {
        if (sum % counts[c] > 0)
            return null;
        return [[sum / counts[c]]];
    }
    let result = [];
    for (let i = 0; i <= sum; i++) {
        let rest = sum - i * counts[c];
        if (rest < 0)
            break;
        let pv = _getPossibleValues(counts, rest, c + 1);
        if (pv === null)
            continue;
        for (let values of pv) {
            result.push([i, ...values]);
        }
    }
    return result;
}

function getPossibleValues(counts, sum) {
    return _getPossibleValues(counts, sum, 0)
}

function calcRevenue(counts, values) {
    return counts.map((c, i) => c * values[i]).reduce((a, b) => a + b, 0);
}

// Fisher-Yates (aka Knuth) Shuffle
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        // me = 1;
        // counts = [1, 2, 1];
        // values = [1, 0, 7];

        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];
        this.round = 1;
        // Мой ход первый.
        this.meFirst = me === 0;
        // Мои значения ценностей объектов.
        this.myValues = values;
        // Предполагаемые значения ценностей объектов для бота.
        this.botValues = [];
        // Количество объектов.
        this.objectCount = this.counts.reduce((a, b) => a + b, 0);

        // Все возможные предложения объектов.
        this.possibleOffers = getPossibleOffers(counts);
        // Убираем 0,0,0.
        this.possibleOffers = this.possibleOffers.slice(1);

        // Все возможные значения ценностей.
        this.possibleValues = getPossibleValues(counts, this.total);
        // История предложений.
        this.history = [];
    }
    offer(o) {
        // this.history.push([0, 0, 0]);
        // this.calcBotValues();

        let myRev = o ? this.calcMyRevenue(o) : -1;

        if (o)
            this.history.push(o);

        // Соглашаемся сразу на хорошее предложение.
        if (myRev > 7) {
            return undefined;
        }
        // На последнем раунде соглашаемся на любое предложение большее хорошего или 0.
        if (this.round === this.rounds && (myRev > (this.meFirst ? 7 : 0))) {
            return undefined;
        }
        
        let offer = this.bestOffer();
        let offerRev = offer ? this.calcMyRevenue(offer) : myRev;

        if (this.meFirst && this.round === this.rounds){
            let prevBest = this.bestFromHistory();
            let prevBestRev = this.calcMyRevenue(prevBest);
            if (prevBestRev > offerRev){
                if (prevBest.every((v, i) => v === o[i]))
                    return undefined;
                return prevBest;
            }
        }
        if (offerRev === 0 && myRev === 0)
            return this.counts;
        if (offerRev <= myRev){
            return undefined;
        }

        this.history.push(offer);

        this.possibleOffers = this.possibleOffers.filter(o => o !== offer);
        if (o)
            this.possibleOffers = this.possibleOffers.filter(oo => oo.some((v, i) => v !== o[i]));

        this.round++;

        //this.log("ccccccccccc")

        //this.log('me: ' + offerRev + '; bot: ' + this.calcBotRevenue(offer));
        return offer || undefined;
    }
    bestOffer() {
        this.botValues = this.calcBotValues();

        if (this.round === this.rounds){
            // На последнем раунде не будем оставлять себе объекты нулевой ценности.
            this.possibleOffers = this.possibleOffers.filter(o => !this.myValues.some((v, i) => v === 0 && o[i] > 0));
        }

        //this.log("aaaaaaaaaa")
        this.possibleOffers = shuffle(this.possibleOffers);
        let revs = this.possibleOffers.map(o => ({
            myRev: this.calcMyRevenue(o) || 0,
            botRev: this.calcBotRevenue(o) || 0,
            offer: o
        }))
            .filter(r => r.myRev > 0)
            .sort((a, b) => b.myRev - a.myRev);

        if (revs.length === 0)
            return undefined;
        
        //this.log("bbbbbbbbbb")
        // Не жадничаем на последнем раунде.
        let i = this.round === this.rounds ? 4 : 0;
        let revs1 = [];
        while (revs1.length === 0) {
            revs1 = revs.filter(r => r.botRev > i);
            i--;
        }
        let myMaxRev = revs1[0].myRev;
        revs1 = revs1.filter(r => r.myRev > 0 && r.myRev > myMaxRev - 2).sort((a, b) => b.botRev !== a.botRev ? b.botRev - a.botRev : b.myRev - a.myRev);
        return revs1[0].offer;
    }
    calcMyRevenue(offer) {
        return calcRevenue(offer, this.myValues);
    }
    calcBotRevenue(offer) {
        let botCounts = this.getBotCounts(offer);
        return calcRevenue(botCounts, this.botValues);
    }
    getBotCounts(offer) {
        return this.counts.map((ic, i) => ic - offer[i]);
    }
    calcBotValues() {
        let vals = this.counts.map(_ => this.total / this.objectCount);
        for (let i = 0; i < this.history.length; i++) {
            let h = this.history[i];
            let botCounts = (this.meFirst && i % 2 === 0) || (!this.meFirst && i % 2 === 1)
                ? this.getBotCounts(h)
                : h;
            vals = vals.map((v, i) => v * Math.pow(0.5, botCounts[i]));
            let restVal = this.total - calcRevenue(this.counts, vals);
            vals = vals.map((v, i) => v + (this.counts[i] > 0 ? restVal / this.objectCount : 0));
        }
        let minError = 100;
        let resultVals = vals;
        for (let pv of this.possibleValues){
            let error = vals.map((v, i) => Math.abs(v - pv[i])).reduce((a, b) => a + b, 0);
            if (error < minError){
                minError = error;
                resultVals = pv;
            }
        }
        //this.log(vals.join(';'));
        this.log(resultVals.join(';'));
        return resultVals;
    }
    bestFromHistory(){
        let maxRev = 0;
        let best = [];
        for (let i = 0; i < this.history.length; i++) {
            let h = this.history[i];
            if ((this.meFirst && i % 2 === 0) || (!this.meFirst && i % 2 === 1))
                continue;
            let rev = this.calcMyRevenue(h);
            if (rev > maxRev){
                maxRev = rev;
                best = h;
            }
        }
        return best;
    }
};
