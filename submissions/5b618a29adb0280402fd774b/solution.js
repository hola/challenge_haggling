'use strict'; /*jslint node:true*/

module.exports = class Trump {
	constructor(me, counts, values, max_rounds, log) {
		this.Items = counts;	// Count for each item type
		this.Prices = values;	// Value for each item type
		this.Rounds = max_rounds;
		this.TypesCount = this.Items.length;
		this.OpponentValues = [];	// Collection of the all possible opponent prices for items
		this.Models = [];	// Collection of the opponent full value for each round with each possible opponent prices for items
		this.Price = 0;		// Price of all items

		for (let i = 0; i < this.TypesCount; i++) {
			this.Price += this.Items[i] * this.Prices[i];
		}
		if (!me) {
			this.Rounds--;
		}
		this.CalculateOpponentValues([]);
	}

	// Will store the opponent propositions full value for the each possible opponent prices for items.
	// And make unacceptable offer before last ocasion. After, pick most relevant from OpponentValues for opponent.
	// And offer the highest full value for opponent when his value stay less.
	offer(o) {
		this.Rounds--;

		if (!o) return this.GetControl();

		this.RevertOffer(o);
		this.Models.push(this.ModelOpponentOffer(o));

		if (this.Rounds > 0) return this.GetControl();

		let opponentModel = this.GetOpponentOptimalModel();
		if (opponentModel) {
			return this.ModelOptimalOffer(this.OpponentValues[opponentModel], this.Items.map(x => 0));
		} else {
			return this.GetSecondControl();
		}
	}

	// Make offer pointing at opponent items and update proposions
	RevertOffer(offer) {
		for (let i = 0; i < this.TypesCount; i++) {
			offer[i] = this.Items[i] - offer[i];
		}
	}

	// Unacceptable offer without any information
	GetControl() {
		let control = [];
		for (let i = 0; i < this.TypesCount; i++) {
			control[i] = this.Items[i];
		}
		return control;
	}

	/// Winnable bad offer
	GetSecondControl() {
		let control = this.GetControl();
		for (let i = 0; i < this.TypesCount; i++) {
			if (control[i] > 1) {
				control[i] -= Math.floor(control[i] / 2);
			}
		}
		return control;
	}

	// Fill posible values for oppenent
	CalculateOpponentValues(values, sum = 0, index = 0) {
		if (sum == this.Price) {
			this.OpponentValues.push([...values]);
			return;
		}
		if (index == this.TypesCount) return;
		for (let cost = 0; cost <= this.Price; cost++) {
			let newSum = sum + this.Items[index] * cost;
			if (newSum > this.Price) break;
			values[index] = cost;
			this.CalculateOpponentValues(values, newSum, index + 1);
		}
		values[index] = 0;
	}

	// Model the offer by possible values
	ModelOpponentOffer(offer) {
		let result = [];
		for (let i = 0; i < this.OpponentValues.length; i++) {
			let sum = 0;
			for (var j = 0; j < this.TypesCount; j++) {
				sum += offer[j] * this.OpponentValues[i][j];
			}
			result[i] = sum;
		}
		return result;
	}

	// Model the offer by optimal result
	ModelOptimalOffer(opponentValues, items, index = 0) {
		let result = [...items];
		let resultValue = 0;
		for (let count = 0; count <= this.Items[index]; count++) {
			items[index] = count;
			if (index + 1 < this.TypesCount) {
				items = this.ModelOptimalOffer(opponentValues, items, index + 1);
			}
			let opponentAmount = this.GetOpponentAmount(items, opponentValues);
			let amount = this.GetAmount(items);
			if (amount >= opponentAmount && amount + opponentAmount >= resultValue) {
				resultValue = amount + opponentAmount;
				result = [...items];
			}
		}
		return result;
	}

	// Get amount
	GetAmount(items) {
		let result = 0;
		for (let i = 0; i < this.TypesCount; i++) {
			result += items[i] * this.Prices[i];
		}
		return result;
	}

	// Get amount for opponent
	GetOpponentAmount(items, opponentValues) {
		let result = 0;
		for (let i = 0; i < this.TypesCount; i++) {
			result += (this.Items[i] - items[i]) * opponentValues[i];
		}
		return result;
	}

	/// Get opponent values model which was optimal for his proposions
	GetOpponentOptimalModel() {
		let optimalModelIndex = -1;
		let optimalModelPrice = 0;
		for (let i = 0; i < this.OpponentValues.length; i++) {
			let modelTotalPrice = this.GetOpponentModelTotalPrice(i);
			if (optimalModelPrice < modelTotalPrice) {
				optimalModelIndex = i;
				optimalModelPrice = modelTotalPrice;
			}
		}
		return optimalModelIndex != -1 ? optimalModelIndex : null;
	}

	// Get total price for opponent model
	GetOpponentModelTotalPrice(modelIndex) {
		let result = 0;
		for (let i = 0; i < this.Models.length; i++) {
			result += this.Models[i][modelIndex];
		}
		if (this.CheckIfModelIsWrong(modelIndex)) return 0;
		return result;
	}

	// Check if model is wrong
	CheckIfModelIsWrong(modelIndex) {
		let modelPrices = [];
		for (let i = 0; i < this.Models.length; i++) {
			modelPrices.push(this.Models[i][modelIndex]);
		}
		let issues = 0;
		let conformity = 0;
		for (let i = 1; i < this.Models.length - 1; i++) {
			if (modelPrices[i - 1] >= modelPrices[i + 1]) {
				conformity++;
			} else {
				issues++;
			}
		}
		return issues >= conformity;
	}

};