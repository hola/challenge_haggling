'use strict';
/*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.me = me;
        this.total = counts.reduce((sum, cnt, index) => sum + cnt * values[index], 0);
        this.max = values.reduce((max, cnt) => Math.max(max, cnt));
        this.min = values.reduce((max, cnt) => Math.min(max, cnt));
        this.lastSum = 0;
        this.index = max_rounds - 1;
        this.firstO = [];
        this.myO = this.defaultO();
    }

    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        let opponentSum = 0;
        if (o) {
            if (this.rounds === 3) {
                this.firstO = o;
            }
            opponentSum = this.getSum(o);
            this.log(`${o} opponent o`);
            this.log(`${opponentSum} opponent sum`);
            if (opponentSum >= this.total * 0.6)
                return;
            if (this.rounds === 0) {
                if (this.me) {
                    if (opponentSum > 3) {
                        return
                    }
                } else {
                    o = this.magicOpponent();
                    this.log(`${o} magic o`);
                }
            } else {
                o = this.generateO(this.index--);
                let sum = this.getSum(o);
                this.log(`${sum} first sum`);
                if (this.lastSum === sum) {
                    o = this.generateO(this.index--)
                }
                sum = this.getSum(o);
                this.log(`${sum} second sum`);
                if (sum < 3) {
                    o = this.magicOpponent();
                }
            }
        } else {
            o = this.defaultO();
        }
        let sum = this.getSum(o);

        this.lastSum = sum;
        this.log(`${o} total o`);
        this.log(`${sum} sum`);
        if (opponentSum > sum) {
            return;
        }
        if (this.rounds === 0 && opponentSum > 2 && !this.me) {
            return
        }
        return o;
    }

    generateO(rounds) {
        this.log(`${rounds} current round`);
        let o = [];
        switch (rounds) {
            case 4:
                o = this.defaultO();
                break;
            case 3:
            case 1:
                o = this.passMin(1);
                break;
            case 0:
            case -1:
            case -2:
                o = this.passMax(1);
                break;
            default:
                o = this.defaultO();

        }
        return o;
    }

    getSum(o) {
        return o.reduce((sum, cnt, index) => sum + cnt * this.values[index], 0);
    }

    defaultO() {
        let o = this.counts.slice();
        for (let i = 0; i < o.length; i++) {
            if (!this.values[i])
                o[i] = 0;
        }
        return o;
    }

    passMin(percent) {
        let diff = 0;
        this.values.forEach((value, index) => {
            if (value === 0) {
                this.myO[index] = 0;
            } else if (value !== this.max && this.myO[index]>0) {
                if (percent > 0) {
                    this.myO[index]--;
                    percent--;
                    diff++;
                }
            }
            if (diff===0){
                this.myO = this.defaultO();
            }
        });
        return this.myO;
    }

    passMax(percent) {
        this.values.forEach((value, index) => {
            if (value === 0) {
                this.myO[index] = 0;
            } else {
                if (percent > 0 && this.myO[index]>0) {
                    this.myO[index]--;
                    percent--;
                }
            }
        });
        return this.myO;
    }

    getMin() {
        let o = this.counts.slice();
        this.values.forEach((value, index) => {
            if (value > 0 && value !== this.max) {
                o[index] = this.counts[index];
            } else {
                o[index] = 0;
            }
        });
        return o;
    }

    magicOpponent() {
        let o = [];
        let sum = 0;
        this.firstO.forEach((value, index) => {
            if (value === 0) {
                o.push(this.counts[index]);
            } else {
                if (sum > 5) {
                    o.push(Math.round(this.counts[index] / 3));
                } else {
                    o.push(Math.round(this.counts[index] / 2));
                }
            }
            sum += this.values[index] * o[index];
        });
        return o;
    }

    find() {
        let o = [];
        this.counts.forEach(() => {
            o.push(0)
        });
        let addCoeff = 1;
        let mySum = 0;
        this.coeff.forEach((value, index) => {
            let valuesRand = value / this.counts[index];
            for (let i = 0; i < this.counts[index]; i++) {
                valuesRand *= addCoeff;
                this.log(`${valuesRand} values rand`);
                let rand = Math.random();
                this.log(`${rand} rand`);
                if (rand < valuesRand) {
                    o[index]++;
                    mySum += this.values[index];
                    addCoeff = 1;
                    this.log(`success`);
                } else {
                    addCoeff *= 1.4;
                }
            }
        });
        if (mySum < this.total * 0.4) {
            return this.find()
        } else {
            return o;
        }
    }
};