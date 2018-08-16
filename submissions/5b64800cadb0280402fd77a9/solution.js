'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i]*values[i];
        
        this.vcombs = [];
        this.offers = [];
        this.profit = [];
		this.active_vcombs;
        this.his_best_offer = {profit: 0, index: 0};
		this.my_vcomb;
        this.my_offer;
        this.me = me;

        this._init(this);
    }

    _init(agent){
        var vcomb = [];
        var offer = [];
        
        function init_vcombs(vi = 0){
            for (let v = 0; v <= agent.total; v++)
            {
                vcomb[vi] = v;
                if (vi + 1 < agent.values.length)
                    init_vcombs(vi + 1);
                else
                {
                    let sum = 0;
                    for (let i = 0; i < agent.values.length; i++)
                        sum += agent.counts[i]*vcomb[i];
                    if (sum == agent.total)
                    {
                        let t = {};
                        t.values = vcomb.slice();
						t.active = true;
						t.pmax = 0;
                        t.psum = 1;
                        agent.vcombs.push(t);
                    }
                }
            }
        }

        function init_offers(ci = 0){
            for (let c = 0; c <= agent.counts[ci]; c++)
            {
                offer[ci] = c;
                if (ci + 1 < agent.counts.length)
                    init_offers(ci + 1);
                else
				{
					let t = {};
					t.goods = offer.slice();
					t.active = true;
                    agent.offers.push(t);
				}
            }
        }

        init_vcombs();
        init_offers();
		agent.active_vcombs = agent.vcombs.length;
		
        for (let v = 0; v < agent.vcombs.length; v++)
        {
            let i = 0;
            while (i < agent.values.length && agent.vcombs[v].values[i] == agent.values[i])
                i++;
            if (i == agent.values.length)           
            {
				agent.vcombs[v].active = false;
				agent.active_vcombs--;
				agent.my_vcomb = v;
				break;
			}
        }
		
        for (let v = 0; v < agent.vcombs.length; v++)
        {
            let profit = [];
            for (let o = 0; o < agent.offers.length; o++)
            {
                let t = {};
                let p = 0;
                for (let i = 0; i < agent.values.length; i++)
                    p += agent.vcombs[v].values[i]*agent.offers[o].goods[i];
                t.p = p;
                t.v = 0;
                profit.push(t);
            }
            agent.profit.push(profit);
        }

        for (let v = 0; v < agent.vcombs.length; v++)
        {
            let vmax = 0;
            for (let o = 0; o < agent.offers.length - 1; o++)
			{
				if (agent.profit[v][o].p > vmax)
					vmax = agent.profit[v][o].p;
			}
			agent.vcombs[v].pmax = vmax;
		}

		agent._update_stats();
	}
	
	_update_stats(){
		for (let o = 0; o < this.offers.length ; o++)
		{
            for (let v = 0; v < this.vcombs.length; v++)
            {
                this.profit[v][o].v = 0;
                for (let v1 = 0; v1 < this.vcombs.length; v1++)
                    if (v1 !== v  && (this.vcombs[v1].active || v1 == this.my_vcomb))
                        this.profit[v][o].v += this.profit[v][o].p - this.profit[v1][this.offers.length - 1 - o].p;
            }
        }

        let my_offers = [];
		for (let o = 1; o < this.offers.length - 1; o++)
        {
            if (this.offers[o].active && this.profit[this.my_vcomb][o].v >= 0)
               my_offers.push(o);
        }

		my_offers.sort(function(a, b) {
			if (this.profit[this.my_vcomb][a].p < this.profit[this.my_vcomb][b].p) return  1;
			if (this.profit[this.my_vcomb][a].p > this.profit[this.my_vcomb][b].p) return -1;
            if (this.profit[this.my_vcomb][a].v > this.profit[this.my_vcomb][b].v) return  1;
            if (this.profit[this.my_vcomb][a].v < this.profit[this.my_vcomb][b].v) return -1;
		}.bind(this));

        if (my_offers[0])
            this.my_offer = my_offers[0];            
	}

    _exclude_vcombs_po(o){
        let ac = this.active_vcombs;
        for (let v = 0; v < this.vcombs.length; v++)
        {
            this.vcombs[v].psum += this.profit[v][this.offers.length - 1 - o].p / this.vcombs[v].pmax;
            if (this.vcombs[v].active && this.profit[v][this.offers.length - 1 - o].v < 0)
                ac -= 1;
        }
        if (ac > 0)
        {
            for (let v = 0; v < this.vcombs.length; v++)
            {
                if (this.vcombs[v].active && this.profit[v][this.offers.length - 1 - o].v < 0)
                {
                    this.vcombs[v].active = false;
                    this.active_vcombs -= 1;
                }
            }
            this._update_stats();
        }
    }

    _exclude_vcombs_mo(o){
        let ac = this.active_vcombs;
        for (let v = 0; v < this.vcombs.length; v++)
            if (this.vcombs[v].active && this.profit[v][this.offers.length - 1 - o].p == this.vcombs[v].pmax)
                ac -= 1;
        if (ac > 0)
        {
            for (let v = 0; v < this.vcombs.length; v++)
            {
                if (this.vcombs[v].active && this.profit[v][this.offers.length - 1 - o].p == this.vcombs[v].pmax)
                {
                    this.vcombs[v].active = false;
                    this.active_vcombs -= 1;
                }
            }
            this._update_stats();
        }
    }

    _offer_index(offer){
        for (let oi = 0; oi < this.offers.length; oi++)
        {
            let gi = 0;
            for (; gi < this.counts.length && this.offers[oi].goods[gi] == offer[gi]; gi++);
            if (gi == this.counts.length)           
                return oi;
        }     
    }

    _last_offer()
    {
        let vsummaxv = 0;
        let vsummaxi = 0;
        for (let v = 0; v < this.vcombs.length; v++)
            if (this.vcombs[v].active && this.vcombs[v].psum > vsummaxv)
            {
                vsummaxv = this.vcombs[v].psum;
                vsummaxi = v;
            }
        let voffmaxv = -1000;
        let voffmaxi = 0;
        for (let oi = 1; oi < this.offers.length - 1; oi ++)
        {
            if (this.offers[oi].active && this.profit[this.my_vcomb][oi].p > 0 && this.profit[vsummaxi][this.offers.length - 1 - oi].p > 0)
            {
                let m = (this.profit[this.my_vcomb][oi].p + this.profit[vsummaxi][this.offers.length - 1 - oi].p) / 2;
                let s = this.profit[this.my_vcomb][oi].p - this.profit[vsummaxi][this.offers.length - 1 - oi].p;
                s = (s < 0) ? -s : s;
                m -= s;
                if (m > voffmaxv)
                {
                    voffmaxv = m;
                    voffmaxi = oi;
                }
            }
        }
        return voffmaxi;
    }

	offer(o){
		this.log(`${this.rounds} rounds left`);
        this.rounds--;

        if (o)
        {
            let oi = this._offer_index(o);

            this._exclude_vcombs_po(oi);

            let oj = this._last_offer();

            if (this.profit[this.my_vcomb][oi].p >= this.his_best_offer.profit)
            {
                this.his_best_offer.profit = this.profit[this.my_vcomb][oi].p;
                this.his_best_offer.index = oi;
            }

            if (this.rounds == 0 && this.me == 1 && this.profit[this.my_vcomb][oi].p >= this.total/2)
                return;

            if (this.rounds < 2 && this.profit[this.my_vcomb][oi].p >= this.profit[this.my_vcomb][oj].p)
                return;
        }

        if (this.rounds == this.me + 1)
        {
            let oi = this._last_offer();
            if (this.profit[this.my_vcomb][oi].p > this.his_best_offer.profit)
                this.my_offer = oi;
        }

        if (this.rounds < 2 && this.rounds == this.me && this.his_best_offer.profit >= this.total/2)
			return this.offers[this.his_best_offer.index].goods.slice();

        let co = this.my_offer;
        this.offers[co].active = false;
        this._exclude_vcombs_mo(co);
        return this.offers[co].goods.slice();
	}
};

