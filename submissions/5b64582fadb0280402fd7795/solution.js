'use strict'; /*jslint node:true*/

module.exports = class Agent {
	constructor(me, counts, values, max_rounds, log){
		this.counts = counts;
		this.values = values;
		this.rounds = max_rounds;
		this.log = log;
		this.baseValue = 7;

		this.total = 0;
		for (let i = 0; i<counts.length; i++)
			this.total += counts[i]*values[i];

		this.acceptableOfferValue = this.total * this.baseValue / 10;

		const reducer = (accumulator, currentValue) => accumulator + currentValue;
		this.amount = counts.reduce(reducer);

		if (this.amount > 10)
			this.amount = 10;

		this.worthValues = [];
		this.exAnswer = [];
		for (let i in values)
		{
			if (values[i] > 0)
				this.worthValues.push(i);
		}

		this.opponentProductRates = this.counts.map(Number.prototype.valueOf,0);
	}
	offer(o){
		this.rounds--;
		this.setAcceptableOfferValue();

		if (this.isAcceptableOffer(o))
			return;

		let answer = [];
		if (o === undefined)
		{
			for (let i in this.values)
			{
				if (this.values[i] > 0)
					answer.push(this.counts[i]);
				else
					answer.push(0);
			}

			return answer;
		}

		let items = this.getSortedItems(o);
		answer = this.makeAnswer(items);
		if (JSON.stringify(answer) === JSON.stringify(this.exAnswer))
		{
			items = this.getRandomItems();
			let randomAnswer = this.makeAnswer(items);

			if (randomAnswer)
			{
				answer = randomAnswer;
			}
		}

		this.exAnswer = answer;
		return answer;
	}
	isAcceptableOffer(o){
		if (o)
		{
			let sum = this.getSum(o);
			if (parseInt(sum) >= parseInt(this.acceptableOfferValue))
				return true;
		}
		return false;
	}
	getSum(o){
		let sum = 0;
		if (o)
		{
			for (let i = 0; i<o.length; i++)
				sum += this.values[i]*o[i];
		}
		return sum;
	}
	setAcceptableOfferValue(){
		let limits = {
			2: [3,4,5,6,7],
			3: [4,5,6,7,7],
			4: [4,5,6,7,7],
			5: [4,5,6,6,8],
			6: [4,5,6,7,8],
			7: [5,5,6,7,8],
			8: [5,6,7,7,9],
			9: [5,6,7,8,9],
			10: [5,6,7,8,9]
		};

		let limit = limits[this.amount][this.rounds];
		if (parseInt(limit) === 0)
			limit = this.baseValue;

		this.acceptableOfferValue = this.total * limit / 10;
	}
	getSortedItems(offer)
	{
		let items = [];
		for (let key=0; key<offer.length; key++)
		{
			let element = parseInt(this.counts[key] - offer[key]);
			this.opponentProductRates[key] += (element / this.counts[key]);
		}

		for (let key=0; key<this.counts.length; key++)
		{
			for (let i=0; i<this.counts[key]; i++)
			{
				items.push({
					code: key,
					opponentProductRates: this.opponentProductRates[key],
					value: this.values[key]
				});
			}
		}

		if (items.length > 0)
		{
			items.sort(this.reverceSortByOpponent);
		}

		return items;
	}
	reverceSortByOpponent(a, b){
		if (a.opponentProductRates > b.opponentProductRates)
			return -1;

		if (b.opponentProductRates > a.opponentProductRates)
			return 1;

		return Math.random() - 0.5;;
	}
	getRandomItems()
	{
		let items = [];
		for (let i=0; i<this.worthValues.length; i++)
		{
			var code = this.worthValues[i];
			for (let j=0; j<this.counts[code]; j++)
			{
				items.push({
					code: code,
					value: this.values[code]
				});
			}
		}

		items.sort(function() {return 0.5 - Math.random()});
		return items;
	}
	makeAnswer(items){
		let answer = this.counts.map(Number.prototype.valueOf,0);
		var sum = 0,
			item = null;
		for (let i in items)
		{
			item = items[i];
			sum += item.value;
			answer[item.code]++;
			if (sum >= this.acceptableOfferValue)
			{
				return answer;
			}
		}
		return answer;
	}
};