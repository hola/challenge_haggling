/*
File name: Georgi_maximize_v3.js
Author: Georgi Olentsenko

Purpose: Haggling competition from Hola
https://github.com/hola/challenge_haggling

Sometime after submission I will push the this script and development process
to repositoty: https://github.com/Georgi57/challenge_haggling

***General comments***
I like contained solutions and test them as much as I can.
As an embedded engineer I am typically limited in resources so I make simple solutions.
In this case I did not spend much time on optimization, just tweaking the parameters.
I also never used nodejs in my work before, so this was a good way to get to know it (at least basic functionality).

***Overview***
The base idea of the solution is to give best value offers (from my side) to the opponent in descreasing order.
This is done using an offer tree. Tree is based on value to me plus opponents perceived valueless items.
Although opponents value prediction plays a very small role.
If opponent does not accept my offers, last rounds are used to look through his offers and select the best of those.
I am not concerned about the value the opponents gets out of the offer, merely statistically increasing my own.

***Process***
I will describe some step I have take, mostly for my own reflection.

1. towards the tree
First thing I did was to organize my offers in decreasing value.
I tried decreasing the offer by the least valued item. This was fine for starters.
The list of item values in ascending order is still in the code, but not used. At least I understood how sorting works.
Quickly realized that this would take many offers off the list. I moved on to the tree solution.
Started testing against myself. The idea was to get the best value offer for both parties.

2. Perfect offer
I added a definition of a perfect offer - all non-zero items combined. My perfect offer is used to start haggling.

3. Opponents offers
I started saving opponents offers with a thought of analysis later.
Next idea I had was to check when the opponent had any good offer at the end of the haggling.
Done. And pretty useful feature.

4. Acceptance levels
At this point I added two variables: acceptance and minimal_acceptance.
The idea was to start with acceptance and going through the offers decrease it until minimal_acceptance is reached.
Me accepting offers also depends on the acceptance level. So when I offer lower value, I accept lower values as well.
Next I added the last change acceptance - the value I could accept as last resort.
In the end there was lots of tweaking these values.

5. First solution
At this point I decided to fix v1 of the solution, which worked on all fronts,
Not the best value over time though, some decided to continue development.

6. Opponents offer analysis
I added opponents value list very early on along with my own value list but have not used it until now.
Simplified opponents offer values. Initially wanted to decrease and increase the value of the items according to offers.
Now I just increased the value if an items was in the offer.
Then I finally added consideration in the tree. A tried to tweak it a lot.
For that I added a selftest.cmd script to check my tweaks.

7. Optimizations
Now I started running my solution on the server, checking against other people continuously.
Fixed v2 solution and created pyhton script to check statistics in a simple way.
From here on it seems I only did tweaking and optimizations.
I ran 24h test, comparing the my scripts with other people statistically.
And decisions on the acceptance level were done based on the statistics.

8. Final testing
Second test resulted in suprizing results of 8 being the best minimal acceptance level.


9. Final final testing
After first submition I did not do anything for a day and then reaslized that I was not testing my solution on the best server.
Most people were cheking it on standard_1s server. So I now I did the final round of testing.
Understood that opponents offer selection acceptance value was too low. So the latest configuration:
Initial acceptance: 10
Minimal acceptance: 8
Last chance acceptance: 7
Last offer (when opponent start haggling): 1 (as long as there is gain at all)

10. Dealine extended
Over the last week I did a lot of testing on the server. And came down to values:
Initial acceptance: 8
Minimal acceptance: 6
Last chance acceptance: 4
Last offer (when opponent start haggling): 1 (as long as there is gain at all)

During the test there were some peak average values with other parameters.
But they were never stable. So I decided keep these.
*/

'use strict'; /*jslint node:true*/

module.exports = class Agent {
	
    constructor(me, counts, values, max_rounds, log){
		this.opponent_started = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
		
		// Acceptance parametets which were tweaked late in development
		this.acceptance_value = this.total/2 + 3;
		this.minimal_acceptance_value = this.total/2 + 1;
		this.last_chance_acceptance_value = this.total/2 - 1;
		
		// Variables for offer tree selection
		this.best_current_offer = []
		this.best_current_sum = 0;
		
		// Sort the items by value, only once
		this.my_values_ascending = [];
		// Fill it with item numbers
		for (let i = 0; i < this.values.length; i++)
			if (this.values[i]!=0)
				this.my_values_ascending.push(i);
		// Sort my values
		this.my_values_ascending.sort(function(a,b)
		{
			return values[a] - values[b];
			
		});
		
		
		// Create opponent value prediction list
		this.opponents_values_prediction = [];
		// Fill it with item numbers
		for (let i = 0; i < this.values.length; i++)
			this.opponents_values_prediction.push(0);

		// Best value offer from my side
		this.perfect_offer = [];
		
		// Offer history
		this.my_offers = [];
		this.opponents_offers = [];

		// More easily readable to me via plane numbers
		this.log(`Counts: ${this.counts}`);
		this.log(`My values: ${this.values}`);
    }
	
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
		
		
        if (o)
        {
			// ----------------------------------------------
			// Count the amount you'll get if opponents offer accepted
            let sum = this.gain(o);
			// ----------------------------------------------
			
			
			
			// ----------------------------------------------
			// Decision whether to accept the offer
            if (sum>=this.acceptance_value)
                return;
			
			// In the last round can be content with the last chance acceptance value
			if (this.rounds == 0 && sum>= 1 && this.opponent_started)
				return;
			//-----------------------------------------------
			
			
			
			// ----------------------------------------------
			// If this is an offer - analyze the opponents offer
			// By logging which items opponent offered.
			for (let i = 0; i<o.length; i++)
			{
				if (o[i] > 0)
					this.opponents_values_prediction[i] += o[i];
			}
			this.log(`Opponents least valued items: ${this.opponents_values_prediction}`);
			// ----------------------------------------------
			
			
			
			// ----------------------------------------------
			// Save the opponents offer for future reference
			this.opponents_offers.push([o,sum])
			// ----------------------------------------------
        }
		
		
		
		// ----------------------------------------------
		// Select an offer to start with
		// If this is the first round - find the perfect offer
		if (this.my_offers.length == 0)
		{
			o = this.counts.slice(); // Select everything at first
			// Get rid of useless items
			for (let i = 0; i<o.length; i++)
			{
				if (this.values[i] == 0)
				{
					o[i] = 0;
				}
			}
			this.perfect_offer = o;
			
			// If the perfect offer is the same as the count, add it to the offerred list to skip it if acceptance level allows.
			let same = 1;
			for (let i = 0; i<this.perfect_offer.length; i++)
			{
				if (this.perfect_offer[i] != this.counts[i])
				{
					same = 0;
					break;
				}
			}
			if (same == 1)
				this.my_offers.push([this.perfect_offer.slice(),this.gain(this.perfect_offer),this.opponent_gain(this.perfect_offer)])
		}
		// Otherwise select the perfect offer
		else
			o = this.perfect_offer;
		// ----------------------------------------------
		
		
		
		// ----------------------------------------------
		// Iterate my offers
		// 10 times was quite enough
		for (let iterations = 0; iterations<10; iterations++)
		{
			// start from zero offers and go up
			this.best_current_sum = 0;
			this.search_offer_tree(o.slice());
			
			// Check the value and whether I offered it already
			if ((this.gain(this.best_current_offer)>=this.acceptance_value)
				&& !(this.offered_before(this.best_current_offer)))
			{
				o = this.best_current_offer;
				break;
			}
			// If tree failed, go back to perfect offer
			// and decrease acceptance level if parameters allow
			else
			{
				o = this.perfect_offer;
				if (this.acceptance_value > this.minimal_acceptance_value + this.rounds - 1)
					this.acceptance_value-=1;
			}
		}
		
		// In case this is the last offer - check opponent offers
		if (this.rounds == 0)
		{
			// Find the best of the opponents offers
			let sum = 0;
			for (let i = 0; i<this.opponents_offers.length; i++)
			{
				this.log(`opponents offers: ${this.opponents_offers[i]}`);
				if (this.opponents_offers[i][1] >= sum && this.opponents_offers[i][1] >= this.last_chance_acceptance_value)
				{
					o = this.opponents_offers[i][0];
					sum = this.opponents_offers[i][1];
				}
			}
		}
		
		// If the offer is the my history, select the last offer - usually the best value for the opponent
		// just in case the opponent still could accept it.
		if (this.offered_before(o))
		{
			o = this.my_offers[this.my_offers.length-1][0];
		}
			
		this.log(`Offer: ${o} ${this.gain(o)} ${this.opponent_gain(o)}`);
		// Log my offers
		this.my_offers.push([o.slice(),this.gain(o),this.opponent_gain(o)])
        return o;
    }
	
	// Calculate gain of the offer
	gain(offer)
	{
		let sum = 0;
		for (let i = 0; i<offer.length; i++)
			sum += this.values[i]*offer[i];
		return sum;
	}
	
	// Find best offer using a tree
	search_offer_tree(offer)
	{
		// Check that this is not a zero count
		if (offer.every(this.isZero))
			return;
		
		
		// Calculate gain
		let sum = this.gain(offer);
		// Calculate opponents value contribution
		let opponent_sum = this.opponent_gain(offer);

	
		// Now check whether this offer is suitable
		if ((sum + opponent_sum > this.best_current_sum) && !(this.offered_before(offer)))
		{
			this.best_current_offer = offer.slice();
			this.best_current_sum = sum + opponent_sum;
		}
		
		// Check offers with even less items as well
		for (let i = 0; i<offer.length; i++)
		{
			if (offer[i]==0)
				continue
			else
			{
				let new_offer = offer.slice()
				new_offer[i]-=1
				this.search_offer_tree(new_offer);
			}
		}
	}
	
	// Check if this offer was made before
	// Goes through my offer history
	offered_before(o)
	{
		for (let i = 0; i<this.my_offers.length; i++)
		{
			let same = true
			for (let j = 0; j<this.my_offers[i][0].length; j++)
			{
				if (this.my_offers[i][0][j] != o[j])
				{
					same = false;
					break;
				}
			}
			if (same)
				return true;
		}
		return false;
	}
	
	isZero(variable) {
		return variable == 0;
	}
	
	// Not opponent gain, name stayed after I discarded that idea.
	// Essentially increases the value items in my offer on the basis
	// of whether the opponent offered this item.
	opponent_gain(offer) {
		let sum = 0;
		for (let i = 0; i<offer.length; i++)
			sum += this.opponents_values_prediction[i]*offer[i]*0.6;
		return sum;
	}
};
