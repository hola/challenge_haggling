/*
 * Copyright (c) 2018 Boris Fox.
 * All rights reserved.
 */

'use strict'; /*jslint node:true*/

const VERSION = '1.1';

// Tunables
const use_exp_quotient = true;
const use_demand_power = false;
const accept_at_last_turn = false;


// Utility functions

// borrowed from https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/34256998#34256998

// arrayCompare :: (a -> a -> Bool) -> [a] -> [a] -> Bool
const arrayCompare = f => ([x,...xs]) => ([y,...ys]) =>
	x === undefined && y === undefined
		? true
		: Boolean (f (x) (y)) && arrayCompare (f) (xs) (ys);

// equal :: a -> a -> Bool
const equal = x => y =>
	x === y; // notice: triple equal

// arrayEqual :: [a] -> [a] -> Bool
const arrayEqual =
	arrayCompare (equal);


module.exports = class MyHS {

	// A fresh object is created for each negotiation session
	constructor(me, counts, values, max_rounds, log) {
		this.me = me;               // 0 - my turn (offer) is first, 1 - partner's turn is first, my is second
		this.counts = counts;       // array of ints with numbers of items of each type there is to be divided (2..10 elements)
		this.values = values;       // array of ints with values of each item to me (non-negative numbers)
		this.max_rounds = max_rounds;   // rounds in a negotiation
		this.rounds = max_rounds;
		this.log = log;
		this.quotient = 1.0;
		// don't descent to zero
		this.stepdown = this.quotient/(this.rounds+1);
		this.bestOfferValue = 0;
		this.insistPower = 0;	// may be positive or negative
		this.round = 0;		// round number
		this.roundq = 0;    // round number for quotient calculation
		this.demand_power = Array.apply(null, Array(this.counts.length)).map(Number.prototype.valueOf,0);
		// calculate total value of my goods
		this.total = this._calcOfferValue(counts);
		let t = '';
		if (use_exp_quotient)
			t += 'use_exp_quotient,';
		if (use_demand_power)
			t += 'use_demand_power,';
		if (accept_at_last_turn)
			t += 'accept_at_last_turn,';
		this.log(`T00: version:${VERSION}; me:${me}; items:${this.counts.length}; counts:${this.counts}; values:${this.values}; max_rounds:${max_rounds}; total:${this.total}; stepdown:${this.stepdown}; tunables:${t.slice(0,-1)};`);
		// TODO may be it worth to pre-randomize first offer by introducing a jitter on low-value items
	}

	// Offer method (o undefined if my turn is first)
	offer(o) {
		// primary goal is to maximize my score and minimize partner's
		// secondary is to maximize bargain agreement probability (minimize zero-zero outcomes)
		this.round = this.max_rounds - this.rounds--;
		this.log(`T01: round ${this.round}, ${this.rounds} rounds left`);
		if (o) {
			// o is array with counts of items that partner side offers to be left for me.
			// it wants [counts-o] items for itself.
			let w = [];
			for (let i = 0; i < o.length; i++) {
			    w[i] = this.counts[i] - o[i];
			    this.demand_power[i] += w[i];
			}
			// TODO analyze offer statistics and try to guess partner item value on inflexible strategies?
			// calculate a total offer value for me
			let offerValue = this._calcOfferValue(o);
			this.log(`T02: offer: partner wants ${w}, left for me ${o}, value for me = ${offerValue}`);
			this.log(`T10: demand power ${this.demand_power}`);
			if (offerValue > this.bestOfferValue) {
				this.bestOffer = o;
				this.bestOfferValue = offerValue;
				this.log(`T03: best offer: ${this.bestOffer} with value ${this.bestOfferValue}`);
			}
			// Detect insisting partner strategies
			this._calcInsisting(o);
			// accept or refuse partner's offer.
			// accept if it is worthful enough
			let valThreshold = this.total * this.quotient;
			this.log(`T04: quotient = ${this.quotient}, val_threshold ${valThreshold}`);
			if (offerValue >= valThreshold) {
				this.log(`T05: offer accepted by value`);
				return;
			}
			// if rounds is 0, it's a last round, and issuing an offer will result in 0/0 agreement
			// May be get anything will be better than nothing at all ?
			if (!this.rounds && offerValue > 0 && !this.insisting && accept_at_last_turn) {
				this.log(`T06: offer accepted at last turn`);
				return;
			}
		}
		o = this._arrangeOffer();
		// cut down appetites a bit for the next turn, but don't retreat on insisting offers
		if (!this.insisting) {
			if (use_exp_quotient) {
				// exponential
				// don't descend to zero
				this.quotient = 1 - Math.exp(Math.min(this.roundq++ - (this.max_rounds - 1), -0.1));
				this.log(`T12: roundq ${this.roundq}, quotient ${this.quotient}`);
			} else {
				// linear
				this.quotient -= this.stepdown;
				this.log(`T07: stepdown, new quotient = ${this.quotient}`);
			}
		} else
			this.log(`T08: insisting offer detected, power ${this.insistPower}`);
		return o;
	}

	_calcInsisting(o) {
		let insist = this.lastOffer && arrayEqual (o) (this.lastOffer);
		if (insist) {
		    if (this.insisting)
			this.insistPower++;
		} else
		    this.insistPower = 0;
		this.insisting = insist;
		this.lastOffer = o;
	}
	
	_calcOfferValue(o) {
		let sum = 0;
		for (let i = 0; i < o.length; i++)
			sum += this.values[i] * o[i];
		return sum;
	}

	_arrangeOffer() {
		// Request all items except valueless
		let o = this.counts.slice();
		for (let i = 0; i < o.length; i++) {
			let dmc = use_demand_power ? this.demand_power[i] / (this.counts[i] * (this.round + 1) * this.max_rounds) : 0;
			let m = this.quotient > dmc ? this.quotient - dmc : this.quotient;
			let w = this.values[i] * m;
			let wi = Math.floor(w);
			this.log(`T08: i = ${i}, value = ${this.values[i]}, quotient = ${this.quotient}, dmc = ${dmc}, m = ${m}, w = ${w}, wi = ${wi}`);
			if (!wi)
				o[i] = 0;
		}
		let v = this._calcOfferValue(o);
		this.log(`T09: my offer: I want ${o}, value for me = ${v}`);
		return o;
	}
};
