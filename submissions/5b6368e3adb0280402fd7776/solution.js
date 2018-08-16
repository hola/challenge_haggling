'use strict'; /*jslint node:true*/

// node haggle.js --id fwrk@bk.ru:hU28FFjk dev.js wss://hola.org/challenges/haggling/arena/standard
//
// node haggle.js s.js example.js
// types = 2..10		= 3
// minObj = 1..10	   = 1
// maxObj = minObj..10  = 6 (max total count of all objects)
// totalSS = maxObj..   = 10
// rounds = 1..		 = 5 (pairs)
//
/* Usage: node haggle.js [OPTION...] [AGENT1 [AGENT2]]

  -l, --log=FILE.json	log the session into a file
  -r, --replay=FILE.json replay a logged session
  -t, --timeout=MS	   enforce timeout upon scripts (default: do not enforce)
  -s, --seed=N		   pseudo-random seed for session parameters (default: random)
  -I, --id=ID			agent identifier for the remote server
  -T, --types=N		  types of objects (default: 3)
  -m, --min-objects=N	minimum total number of objects (default: 1)
  -M, --max-objects=N	maximum total number of objects (default: 6)
  -V, --total-value=V	total value of all objects (default: 10)
  -R, --max-rounds=N	 maximum number of negotiation rounds (default: 5)
  -u, --unsafe		   use unsafe, in-process script loader without VM
  -f, --force			override Node.js version check
  -q, --quiet			do not log to the console
  -h, --help			 show this text

Run one or more negotiation sessions involving a human, local scripts or a remote server.

Two human agents:
  node haggle.js [OPTION...]
Human vs. script:
  node haggle.js [OPTION...] SCRIPT
Script vs. script;
  node haggle.js [OPTION...] SCRIPT SCRIPT
Human vs. remote agent:
  node haggle.js [OPTION...] URL
Script vs. remote agent:
  node haggle.js [OPTION...] SCRIPT URL
  
//*/

function LCG(seed) {
	function lcg(a) {return a * 48271 % 2147483647}
	seed = seed ? lcg(seed) : lcg(Math.random());
	return function() {return (seed = lcg(seed)) / 2147483648}
}

function array_fill(from, num, value) {
	let res = [];
	//res.length = to;
	let to = from + num;
	for (let i = from; i < to; i++) res[i] = value;
	return res;
}

function array_sum(arr) {
	let res = 0;
	for (let i in arr) res += arr[i];
	return res;
}

module.exports = class Agent {
	constructor(me, counts, values, max_rounds, log){
		this.log = log;
		this.log = function(){};
		this.is_second_trader = me;
		this.types = counts.length;
		this.counts = counts;
		this.values = values;
		this.max_rounds = max_rounds;
		
		this.total = 0;
		this.total_count = 0;
		for (let i = 0; i < this.types; i++) {
			this.total += this.counts[i] * this.values[i];
			this.total_count += this.counts[i];
		}
		
		
		let seed = 31 + max_rounds + me * 7717;
		for (let i = 0; i < this.types; i++) {
			seed += (i + 1) * 787 * (this.counts[i] * 317 ^ this.values[i] * 4049);
		}
		this.rand = LCG(seed);
		
		this.init();
		
	}
	init(){		
		this.rounds = this.max_rounds - (this.is_second_trader ? 1 : 0) + 1;
		
		this.appropriable_cost = (this.total * 0.61)|0;
		this.offers = [];
		for (let i = 0; i <= this.total; i++) {
			this.offers[i] = [];
		}
		
		let types = this.types;
		// this.counts[i] ,  this.values[i]
		let counts = array_fill(0, types, 0);
		let t;
		do {
			let sum = this.offer_value(counts);
			this.offers[sum].push(Array.from(counts));
			
			for (t = types - 1; t >= 0; t--) {
				if (counts[t] < this.counts[t]) {
					counts[t]++;
					for (let t2 = t + 1; t2 < types; t2++) {
						counts[t2] = 0;
					}
					break;
				}
			}
		} while (t >= 0);
		// Now this.offers is filled
		
		for (let i = 0; i <= this.total; i++) {
			this.log('offers[' + i + ']: count = ' + this.offers[i].length);
			// counts.join(' ')
		}
	}
	offer_value(o){
		let sum = 0;
		for (let i = 0; i < o.length; i++) {
			sum += this.values[i] * o[i];
		}
		return sum;
	}
	offer(o){
		this.rounds--;
		this.log(this.rounds + ' offers left (i am ' + (this.is_second_trader ? 'second' : 'first') + ')');
		
		let appropriable_rate = 0.29 + 0.5 * (this.rounds / this.max_rounds);
		if (appropriable_rate > 1) appropriable_rate = 1;
		let appropriable_score = (this.total * appropriable_rate)|0;
		
		if (o) {
			let sum = this.offer_value(o);
			if (sum >= appropriable_score) {
				return;
			}
		}
		
		
		// Create own offer
		for (let i = this.total; i > 0; i--) { // i > appropriable_score ?
			let oi_count = this.offers[i].length;
			if (oi_count == 0) continue;
			
			let oi = (this.rand() * oi_count)|0;
			o = this.offers[i][oi].slice();
			this.offers[i].splice(oi, 1);
			
			this.log('extracted, offers[' + i + ']: count = ' + this.offers[i].length);
			break;
		}
		// default offer if none found in previous loop
		if (!o) {
			o = this.counts.slice();//copy array
			for (let i = 0; i < o.length; i++) {
				if (!this.values[i]) {
					o[i] = 0;
				}
			}
		}
		return o;
	}
};
