'use strict';

function mul(a, b){
    let res = 0;
    for (let i = 0; i < a.length; i++) {
        res += a[i] * b[i];
    }
    // a.forEach((v, i) => {res += v * b[i]});
    return res;
}

function inverse(base, what){
    return base.map((v, i) => v - what[i]);
}

function sum(arr){
    return arr.reduce((a, b) => a + b);
}

function min(a, b){
    return a < b ? a : b;
}

function max(a, b){
    return a > b ? a : b;
}

function arrays_eq(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

module.exports = class Agent {
    constructor (me, counts, values, max_rounds, log, opponent_values) {
		this.me = me;
		this.counts = counts;
		this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.opponent_values = opponent_values; // используется при отладке
        this.total = mul(counts, values);
        this.total_things = sum(counts);
        this.orders = [];
        this.create_orders();
        this.min_profit_i_agree = this.total;
        this.values_logic = new Values(me, counts, values, max_rounds, log, opponent_values);
        this.fairness = 0.1;
        this.fair_profit = 10;
        this.opponent_fair_profit = 9;
    }
    
    create_orders(){ // все возможные предложения оппоненту будут сформированы здесь.
        let gen = this.counts_combinations();
        let obj;
        while ((obj = gen.next()) && obj.value) {
            let c = obj.value; // counts
            let p = mul(this.values, c); // profit
            
            if (p === 0) continue; // я не получаю ничего
            //if (sum(c) === this.total_things) continue; // он не получает ничего
            
            let oc = inverse(this.counts, c); // opponent counts
            
            if (this.opponent_values) {
                let op = mul(this.opponent_values, oc);
                let order = {p, c, oc, op}; // profit, counts, opponent counts, opponent profit
                this.orders.push(order);
            }
            else {
                let order = {p, c, oc}; // profit, counts, opponent counts
                this.orders.push(order);
            }
        }
    }
    
    *counts_combinations(){ // генератор переберает все возможные комбинации counts
        let counts = this.counts;
        let res = counts.slice().fill(0); // массив счётчиков
        while (1) {
            yield res.slice();
            let i = 0;
            while (1) {
                if (++res[i] > counts[i]) {
                    res[i] = 0;
                    if (++i >= counts.length) {
                        return;
                    }
                    continue;
                }
                break;
            }
        }
    }
    
    offer (o) {
        this.values_logic.offer(o);
        this.rounds--;
        let counts = this.counts;
        let values = this.values;
        let new_order = this.get_fit_order();
        this.min_profit_i_agree = min(this.min_profit_i_agree, new_order.p);
        
        if (o) {
            let profit = mul(o, values);
            //this.log(`got o: ${o.join(',')} values: ${values.join(',')} counts:${counts.join(',')} profit:${profit} this.rounds: ${this.rounds}`);
            
            if (profit >= this.min_profit_i_agree) {
                return;
            }
                        
            if (profit && this.rounds === 0) {
                return;
            }
        }

        this.fairness = min(this.fairness + 0.2, 1);
        this.fair_profit = max(this.fair_profit - 0.2, 9);
        
        this.last_order = new_order;
        //this.log(`send: ${JSON.stringify(new_order)}`);
        this.values_logic.outcoming_offer(new_order.c);
        return new_order.c.slice();
    }
    
    get_fit_order() {
        let min_error = 1e6;
        let best_order = this.orders[0];
        let op_values = this.values_logic.get();
        let fairness = this.fairness;
        this.orders.forEach(order => {
            let opponent_profit = mul(op_values, order.oc);
            let opponent_error = (opponent_profit - this.opponent_fair_profit) * fairness;
            let error = order.p - this.fair_profit;
            error = error * error + opponent_error * opponent_error;
            if (error < min_error) {
                min_error = error;
                best_order = order;
            }
        });
        return best_order;
    }
};

// расчёт values оппонента вынесен в отдельный класс, т.к. используется в других наработках
class Values { 
    constructor(me, counts, values, max_rounds, log, opponent_values) {
        this.me = me;
        this.counts = counts;
        this.total = mul(counts, values);
        this.log = log;
        this.opponent_values = opponent_values;
        this.possible_values = [];
        this.offers_count = 0;
        this.values = counts.slice().fill(0);
        this.inverted_outcoming_offer = undefined;
        this.init_opponent_values();
        
        //let stop_i = this.total;
        //for (let i = 0; i <= stop_i; i++) {
        //    let stop_j = stop_i - i;
        //    for (let j = 0; j <= stop_j; j++) {
        //        let stop_k = stop_j - j;
        //        for (let k = 0; k <= stop_k; k++) {
        //        
        //            if (i * this.counts[0] + j * this.counts[1] + k * this.counts[2] != this.total) {
        //              continue;
        //            }
        //            
        //            if (i == values[0] && j == values[1] && k == values[2]) {
        //              continue;
        //            }
        //            
        //            this.possible_values.push({values: [i, j, k], weight: 1});
        //        }
        //    }
        //}
        this.recalculate();
    }    
    
    init_opponent_values() {
        let counts = this.counts;
        let total = this.total;
        let res = counts.slice().fill(0); // массив счётчиков
        res[0] = 1;
        let all = counts[0] * res[0]; // сумма
        while (1) {
            if (all === total && !arrays_eq(this.values, res)) {
                this.possible_values.push({values: res.slice(), weight: 1});
            }
            let i = 0;
            while (1) {
                all += counts[i];
                if (++res[i] > total || all > total) {
                    all -= counts[i] * res[i];
                    res[i] = 0;
                    if (++i >= counts.length) {
                        return;
                    }
                    continue;
                }
                break;
            }
        }
    }
    
    outcoming_offer (o) {
        this.inverted_outcoming_offer = inverse(this.counts, o);
    }
    
    offer(o) {
        if (!o) return;
        
        this.offers_count++;
        let counts = this.counts;
        
        let opo = inverse(counts, o); // offer глазами оппонента
                
        //this.log(`box: got offer: ${o.join(',')} opponent side: ${opo.join(',')} counts: ${this.counts.join(',')}`)
        
        for (let j = this.possible_values.length - 1; j >= 0; j--) {
            let v = this.possible_values[j];
            let profit = mul(v.values, opo); // предполагаемая прибыль оппонента. если она мальнькая - это маловероятно
            //let k = [0.0001, 0.1, 0.1, 0.2, 0.5, 0.6, 0.7, 1, 1, 1, 1][profit] || 1;
            let k = [0.0001, 0.01, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 1, 1, 1][profit] || 1;
            v.weight *= k;
            
            for (let i = 0; i < opo.length; i++) {
            
                if (v.values[i] === 0 && opo[i] !== 0) { // ценность === 0, а он её просит - маловероятно это.
                    v.weight *= 0.01;
                }
                
                if (this.me === 1 && this.offers_count === 1) {
                
                    // если это первое предложение и
                    // оппонент не просит вещи какого-то типа, при том, что их много, значит - тип для него не имеет ценности
                    if (opo[i] === 0 && v.values[i] !== 0 && counts[i] > 1) { 
                        v.weight *= 0.1;
                    }
                    
                    //if (opo[i] === 0 && v.values[i] !== 0 && counts[i] > 2) { 
                    //    v.weight *= 0.01;
                    //}
                }
                
                if (this.inverted_outcoming_offer) {
                
                    // ему сделали предложение, оно его не устроило, стало быть то что ему 
                    // предложили - дешевле того, что он сейчас прислал
                    let previons_opponent_profit = mul(this.inverted_outcoming_offer, v.values);
                    let current_opponent_profit = mul(opo, v.values);
                    if (!(previons_opponent_profit < current_opponent_profit)) {
                        v.weight *= 0.01;
                    }
                }
        
            }
            
            if (v.weight < 0.0101) {
                this.possible_values.splice(j, 1);
            }
        }
        this.recalculate();
    }
    
    get() {
        return this.values;
    }
    
    print () {
        //for (let v of this.possible_values) {
        //    this.log(`[*] ${JSON.stringify(v)}`);
        //}
        //let counts = this.counts;
        //this.log(`[*] counts:${this.counts.join(',')} values:${this.values.join(',')} real_values:${this.opponent_values ? this.opponent_values.join(',') : '-'}`);
    }
    
    recalculate() {
        let cnt = 0;
        this.values.fill(0);
        
        for (let v of this.possible_values) {
            let w = v.weight;
            
            for (let i = 0; i < this.values.length; i++) {
                this.values[i] += v.values[i] * w;
            }
            
            cnt += w;
        }
        
        cnt = cnt || 1;
        
        this.values.forEach((v, i, a) => {a[i] /= cnt});
    }
};
