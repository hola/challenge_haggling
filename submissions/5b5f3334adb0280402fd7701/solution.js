'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.log(`${this.counts} counts`);
        this.log(`${this.values} values`);
        this.max_rounds = max_rounds
        this.me = me
        this.enemy_values = []
        this.offered_items = [] // enemy trade log
        this.my_offered_items = [] // do not repeat (if possible)
        let me_values = JSON.stringify(values)
        let max_values = counts.map(cnt => Math.floor(this.total / cnt))
        const v_len = values.length
        let v = Array(v_len).fill(0)
        let i = 0
        while (i < v_len) {
            if (v[i] < max_values[i]) {
                v[i]++
                for (let j = 0; j<i; j++)
                    v[j] = 0
            } else {
                i++
                continue
            }
            let sum = 0
            i = v_len - 1
            while (sum <= this.total && i >= 0) {
                sum += v[i] * counts[i]
                i--
            }
            if (sum == this.total && i < 0) {
                if (JSON.stringify(v) != me_values) this.enemy_values.push(v.slice())
                i = 1
            } else if (sum >= this.total) {
                i += 2
            } else i = 0
        }
        this.log(`${JSON.stringify(this.enemy_values)} enemy_values?`);
    }
    cost_items(items, values){
        return items.reduce((sum, cnt, i) => sum += cnt * values[i], 0)
    }
    compromise(current_offer, rounds, my_values, enemy_values, offered_items){
        const acceptable_shortage = this.total / 2 + rounds
        const isFullCalc = offered_items !== null
        if ((this.total - this.cost_items(current_offer, my_values) < (rounds ? 3 : 4 * (1 + this.me)))
            || (!isFullCalc && this.cost_items(current_offer, my_values) >= acceptable_shortage))
            return // acceptable shortage        
        const v_len = this.counts.length
        let probable_values = enemy_values
        let predicted_enemy_values = enemy_values[0]
        if (enemy_values.length > 1) {
            let unnecessary = offered_items.filter(o => o.some(c => c)).reduce((u, items) => [...items.map((itm, i) => {
                if (!i) u[v_len]++
                return ((u[v_len] - 1) * u[i] + itm / this.counts[i]) / u[v_len]
            }), u[v_len]], Array(v_len + 1).fill(0.0))
            this.log(`${JSON.stringify(unnecessary)} unnecessary?`);
            const epsilon = 0.7 / (this.max_rounds - rounds)
            if (unnecessary.slice(0,-1).some(v => v > epsilon))
                probable_values = enemy_values.filter(v => v.every((values, i) => !values === (unnecessary[i] > epsilon)))
            if (!probable_values.length) //artifice
                probable_values = enemy_values
            predicted_enemy_values = probable_values[0]
            let diff_values = my_values.reduce((sum, v, i) => sum += Math.abs(predicted_enemy_values[i] - v), 0)
            for (let j = 1; j < probable_values.length; j++) {
                let diff = my_values.reduce((sum, v, i) => sum += Math.abs(probable_values[j][i] - v), 0)
                if (diff > diff_values) {
                    diff_values = diff
                    predicted_enemy_values = probable_values[j]
                }
            }
            this.log(`${JSON.stringify(predicted_enemy_values)} predicted_enemy_values?`);
        }
        let res = this.counts.slice()
        let good_profit = -this.total
        let res2 = this.counts.slice()
        let my_profit = -this.total

        let itm = Array(v_len).fill(0)
        let i = 0
        while (i < v_len) {
            if (itm[i] < this.counts[i]) {
                itm[i]++
                for (let j = 0; j<i; j++)
                itm[j] = 0
            } else {
                i++
                continue
            }
            let expected_reward = this.cost_items(itm, my_values) 
            if (expected_reward >= acceptable_shortage &&
                (!isFullCalc || !this.my_offered_items.find(v => JSON.stringify(v) == JSON.stringify(itm)))) {
                let z = this.compromise(itm.map((c, i) => this.counts[i] - c), 
                    rounds - 1, predicted_enemy_values, [my_values], null)
                let profit = !z ? expected_reward : this.cost_items(z.map((c, i) => this.counts[i] - c), my_values)
                if (!z || profit > expected_reward) {
                    if (!isFullCalc) return itm
                    if (good_profit < expected_reward) {
                        res = itm.slice()
                        good_profit = expected_reward
                    }
                }
            } else if (expected_reward > my_profit) {
                my_profit = expected_reward
                res2 = itm.slice()
            }
            i = 0
        }
        if (good_profit == -this.total) res = res2
        if (isFullCalc) this.my_offered_items.push(res.slice())
        return res
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (!o) return this.counts.slice() // I'm feeling lucky
        if (!this.offered_items.find(v => JSON.stringify(v) == JSON.stringify(o)))
            this.offered_items.push(o.slice())
        return this.compromise(o, this.rounds, this.values, this.enemy_values, this.offered_items)
    }
};
