'use strict'; /*jslint node:true*/

const START_LIMIT = 0.9;
const END_LIMIT = 0.5;
const LAST_LIMIT = 0.2;

function FTradeGroup()
{
	this.offers=new Array();
	this.score=0;
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) 
{
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) 
	{
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) 
		{
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) 
		{ 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = class Agent 
{
    constructor(me, counts, values, max_rounds, log)
	{
		this.m_log=log;
		this.m_me = me;
		this.m_maxRounds = max_rounds;
		this.m_counts = counts;
		this.m_values = values;
		this.m_curRound = 0;
		this.m_limit = this.calculateLimit(START_LIMIT);
		
		this.m_inOffers=new Array();
		this.m_outOffers=new Array();
    }

    offer(inOffer)
	{
/*        this.m_log(`values: `+String(this.getValues()));
        this.m_log(`counts: `+String(this.getCounts()));
		
		var groups=this.tradeGroup(this.getValues(), this.getCounts());
		for(var i=0;i<groups.length;i++)
		{
			this.m_log(' ');
			this.m_log('score: '+String(groups[i].score));
	
			for(var j=0;j<groups[i].offers.length;j++)
				this.m_log('items: '+String(groups[i].offers[j]));
		}*/
		
		var accept = false;
		var outOffer=new Array();

		if (inOffer!=undefined && inOffer.length > 0)
		{
			if (!this.arrSubtract(this.getCounts(), inOffer).equals(this.getCounts()))
				this.m_inOffers.push(inOffer);
		}

		if (this.isLastRound() && this.getMe() > 0)
		{
			if (this.tradeScore(this.getValues(), inOffer) >= this.calculateLimit(LAST_LIMIT))
				accept = true;
			else
				outOffer = this.getCounts();
		}
		else
		{
			var availableLimit = this.calculateLimit((START_LIMIT - (START_LIMIT - END_LIMIT)*this.getCurRound() / (this.getMaxRounds() - 1 - this.getMe())));

			while (1)
			{
				//if offer is appropriate and no last word then accept it
				if (inOffer!=undefined && inOffer.length>0 && this.tradeScore(this.getValues(), inOffer) >= availableLimit)
				{
					accept = true;
					break;
				}
				else
				{
					//get groups
					var groups = this.tradeGroup(this.getValues(), this.getCounts());
					for (var i = 0; i < groups.length; i++)
					{
						//remove dublicate offers
						for (var j = 0; j < groups[i].offers.length; j++)
						{
							for (var k = 0; k<this.m_outOffers.length; k++)
							{
								if (groups[i].offers[j].equals(this.m_outOffers[k]))
								{
									groups[i].offers.splice(j,1);
									j--;
									break;
								}
							}
						}

						//remove overlimitied and empty groups
						if (groups[i].score < availableLimit || groups[i].offers.length <= 0)
						{
							groups.splice(i,1);
							i--;
						}
					}

					//if there are some variants
					if (groups.length > 0)
					{
						//if already has some in offers
						if (this.m_inOffers.length > 0)
						{
							var minDiff = Number.MAX_SAFE_INTEGER;
							var diffs=new Array(groups.length);

							//compute diff for every available offer
							for (var i = 0; i < groups.length; i++)
							{
								diffs[i]=new Array(groups[i].offers.length);
								for (var j = 0; j < diffs[i].length; j++)
								{
									diffs[i][j] = this.tradeDiffs(groups[i].offers[j], this.m_inOffers);
									minDiff = Math.min(minDiff, diffs[i][j]);
								}
							}

							//choose candidates with minimal diff and maximal score
							var candidates=new Array();
							for (var i = 0; i < groups.length; i++)
							{
								for (var j = 0; j < diffs[i].length; j++)
								{
									if (diffs[i][j]==minDiff)
										candidates.push(groups[i].offers[j]);
								}

								if (candidates.length > 0)
									break;
							}

							//if there are any candidates then make offer
							if (candidates.length > 0)
							{
								outOffer = candidates[randomInt(0, candidates.length-1)];
								this.m_outOffers.push(outOffer);
								break;
							}
						}
						//if no offers then release offer with maximal score
						else
						{
							outOffer = groups[0].offers[0];
							this.m_outOffers.push(outOffer);
							break;
						}
					}

					if (availableLimit - 1 >= this.calculateLimit(END_LIMIT))
					{
						availableLimit--;
					}
					else
					{
						if (this.m_outOffers.length <= 0)
						{
						//	this.m_log('error');
							outOffer = this.getCounts();
						}
						else
						{
							outOffer = this.m_outOffers[this.m_outOffers.length-1];
						}
						break;
					}
				}
			}
		}

		this.m_curRound++;
		if(accept)
			return undefined;
		else
			return outOffer;

    }
	
	isLastRound()
	{
		return this.m_curRound == this.m_maxRounds - 1;
	}
	
	getMe()
	{
		return this.m_me;
	}
	
	getValues()
	{
		return this.m_values;
	}
	
	getCounts()
	{
		return this.m_counts;
	}
	
	calculateTotal()
	{
		return this.tradeScore(this.getValues(), this.getCounts());
	}
	
	calculateLimit(totalPercent)
	{
		var limit = totalPercent*this.calculateTotal();
		var delta = limit%1;

		if (delta < 0.01)
			return limit;
		else
			return Math.ceil(limit);
	}
	
	getMaxRounds()
	{
		return this.m_maxRounds;
	}

	getCurRound()
	{
		return this.m_curRound;
	}
	
	//******************
	//***   ARRAYS   ***
	//******************

	arrSubtract(arr1, arr2)
	{
		var result=new Array(arr1.length);
		for (var i = 0; i < result.length; i++)
			result[i] = arr1[i] - arr2[i];
		return result;
	}
	
	arrMultiply(arr1, arr2)
	{
		var result=new Array(arr1.length);
		for (var i = 0; i < result.length; i++)
			result[i] = arr1[i] * arr2[i];
		return result;
	}

	arrSum(arr)
	{
		var sum = 0;
		for (var i = 0; i < arr.length; i++)
			sum += arr[i];
		return sum;
	}
	
	//***************
	//***   SEQ   ***
	//***************

	seqCollapse(sequence, valuesSize)
	{
		var result=new Array(valuesSize);
		for (var i = 0; i < valuesSize; i++)
			result[i]=0;
		for (var i = 0; i < sequence.length; i++)
			result[sequence[i]]++;
		return result;
	}

	//*****************
	//***   TRADE   ***
	//*****************
	
	tradeScore(values, counts)
	{
		return this.arrSum(this.arrMultiply(values, counts));
	}
	
	tradeDiff(counts1, counts2)
	{
		var diff = 0;
		for (var i = 0; i < counts1.length; i++)
			diff += Math.abs(counts1[i] - counts2[i]);
		return diff;
	}
	
	tradeDiffs(counts, offers)
	{
		var diff = 0;
		for (var i = 0; i < offers.length; i++)
			diff += this.tradeDiff(counts, offers[i]);
		return diff;
	}

	tradeGroup(values, counts)
	{
		var items=new Array();
		for (var i = 0; i < counts.length; i++)
		{
			for (var j = 0; j < counts[i]; j++)
				items.push(i);
		}

		var combinations = 1 << items.length;
		var sequencies=new Array(combinations - 2);
		for (var i = 0; i < combinations - 2; i++) //don't take all and don't give all
		{
			sequencies[i]=new Array();

			var cmb = i + 1;
			for (var j = 0; j < items.length; j++)
			{
				var chk = 1 << j;

				if (cmb & chk)
					sequencies[i].push(items[j]);
			}
		}

		var offers=new Array(sequencies.length);
		for (var i = 0; i < sequencies.length; i++)
			offers[i] = this.seqCollapse(sequencies[i], values.length);
		for (var i = 0; i < offers.length; i++)
		{
			for (var j = 0; j < offers.length; j++)
			{
				if (j != i && offers[j].equals(offers[i]))
				{
					offers.splice(j,1);
					if (j < i)
						i--;
					j--;
				}
			}
		}

		var result=new Array();
		for (var i = 0; i < offers.length; i++)
		{
			var score = this.tradeScore(values, offers[i]);
			
			if (result.length == 0)
			{
				result.push(new FTradeGroup());
				result[0].score = score;
				result[0].offers.push(offers[i]);
			}
			else 
			{
				var found = -1;
				for (var j = 0; j < result.length; j++)
				{
					if (result[j].score == score)
					{
						found = j;
						break;
					}
				}

				if (found >= 0)
				{
					result[found].offers.push(offers[i]);
				}
				else
				{
					if (score > result[0].score)
					{
						result.unshift(new FTradeGroup());
						result[0].score = score;
						result[0].offers.push(offers[i]);
					}
					else if (score < result[result.length-1].score)
					{
						result.push(new FTradeGroup());
						result[result.length-1].score = score;
						result[result.length-1].offers.push(offers[i]);
					}
					else
					{
						for (var j = 0; j < result.length; j++)
						{
							if (score>result[j].score)
							{
								result.splice(j, 0, new FTradeGroup());
								result[j].score = score;
								result[j].offers.push(offers[i]);
								break;
							}
						}
					}
				}
			}
		}

		return result;
	}
};
