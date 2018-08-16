'use strict';

module.exports = class {
    /*
     * me — 0, если ваша очередь первая, или 1, если вторая.
     * counts — массив целых чисел, содержащий количество объектов каждого типа. Он содержит от 2 до 10 элементов.
     * values — массив целых чисел такой же длины, что и counts, описывающий ценность объекта каждого из типов для вас.
     * max_rounds — число раундов переговоров (каждый раунд состоит из двух реплик).
     * log — функция, которую можно вызывать для отладочного вывода (console.log работать не будет).
     */
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.log = log;
        this.values_partner = [];
        this.values_partner_closest = []
        this.total_price = 0;
        this.currentSet = 1;
        this.lastRequest = null;
        this.vext_patner = [];
        this.dbg('ctor', JSON.stringify(this));
        this.total_counts = 0;

        this.init();
    }

    dbg(p, s) {
        if (typeof (this.log) === 'function') {
            if (p != null && p != undefined && s != null && s != undefined) {
                this.log(`${p + ''}: ${s + ''}`);
            } else {
                if (p != null && p != undefined)
                    this.log(p);
                if (s != null && s != undefined)
                    this.log(s);
            }
        }
    }

    init() {

        // const total sum
        for (let i = 0; i < this.values.length; i++) {
            this.total_price += this.values[i] * this.counts[i];
            this.total_counts += this.counts[i];
        }

        this.setInitialPartner();
        this.vext_patner = this.buildPartnerPossibleList();
    }

    findMaxPartnerPossibleResult(o) {
        var sum = 0;
        for (let i = 0; i < this.vext_patner.length; i++) {
            let s2 = 0;
            for (let j = 0; j < this.values.length; j++) {
                s2 += this.vext_patner[i][j] * (this.counts[j] - o[j]);
            }

            if (s2 > sum)
                sum = s2;
        }

        return sum;
    }

    createArray(len) {
        let res = new Array();
        for (let i = 0; i < len; i++)
            res.push(0);

        return res;
    }

    setInitialPartner() {
        this.values_partner = this.createArray(this.values.length);

        // will think about ideal pricing: partner prices are reversed
        let min = this.total_price;
        let max = 0;
        for (let i = 0; i < this.values.length; i++) {
            let v = this.values[i] * this.counts[i];
            if (v > max) max = v;
            if (v < min) min = v;
        }

        for (let i = 0; i < this.values.length; i++)
            this.values_partner[i] = (max + min - this.values[i] * this.counts[i]) / this.counts[i];

        this.adjustPatner();
        // partsum by rules it should be equal to total_price but it will not. This is estimation so good enough
    }

    adjustPatner() {
        let partsum = 0;
        let minv = 0;

        for (let i = 0; i < this.values.length; i++) {
            if (this.values_partner[i] < minv)
                minv = this.values_partner[i];
        }

        if (minv < 0) {
            // shift all from negative area
            for (let i = 0; i < this.values.length; i++)
                this.values_partner[i] -= minv;
        }

        for (let i = 0; i < this.values.length; i++)
            partsum += this.values_partner[i] * this.counts[i];

        const coeff = this.total_price / partsum;
        for (let i = 0; i < this.values.length; i++)
            this.values_partner[i] = (this.values_partner[i] * this.counts[i] * coeff) / this.counts[i];
    }

    updatePartner(o) {
        const step = this.total_price / (this.max_rounds - 1);
        for (let i = 0; i < this.values.length; i++) {
            this.values_partner[i] = this.values_partner[i] - o[i] * step + (this.counts[i] - o[i]) * step;
        }

        //for (let i = 0; i < this.values.length; i++) {
        //    let step = this.total_price / this.counts[i] / this.max_rounds*3;
        //    this.values_partner[i] = this.values_partner[i] - o[i] * step + (this.counts[i] - o[i]) * step;
        //}

        this.adjustPatner();

        // log partner values
        this.dbg('partner estimation', JSON.stringify(this.values_partner));
    }

    // all products combinations
    buildSequences() {
        const res = new Array();
        const first = this.createArray(this.values.length);

        let next = first;
        res.push(first);
        while ((next = this.buidNextSequence(next)) != null)
            res.push(next);

        return res;
    }

    buidNextSequence(sq) {
        let isFull = 0;
        let res = this.createArray(sq.length);

        for (let i = 0; i < sq.length; i++) {
            isFull += sq[i] == this.counts[i] ? 1 : 0;
            res[i] = sq[i];
        }

        if (isFull == sq.length)
            return null;

        res[0]++;

        for (let i = 0; i < res.length; i++) {
            if (res[i] > this.counts[i]) {
                res[i] = 0;
                if (i < res.length)
                    res[i + 1]++;
            }
        }

        return res;
    }

    // 
    filterSequences(lst) {
        const res = new Array();
        let totalCounts = 0;
        for (let k = 0; k < this.counts.length; k++)
            totalCounts += this.counts[k];

        for (let i = 0; i < lst.length; i++) {
            let sum = 0;
            let cnt = 0;
            for (let j = 0; j < this.values.length; j++) {
                cnt += lst[i][j];
                sum += lst[i][j] * (this.values[j] + this.values_partner_closest[j]);
            }

            if (sum > this.total_price && cnt != totalCounts)
                res.push(lst[i]);
        }

        return res;
    }

    sortSequense(lst) {
        lst.sort((x, y) => {
            let xsum = 0;
            let ysum = 0;
            for (let i = 0; i < x.length; i++) {
                let k = this.values[i];
                xsum += x[i] * k;
                ysum += y[i] * k;
            }

            if (xsum < ysum) return -1;
            if (xsum > ysum) return 1;

            // now make sort by partner estimated values
            xsum = 0;
            ysum = 0;
            for (let i = 0; i < x.length; i++) {
                let k = this.values_partner_closest[i];
                xsum += (this.counts[i] - x[i]) * k;
                ysum += (this.counts[i] - y[i]) * k;
            }

            if (this.currentSet < (this.max_rounds - 1)) {
                if (xsum < ysum) return -1;
                if (xsum > ysum) return 1;
            } else {
                if (xsum < ysum) return 1;
                if (xsum > ysum) return -1;
            }

            return 0;
        });
    }

    selectVariant(lst, lastRequest) {
        let res = this.counts;

        // lst is sorted by amount
        if (lst.length == 0)
            return res; // no solution

        // get min amount
        let min = lst[0];
        let minsum = this.calcVariantAmount(min);
        let max = lst[lst.length - 1];
        let maxsum = this.calcVariantAmount(max);

        let v = 1 - 1 / 2 * (this.currentSet - 1) / (this.max_rounds - 1);
        if (v < 0) v = 0;

        //        let expectedSum = Math.ceil((minsum + maxsum) / 2);
        //        let expectedSum = Math.ceil(minsum / 3 + maxsum * 2 / 3);
        let expectedSum = Math.round(minsum + (maxsum - minsum) * v);
        if (expectedSum > maxsum)
            expectedSum = maxsum;

        let curSum = 0;
        let curIndex = 0;
        for (let i = 0; i < lst.length; i++) {
            curIndex = i;
            res = lst[i];
            curSum = this.calcVariantAmount(res);
            if (curSum > expectedSum)
                break;
        }

        if (lastRequest != null) {
            var lsum = this.calcVariantAmount(lastRequest);
            if (lsum == curSum && curIndex < (lst.length - 1)) {
                curIndex = Math.floor((curIndex + lst.length) / 2);

                res = lst[curIndex];
            }
        }

        return res;
    }

    calcVariantAmount(v) {
        let res = 0;
        for (let i = 0; i < v.length; i++)
            res += v[i] * this.values[i];

        return res;
    }


    calcPartnerVariantAmountClosest(v) {
        let res = 0;
        for (let i = 0; i < v.length; i++)
            res += (this.counts[i] - v[i]) * this.values_partner_closest[i];

        return res;
    }

    buildPartnerPossibleList() {
        const res = new Array();
        const limits = this.createArray(this.values.length);
        const first = this.createArray(this.values.length);

        for (let i = 0; i < this.values.length; i++) {
            limits[i] = Math.floor(this.total_price / (!!this.counts[i] ? this.counts[i] : 1));
        }

        let next = first;

        if (this.checkMaxSum(first))
            res.push(first);
        while ((next = this.buidNextPartnerSequence(limits, next)) != null)
            if (this.checkMaxSum(next))
                res.push(next);

        return res;
    }

    buidNextPartnerSequence(limits, sq) {
        let isFull = 0;
        let res = this.createArray(sq.length);

        for (let i = 0; i < sq.length; i++) {
            isFull += sq[i] == limits[i] ? 1 : 0;
            res[i] = sq[i];
        }

        if (isFull == sq.length)
            return null;

        res[0]++;

        for (let i = 0; i < res.length; i++) {
            if (res[i] > limits[i]) {
                res[i] = 0;
                if (i < res.length)
                    res[i + 1]++;
            }
        }

        return res;
    }

    checkMaxSum(arr) {
        let res = 0;
        for (let i = 0; i < this.values.length; i++) {
            res += this.counts[i] * arr[i];
        }

        return res === this.total_price;
    }

    findPartnerRealSum() {
        let err = -1;
        let res = null;
        for (let i = 0; i < this.vext_patner.length; i++) {
            let cerr = 0;
            for (let j = 0; j < this.counts.length; j++) {
                cerr += (this.vext_patner[i][j] - this.values_partner[j]) * (this.vext_patner[i][j] - this.values_partner[j]);
            }

            if (cerr < err || err < 0) {
                err = cerr;
                res = this.vext_patner[i];
            }
        }

        return res;
    }

    offer(o) {
        let sumProp = 0;
        //        let maxRndToDecide = this.me == 0 ? this.max_rounds + 1 : this.max_rounds;
        let maxRndToDecide = this.max_rounds - 1; // leave two last rounds to solve
        //        let maxRndToDecide = this.max_rounds; // leave one last rounds to solve
        this.dbg('round' + this.currentSet);

        if (!!o) {
            this.dbg('offer', JSON.stringify(o));

            // calc proposal
            sumProp = this.calcVariantAmount(o);
            this.dbg('proposial', sumProp);

            // correct partner weights
            this.updatePartner(o);

            //let proSum = this.calcPartnerVariantAmount(o);
            //this.dbg('partner proposial estimated sum', proSum);
        }

        // get partner exact sum
        this.values_partner_closest = this.findPartnerRealSum();

        //for (let i = 0; i < this.values_partner.length;i++)
        //    this.values_partner[i] = this.values_partner_closest[i];

        this.dbg('partner closest estimaion', JSON.stringify(this.values_partner_closest));

        if (!!o) {
            let proSumC = this.calcPartnerVariantAmountClosest(o);
            this.dbg('partner closest sum', proSumC);
        }

        // build sequences
        let sqlst = this.buildSequences();

        // leave variants only with good estimated rating, i.e. my sum>=partner sum
        let flst = this.filterSequences(sqlst);

        // sort given sequence by earned amount
        this.sortSequense(flst);

        // now choose middle solution
        let res = this.selectVariant(flst, this.lastRequest);
        this.dbg('middle solution', JSON.stringify(res));

        // amount for middle solution
        let expSum = this.calcVariantAmount(res);
        this.dbg('middle solution sum', expSum);

        let pSum = this.calcPartnerVariantAmountClosest(res);
        this.dbg('middle closest partner sum', pSum);
        //if (!!o) {
        //    let psmax = this.findMaxPartnerPossibleResult(o);
        //    this.dbg('max possible partner sum at current proposial', psmax);
        //}

        if (sumProp == this.total_price || (sumProp >= expSum && this.currentSet > 1)) {
            res = undefined; // agree, but not in first round, only if proposial amount is maximum available
            this.dbg('agree proposial:', sumProp);
            return res;
        }


        if (this.currentSet < maxRndToDecide) {
        }
        else if (flst.length > 0) {
            let ps = this.calcPartnerVariantAmountClosest(o); // parter estimation sum
            let pm = this.calcVariantAmount(o); // my sum
            let gm = this.total_price / 2 < pm;
            let gm2 = this.total_price * 3 / 4 < pm;

            if (this.currentSet >= (this.max_rounds - 1)) {
                // min available
                let minAvail = this.calcVariantAmount(flst[0]);
                if (sumProp > minAvail && gm) {
                    res = undefined; // agree at last round if minimal conditions are satisfied
                    this.dbg('agree proposial on last chance', sumProp);
                }

                if (gm2) {
//                if (pm >= ps && gm) {
                    // will assume that this user do not want to deal so if two such clients will deal with but with each other , i will win
                    res = undefined;
                    this.dbg('agree on estimated value');
                }
            }
        }

        this.currentSet++;

        if (res != null)
            this.lastRequest = res;

        this.dbg('my proposial', JSON.stringify(res));
        return res;
    }
}