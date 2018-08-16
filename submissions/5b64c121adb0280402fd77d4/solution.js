'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.totalItems = 0;
        for (let i = 0; i < counts.length; i++)
            this.totalItems += counts[i];

        this.V = [];
        for (let s = 0; s <= 10; ++s)
        {
        	this.V.push({ left: 0, bag: [] });
        }

        let allOffers = this.generateAllOffers();
        for (let i = 0; i < allOffers.length; ++i)
        {
        	let o = allOffers[i];
        	let s = this.offerSum(o);

        	this.V[s].bag.push(o);
        }

		if (this.shared(this.V[10].bag[0], this.counts) == this.totalItems)
		{
			this.V[10].bag = [];
		}

		this.lastOffer = this.counts.slice();
		this.lastOffer = this.counts.slice();
		this.bestCounterOffer = this.counts.slice().fill(0);

		this.startPrice = 10;
		if (this.V[10].bag.length > 0)
		{
			let s = 0;
			for (let i = 0; i < this.counts.length; ++i)
			{
				if (this.values[i] > 0)
				{
					s += this.counts[i];
				}
			}
		}

		this.distributeLeft();

		this.first = true;

    	for (let i = 0; i < this.V.length; ++i)
    		if (this.V[i].bag.length > 0)
	    		this.log(`Possible offer sum: ${i}`);
    }

    distributeLeft()
    {
    	for (let i = 0; i < this.V.length; ++i)
    		this.V[i].left = 2;

    	let count = this.offersCount(4, this.startPrice + 1);

		if (count == 1)
		{
			this.fillLeft(4, this.V.length, 5);
		}
		else if (count <= 2)
		{
			this.fillLeft(4, this.V.length, 3);
		}
		else
		{
			this.fillLeft(4, this.V.length, 2);

			if (this.offersCount(8, this.startPrice + 1) >= 2)
			{
		        this.V[10].left = 1;
    		    this.V[9].left  = 1;
        		this.V[8].left  = 1;				
			}
		}
    }

    fillLeft(s, e, value)
    {
    	for (let i = s; i < e; ++i)
   			this.V[i].left = value;
    }

    offersCount(s, e)
    {
    	let sum = 0;
    	for (let i = s; i < e; ++i)
   			sum += (this.V[i].bag.length > 0 ? 1 : 0);

   		return sum;
    }

    generateAllOffers()
    {
    	let O = this;
    	function engine(next)
    	{
    		if (next == O.counts.length)
    		{
    			return [[]];
    		}

    		let p = engine(next + 1);

    		let r = []
    		for (let i = 0; i < (O.values[next] > 0 ? O.counts[next] : 0) + 1; ++i)
    		{
    			for (let k = 0; k < p.length; ++k)
    			{
    				let v = p[k].slice();
    				v.push(i);

    				r.push(v);
    			}
    		}

    		return r;
    	}

    	let R =  engine(0);

    	for (let i = 0; i < R.length; ++i)
    	{
    		R[i].reverse();
    	}

    	return R;
    }

    offerSum(o)
    {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
            sum += o[i]*this.values[i];
    
        return sum;
    }

    shared(l, r)
    {
    	if (l && r)
    	{
	        let sum = 0;
    	    for (let i = 0; i < l.length; i++)
        	    sum += Math.min(l[i], r[i]);
    
	        return sum;
        }

        return 0;
    }

    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o)
        {
        	this.first = false;

            let sum = this.offerSum(o);

            let L = 8;
            if (this.rounds == 2)
            	L = 7;
            if (this.rounds == 1)
            	L = 6;
            if (this.rounds == 0)
            	L = 4 + (this.first ? 1 : 0);

            if (sum >= L)
            {
                // if (this.rounds >= 1 && Math.random() % 2 == 0)
                this.log(`Counter offer accepted: ${5 - this.rounds} round, ${sum} sum`);
                	return;
            }
	    
	        if (this.offerSum(o) >= this.offerSum(this.bestCounterOffer))
    	    	this.bestCounterOffer = o.slice();
        }

		let bco = this.offerSum(this.bestCounterOffer);
		if (this.rounds == 0 && bco >= 5 && this.first)
		{
			this.log(`Best Counter Offer, 1!`);
			return this.bestCounterOffer.slice();
		}

        let bottom = Math.max(4, this.offerSum(this.bestCounterOffer));
		for (let i = this.startPrice; i >= bottom; --i)
		{
			if (i <= bco)
			{
				this.log(`Best Counter Offer, 2!`);
				return this.bestCounterOffer.slice();
			}
			
			if (this.V[i].bag.length > 0 && this.V[i].left > 0)
			{
				let m = 0;
				for (let k = 1; k < this.V[i].length; ++k)
				{
					if (this.shared(this.V[i].bag[m], o) < this.shared(this.V[i].bag[k], o))
					{
						m = k;
					}
				}

				let r = this.V[i].bag[m];

				--this.V[i].left;

				this.lastOffer = r.slice();
				this.log(`Offer sum: ${this.offerSum(this.lastOffer)}, left: ${this.V[i].left}, bestCounterOffer sum: ${this.offerSum(this.bestCounterOffer)}`);
				return r;
			}
		}

		let lo = this.offerSum(this.lastOffer);
		this.log(`Best Counter Offer sum: ${bco}`);
		this.log(`Last Offer sum: ${lo}`);

		if (bco >= bottom)
		{
			this.log(`Best Counter Offer, 3!`);
			return this.bestCounterOffer.slice();
		}

		this.log(`Last Offer!`);
	    return this.lastOffer.slice();;
    }
};
