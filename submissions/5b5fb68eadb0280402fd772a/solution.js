var epsilon = 1e-5;

function first(i) {
    return i >> 16
}

function second(i) {
    return i >> 8 & 255
}

function third(i) {
    return i & 255
}

function toi(a) {
    return (a[0] << 16) + (a[1] << 8) + a[2]
}

function toa(i) {
    return [i >> 16, i >> 8 & 255, i & 255]
}

function items(i) {
    return first(i) + second(i) + third(i)
}

function slots(i) {
    return +!!first(i) + +!!second(i) + +!!third(i)
}

function allsame(a, c) {
    for (var v of a)
        if (v != c) return 0;
    return 1
}

function ss(a, b) {
    if (first(a) > first(b) || second(a) > second(b) || third(a) > third(b)) return 0;
    if (first(a) < first(b) || second(a) < second(b) || third(a) < third(b)) return 1;
    return 0
}
var possoffers = new Map;
var possvals = new Map;

function gensets() {
    var sets = [];

    function gensetsr(i, sum, set) {
        if (sum > 6) return;
        if (i == 3) {
            sets.push(toi(set));
            return
        }
        for (var n = 1; n <= 4; n++) {
            set[i] = n;
            gensetsr(i + 1, sum + n, set)
        }
    }
    gensetsr(0, 0, new Array(3));
    return sets
}

function genvals(set) {
    var vals = [];

    function genvalsr(i, sum, val) {
        if (sum > 10) return;
        if (i == 3) {
            if (sum == 10) vals.push(toi(val));
            return
        }
        for (var n = 0; n <= 10; n++) {
            val[i] = n;
            genvalsr(i + 1, sum + set[i] * n, val)
        }
    }
    genvalsr(0, 0, new Array(3));
    return vals
}

function genoffers(set) {
    var s = toi(set);
    var offers = [];

    function genoffersr(i, offer) {
        if (i == 3) {
            var o = toi(offer);
            if (o != 0 && o != s) offers.push(o)
        }
        for (var j = 0; j <= set[i]; j++) {
            offer[i] = j;
            genoffersr(i + 1, offer)
        }
    }
    genoffersr(0, new Array(3));
    return offers
}

function byvalue(a, b) {
    return a - b
}
for (var s of gensets()) {
    var arr = toa(s);
    possoffers.set(s, genoffers(arr).sort(byvalue));
    possvals.set(s, genvals(arr).sort(byvalue))
}
module.exports = class Agent {
    constructor(me, counts, values, maxRounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = maxRounds;
        this.log = log;
        this.sent = [];
        this.recv = [];
        this.max = 0;
        this.value = this.value.bind(this);
        var ival = toi(this.values);
        this.possvals = possvals.get(toi(counts)).filter(v => v != ival);
        this.possvalsorig = this.possvals.slice();
        this.byvalueandstuff = this.byvalueandstuff.bind(this);
        this.possoffers = possoffers.get(toi(counts)).filter(this.value).sort(this.byvalueandstuff);
        this.agreeto = this.value(this.possoffers[0]);
        this.bynashprod = this.bynashprod.bind(this)
    }
    byvalueandstuff(a, b) {
        var vd = this.value(b) - this.value(a);
        if (vd) return vd;
        var pvals = this.possvals || this.possvalsorig;
        var suma = 0;
        var sumb = 0;
        for (var v of pvals) {
            suma += this.oppval(a, v);
            sumb += this.oppval(b, v)
        }
        var sumd = suma - sumb;
        if (sumd) return sumd;
        var itemsd = items(b) - items(a);
        if (itemsd) return itemsd;
        return a - b
    }
    bynashprod(a, b) {
        var pvals = this.possvals || this.possvalsorig;
        var suma = 0;
        var sumb = 0;
        for (var v of pvals) {
            suma += this.value(a) * this.oppval(a, v);
            sumb += this.value(b) * this.oppval(b, v)
        }
        var sumd = sumb - suma;
        if (sumd) return sumd;
        var vd = this.value(b) - this.value(a);
        if (vd) return vd;
        return a - b
    }
    value(o) {
        return first(o) * this.values[0] + second(o) * this.values[1] + third(o) * this.values[2]
    }
    oppval(o, v) {
        return (this.counts[0] - first(o)) * first(v) + (this.counts[1] - second(o)) * second(v) + (this.counts[2] - third(o)) * third(v)
    }
    zprob(o) {
        var pvals = this.possvals || this.possvalsorig;
        var nz = 0;
        for (var v of pvals)
            if (this.oppval(o, v) < epsilon) nz++;
        return 100 * nz / pvals.length
    }
    offer(arr) {
        this.rounds--;
        if (!arr) {
            var o = this.possoffers.shift();
            this.sent.push(o);
            return toa(o)
        }
        var o = toi(arr);
        if (this.value(o) >= this.agreeto) return;
        if (this.me && this.rounds == 1) {
            var bo = 0;
            var rcv = this.recv.slice();
            rcv.push(o);
            for (var ro of rcv) {
                var v = this.value(ro);
                var vv = this.value(bo);
                if (v >= this.agreeto - 4 && (v > vv || v == vv && ro == o)) bo = ro
            }
            if (bo) {
                if (bo == o) return;
                return toa(bo)
            }
        }
        if (this.sent.includes(o)) return;
        if (this.possvals && this.recv.length) {
            var tmp = this.possvals.filter(v => {
                var val = this.oppval(o, v);
                if (!val) return false;
                for (var ro of this.recv)
                    if (val > this.oppval(ro, v)) return false;
                return true
            });
            this.possvals = tmp.length ? tmp : null;
            if (this.possvals)
                for (var ro of this.recv)
                    if (ss(o, ro)) this.possvals = null
        }
        if (this.possvals) {
            if (!this.recv.length || allsame(this.recv, 0)) {
                var diff = slots(o);
                if (diff == 1) {
                    var tmp;
                    if (first(o)) {
                        tmp = this.possvals.filter(v => first(v) <= second(v) && first(v) <= third(v));
                        if (this.counts[0] > 1 && first(o) == this.counts[0]) tmp = tmp.filter(v => !first(v))
                    } else if (second(o)) {
                        tmp = this.possvals.filter(v => second(v) <= first(v) && second(v) <= third(v));
                        if (this.counts[1] > 1 && second(o) == this.counts[1]) tmp = tmp.filter(v => !second(v))
                    } else {
                        tmp = this.possvals.filter(v => third(v) <= first(v) && third(v) <= second(v));
                        if (this.counts[2] > 1 && third(o) == this.counts[2]) tmp = tmp.filter(v => !third(v))
                    }
                    this.possvals = tmp.length ? tmp : null
                } else if (diff == 2) {
                    var tmp;
                    if (!first(o)) {
                        if (second(o) == this.counts[1] && third(o) == this.counts[2]) tmp = this.possvals.filter(v => !second(v) && !third(v))
                    } else if (!second(o)) {
                        if (first(o) == this.counts[0] && third(o) == this.counts[2]) tmp = this.possvals.filter(v => !first(v) && !third(v))
                    } else if (!third(o)) {
                        if (first(o) == this.counts[0] && second(o) == this.counts[1]) tmp = this.possvals.filter(v => !first(v) && !second(v))
                    }
                    if (tmp) this.possvals = tmp.length ? tmp : null
                }
            }
        }
        this.recv.push(o);
        if (this.value(o) > this.max) this.max = this.value(o);
        this.possoffers = this.possoffers.filter(po => po != o && this.value(po) >= this.max && this.zprob(po) < 100 - epsilon && !ss(po, o));
        this.possoffers.sort(this.byvalueandstuff);
        if (this.me && !this.rounds) {
            if (this.value(o)) return;
            return [4, 4, 4]
        }
        var offers = this.recv.slice();
        offers.push(...this.sent);
        offers.push(...this.possoffers);
        offers.sort(this.bynashprod);
        var off = offers[0];
        if (!this.rounds && !this.me) {
            this.recv.sort(this.byvalueandstuff);
            if (this.value(this.recv[0]) >= this.value(off)) off = this.recv[0];
        }
        if (off == o) return;
        this.sent.push(off);
        return toa(off)
    }
};
