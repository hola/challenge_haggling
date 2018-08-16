'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log)
    {
        this.me = me; // is 0 if your turn is first, and 1 if your turn is second.
        this.counts = counts; // is an array of integers, describing how many of each type of object there is.
        this.values = values; // is an array of integers the same length as counts, describing how much every object is worth to you.
        this.rounds = max_rounds; // is the limit on the number of rounds in the negotiations; a round is two turns, one by each partner.
        this.log = log;
        this.total = 0; // how much worth all the objects to me.
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.l1 = 0.8 // Some thresholds for accepting and creating offers, which depend on the turn
        this.l2 = 0.7
        this.l3 = 0.4
    }
    offer(o)
    {
    // o is an array of integers the same size as counts, which describes how many of each type of object the partner offers to you.

        
        this.rounds--;
        this.log(`${this.rounds} rounds left`);

        if (o)
        {
            let sum = 0;
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
            
            let lambda = sum/this.total

            if(this.rounds >= 3)
            {
                if (lambda >= this.l1)
                {
                    return;
                }
            }

            else if (this.rounds > 0)
            {
                if (lambda >= this.l2)
                {
                    return;
                }
            }
            else if (this.rounds == 0)
            {
                if (lambda >= this.l3)
                {
                    return;
                }
            }
        }

    //Creating our offer
        let sum = 0;
        let objectes = this.counts;
        let preus = this.values;
        let oferta = [];
        let preu = 0;

        if(this.rounds >= 3)
        {
            while (preu < this.l1 + 0.1)
            {   oferta = []
                sum = 0
                
                for (let j = 0; j<objectes.length; j++)
                {
                    oferta.push(Math.round(objectes[j]*Math.random()))
                    sum += this.values[j]*oferta[j];
                }            
                preu = sum/this.total  
            }
        }

        else if(this.rounds > 0)
        {
            while (preu < this.l2)
            {   oferta = []
                sum = 0
                
                for (let j = 0; j<objectes.length; j++)
                {
                    oferta.push(Math.round(objectes[j]*Math.random()))
                    sum += this.values[j]*oferta[j];
                }            
                preu = sum/this.total  
            }
        }

        else if(this.rounds == 0)
        {
            while (preu < this.l3)
            {   oferta = []
                sum = 0

                for (let j = 0; j<objectes.length; j++)
                {
                    oferta.push(Math.round(objectes[j]*Math.random()))
                    sum += this.values[j]*oferta[j];
                }            
                preu = sum/this.total  
            }
        }
        return oferta;    
    }
};
