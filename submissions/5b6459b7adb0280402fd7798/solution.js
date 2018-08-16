const CHATTY = false;

const permutations = function(copy) {
    const result = [];
    while (copy[0] >= 0) {
        result.push(copy.slice());
        copy[0]--;
    }
    copy[0] = this.counts[0];

    for (let i = 1; i < copy.length; i++) {
        if (copy[i] > 0) {
            copy[i]--;
            return result.concat(permutations.call(this, copy));
        } else {
            copy[i] = this.counts[i];
        }
    }
    return result;
};

const appraise = function() {
    const group = [];
    for (let offer of this.permutations) {
        let value = this.getValue(offer);
        let key = offer.join('');
        if (!group[value]) {
            group[value] = [];
        }
        this.appraisals[key] = value;
        group[value].push(offer);
    }
    for (let offers of group) {
        offers && this.grouped.push(offers);
    }
};

class Session {
    constructor(counts, values, rounds) {
        this.counts = counts;
        this.values = values;
        this.rounds = rounds;
        this.total = this.getValue(counts);
        this.permutations = permutations.call(this, counts.slice());
        this.appraisals = {};
        this.grouped = [];

        appraise.call(this);
    }
    tick() {
        this.rounds--;
    }
    isLastRound() {
        return this.rounds === 0;
    }
    getValue(o) {
        return o.map((num, index) => num * this.values[index]).reduce((prev, next) => prev + next, 0);
    }
};

class Haggler {
    constructor(session, log, isFirst) {
        this.session = session;
        this.log = log;
        this.isFirst = isFirst === 0;
        this.previous = [];
    }
    trackOffer(offer) {
        for (let i in offer) {
            if (!this.previous[i]) {
                this.previous[i] = 0;
            }
            this.previous[i] += offer[i];
        }
    }
    isGoodOffer(offer) {
        if (offer === undefined) {
            return false;
        }
        const session = this.session;
        const value = session.appraisals[offer.join('')];
        const total = session.total;
        const rounds = session.rounds || 1;
        const viable = Math.max(total / rounds * (rounds - 1), Math.floor(total / 2));
        return value >= viable;
    }
    trackRound() {
        this.session.tick();
    }
    makeOffer() {
        let theirFavorite = 0;
        let count = 10;
        for (let column in this.previous) {
            if (this.previous[column] < count) {
                theirFavorite = column;
                count = this.previous[column];
            }
        }
        while (true) {
            let list = this.session.grouped.pop();
            if (list.length) {
                let bookmark = 0;
                let times = 0;
                for (let myindex in list) {
                    let o = list[myindex];
                    if (o[theirFavorite] > times) {
                        bookmark = myindex;
                        times = o[theirFavorite];
                    }
                }
                let offer = list.splice(bookmark, 1);

                this.session.grouped.push(list);
                return offer.pop();
            }
        }
    }
}

module.exports = class System {
    constructor(isFirst, counts, values, rounds, log) {
        log(`permutation-inspector`)
        this.log = log;
        this.haggler = new Haggler(new Session(counts, values, rounds), log, isFirst);
    }
    offer(offer) {
        this.haggler.trackRound();
        this.haggler.trackOffer(offer);
        if (this.haggler.isGoodOffer(offer)) {
            CHATTY && this.log(`You drive a hard bargain...`);
            return;
        }
        return this.haggler.makeOffer();
    }
}