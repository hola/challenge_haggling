'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.last = undefined;
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
        }
        this.bank = new Bank(this.counts, this.values);
        this.bank.Create();
    }

    offer(o) {
        this.log(this.rounds + ' rounds left Yan');
        if (o) {
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            if (sum >= 8)
                return;
            else if (this.values[0] * (this.counts[0] - o[0]) + this.values[1] * (this.counts[1] - o[1]) + this.values[2] * (this.counts[2] - o[2]) >= 6)
                this.last = o;

        }

        if (this.rounds === 1) {
            if (this.last !== undefined)
                o = this.last;
            else
                o = this.bank.Get(1);
        }
        else
            o = this.bank.Get(this.rounds);
        this.rounds--;
        return o;
    }
};

class Bank {
    constructor(counts, values) {
        this.counts = counts;
        this.values = values;
        this.x = [];
        this.y = [];
        this.z = [];
    }

    Create() {
        let c = 0;
        //#region create
        for (let x = 0; x <= this.counts[0]; x++) {
            for (let y = 0; y <= this.counts[1]; y++) {
                for (let z = 0; z <= this.counts[2]; z++) {
                    let temp = [x, y, z];
                    let sum = 0;
                    for (let i = 0; i < temp.length; i++)
                        sum += this.values[i] * temp[i];
                    if (sum >= 7) {
                        this.x[c] = x;
                        this.y[c] = y;
                        this.z[c] = z;
                        c++;
                    }
                }
            }
        }
        //#endregione
        let qt = this.x.length;
        //#region sort
        let check;
        let temp;
        let s = [];
        for (let i = 0; i < qt; i++)
            s[i] = this.x[i] * this.values[0] + this.y[i] * this.values[1] + this.z[i] * this.values[2];
        do {
            check = false;
            for (let i = 0; i < qt - 1; i++) {
                if (s[i] > s[i + 1]) {
                    temp = s[i];
                    s[i] = s[i + 1];
                    s[i + 1] = temp;

                    temp = this.x[i];
                    this.x[i] = this.x[i + 1];
                    this.x[i + 1] = temp;

                    temp = this.y[i];
                    this.y[i] = this.y[i + 1];
                    this.y[i + 1] = temp;

                    temp = this.z[i];
                    this.z[i] = this.z[i + 1];
                    this.z[i + 1] = temp;
                    check = true;
                }
            }
        } while (check);
        //#endregion

        //#region sort_el
        let s_el = [];
        for (let i = 0; i < qt; i++)
            s_el[i] = this.x[i] + this.y[i] + this.z[i];
        do {
            check = false;
            for (let i = 0; i < qt - 1; i++) {
                if (s_el[i] > s_el[i + 1]) {
                    temp = s_el[i];
                    s_el[i] = s_el[i + 1];
                    s_el[i + 1] = temp;

                    temp = this.x[i];
                    this.x[i] = this.x[i + 1];
                    this.x[i + 1] = temp;

                    temp = this.y[i];
                    this.y[i] = this.y[i + 1];
                    this.y[i + 1] = temp;

                    temp = this.z[i];
                    this.z[i] = this.z[i + 1];
                    this.z[i + 1] = temp;
                    check = true;
                }
            }
        } while (check);
        //#endregion
        this.x.reverse();
        this.y.reverse();
        this.z.reverse();
        //#region sep_same
        /*
        let sep_same = [];
        sep_same[0] = s[0];
        for (let i = 0; i < qt; i++) {
            if (sep_same.length - 1 === s[i]) {
                sep_same[sep_same.length] = s[i];
                this.x[sep_same.length] = this.x[i];
                this.y[sep_same.length] = this.y[i];
                this.z[sep_same.length] = this.z[i];
            }
        }
        this.x.splice(sep_same.length);
        this.y.splice(sep_same.length);
        this.z.splice(sep_same.length);
        */
        //#endregion
    }

    Get(round) {
        let o = [];
        switch (round) {
            case 5:
                o = [this.x[0],this.y[0],this.z[0]];
                break;
            case 4:
                o = [this.x[1],this.y[1],this.z[1]];
                break;
            case 3:
                o = [this.x[2],this.y[2],this.z[2]];
                break;
            case 2:
                o = [this.x[3],this.y[3],this.z[3]];
                break;
            case 1:
                o = [this.x[0],this.y[0],this.z[0]];
                break;
        }
        return o;
    }
}