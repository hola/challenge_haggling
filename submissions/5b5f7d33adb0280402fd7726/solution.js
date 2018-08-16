'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        const num_points = 5
        this.pointsX = [...Array(num_points-1).keys()].map(x=> x/(num_points-1));
        //this.pointsY = this.pointsX.map(x=> 0.3 + x).map(x=> Math.min(Math.max(x, 0), 1));
        this.pointsY = [0.46249999999999997, 0.8, 0.49375, 0.725]
        //log(this.pointsX);

        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.rounds = max_rounds;
        this.log = log;

        this.total = [...counts.keys()].map(i => counts[i]*values[i]).reduce((ac,x) => ac + x);

        this.offersByValue = {}
        let combinations = counts.reduce((ac,x) => ac * (x+1), 1);
        let offer = [...Array(counts.length)].map(x=>0);
        this.offersByValue[0] = [{offer:offer.slice(), counts: 0}]
        for (let i = 0; i < combinations - 1; ++i)
        {
            for (let j = 0; j < counts.length; ++j)
            {
                ++offer[j];
                if(offer[j] > counts[j])
                {
                    offer[j] = 0;
                }
                else
                {
                    break;
                }
            }

            let value = [...offer.keys()].map(i => offer[i]*values[i]).reduce((ac,x) => ac + x);
            if(!this.offersByValue[value])
            {
                this.offersByValue[value] = [];
            }
            this.offersByValue[value].push({offer:offer.slice(), counts:0});
        }
        
        // for(let k in this.offersByValue)
        // {
        //     log(k + ":");
        //     for(let v = 0; v < this.offersByValue[k].length; ++v)
        //     {
        //         log(this.offersByValue[k][v]);
        //     }
        // }
    }

    offer(o){
        this.rounds--;
        let targetValue = this.total * this.evaluate(this.rounds/(this.max_rounds-1))
        this.log(`target value ${targetValue}`);
        if (o)
        {
            let sum = 0;
            for (let i = 0; i<o.length; i++)
            {
                sum += this.values[i]*o[i];
            }
            if (sum>=targetValue)
            {
                return;
            }
        }

        let value = Math.ceil(targetValue);
        while(!this.offersByValue[value])
        {
            ++value;
        }
        
        o = this.offersByValue[value].sort(
            (x,y) => 
            {
                let diff = x.counts - y.counts;
                if(diff != 0)
                {
                    return x.offer.reduce((ac,a) => ac + a) - y.offer.reduce((ac,a) => ac + a);
                }
                return 
            })[0];
        ++o.counts;
        return o.offer;
    }

    evaluate(x)
    {
        //this.log(x);
        if(x>=1)
        {
            return 1;
        }

        for (let i = 0; i<this.pointsX.length; ++i)
        {
            if(i+1 >= this.pointsX.length)
            {
                return this.pointsY[i] + (x - this.pointsX[i]) * (1-this.pointsY[i]) / (1 - this.pointsX[i]);
            }
            else
            {
                if(x >=this.pointsX[i] && x < this.pointsX[i+1])
                {
                    return this.pointsY[i] + (x - this.pointsX[i]) * (this.pointsY[i+1]-this.pointsY[i]) / (this.pointsX[i+1] - this.pointsX[i]);
                }
            }
        }
        return this.pointsY[0];
    }
};
