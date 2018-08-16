/*jslint node: true*/
"use strict";

module.exports = class Agent {
	constructor (me, counts, values, max_rounds, log) {
		// this._init_time = Date.now();

		this.counts = counts;
		this.values = values;

		this.rounds_left = max_rounds;
		this.round = 0;

		this.log = log;

		this._offers = {names: [], prices: {}};
		this.offers = [];

		this.max_price = this.getOfferPrice(counts);
		this.my_prev_offers = [];

		this.createOffers();
	}

	offer (o) {
		this.rounds_left--;
		this.round++;

		if (!o) {
			this.my_prev_offers.push(this.offers[0].join(','));
			return this.offers[0];
		}

		let offer_price = this.getOfferPrice(o);

		let min_price = this.max_price * 0.9;
		if (this.rounds_left < 2) {
			min_price = this.max_price * 0.5;
		}

		// Cycle offers if we have it less than rounds
		let next_offer = this.offers[(this.round - 1) % this.offers.length];

		this.my_prev_offers.push(next_offer.join(','));

		if (
			this.my_prev_offers.includes(o.join(',')) || 
			offer_price >= this.getOfferPrice(next_offer) ||
			offer_price >= min_price
		) {
			return;
		}

		return next_offer;
	}

	createOffers () {
		// I want everything and I want nothing
		this.offers_blacklist = [
			this.counts.join(','),
			(new Array(this.counts.length + 1)).join('0,').slice(0, -1)
		];

		// We dont need items with zero value
		for (var i = 0; i < this.values.length; i++) {
			if (!this.values[i]) {
				this.counts[i] = 0;
			}
		}

		this.getOfferCombinations();
		this.sortOffers();
	}

	getOfferCombinations (counts, sorted_index) {
		counts = counts || this.counts.slice();
		sorted_index = sorted_index || this.getCountsSortedByPrice();

		let index = sorted_index[0];

		for (let i = 0; i < this.counts[index] + 1; i++) {
			let offer = counts.slice();

			offer[index] -= i;

			let name = offer.join(',');

			if (!this.offers_blacklist.includes(name) && !this._offers.names.includes(name)) {
				this._offers.names.push(name);
				this._offers.prices[name] = this.getOfferPrice(offer);
				this.offers.push(offer);
			}

			// Creating more offer combinations may reach the time limit
			// For contest conditions generating so many combinations is impossible
			// if (this.offers.length > 2000) {
			// if (Date.now() - this._init_time > 750) {
			// 	return;
			// }

			if (sorted_index.length > 1) {
				this.getOfferCombinations(offer, sorted_index.slice(1));
			}
		}
	}

	sortOffers () {
		let prices = [];
		let min_price = this.max_price * 0.2;

		// Group offers by price
		let offers_by_price = {};
		for (let i = 0; i < this.offers.length; i++) {
			let price = this.getOfferPrice(this.offers[i]);

			// We will not offer combinations with low cost
			if (price > min_price) {
				if (!offers_by_price[price]) {
					offers_by_price[price] = [];
					prices.push(price);
				}

				offers_by_price[price].push(this.offers[i]);
			}
		}

		prices = prices.sort((a, b) => {
			return b - a;
		});

		this.offers = [];

		// Sort an array of offers with the same price 
		// to put offers with fewer objects at the top of the list
		for (let i = 0; i < prices.length; i++) {
			let price = prices[i];

			offers_by_price[price].sort((a, b) => {
				return a.reduce((c, d) => c + d) - b.reduce((c, d) => c + d);
			});

			for (let j = 0; j < offers_by_price[price].length; j++) {
				this.offers.push(offers_by_price[price][j]);
			}
		}
	}

	// We have values list like that: {book: 0, hat: 5, ball: 8, flower: 4};
	// and we create indexes list sorted by descending of price: [ball, hat, flower, book]
	// to begin iterations in getOfferCombinations() from the most expensive items
	getCountsSortedByPrice () {
		let values = [];

		for (let i = 0; i < this.counts.length; i++) {
			values.push([i, this.values[i]]);
		}

		values.sort((a, b) => {
			return b[1] - a[1];
		});

		let counts = [];

		for (let i = 0; i < values.length; i++) {
			counts.push(values[i][0]);
		}

		return counts;
	}

	getOfferPrice (offer) {
		if (this._offers.prices[offer.join(',')]) {
			return this._offers.prices[offer.join(',')]
		}

		let price = 0;

		for (let i = 0; i < offer.length; i++) {
			price += offer[i] * this.values[i];
		}

		return price;
	}
}
