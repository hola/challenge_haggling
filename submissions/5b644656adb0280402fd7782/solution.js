'use strict'; /*jslint node:true*/

//**********************************************************

class MATRIX {

//**********************************************************
// constructor(n, m)
// creat matrix structure

	constructor(n, m) {
		this.n = n;
		this.m = m;
		this.numerator = new Array(this.n);
		this.denominator = new Array(this.n);
		this.b_numerator = new Array(this.n);
		this.b_denominator = new Array(this.n);
		this.f_numerator = new Array(this.m);
		this.f_denominator = new Array(this.m);
		this.free = new Array(this.m);
		this.basis = new Array(this.n);

		// blanc matrix
		for (let i=0; i<this.n; i++) {
			this.numerator[i] = new Array(this.m);
			this.denominator[i] = new Array(this.m);
			for (let j=0; j<this.m; j++) {
				this.numerator[i][j] = 0;
				this.denominator[i][j] = 1;
			}
		}
	}

//**********************************************************
// method load_1(prices, counts, values)
// load constraints to matrix
// task: minimal items quantity

	load_1(prices, counts, values) {
		
		// maximum numbers of items constraints
		for (let i=0; i<this.m; i++) {
			this.numerator[i][i] = 1;
			this.b_numerator[i] = counts[i];
			this.b_denominator[i] = 1;
			this.f_numerator[i] = -1;
			this.f_denominator[i] = 1;
			this.free[i] = i;
		}
		
		let sum = profit(counts, values);
		// price constraints
		for (let i=0; i<prices.length; i++) {
			for (let j=0; j<values.length; j++) {
			    this.numerator[this.m+i][j] = -prices[i][j] -values[j];
			}
			this.b_numerator[this.m+i] = -sum;
			this.b_denominator[this.m+i] = 1;
		}

		for (let i=0; i<this.n; i++) this.basis[i] = this.m + i;
	}

//**********************************************************
// method load_2(prices, counts, values)
// load constraints to matrix 
// task: miximal profit

	load_2(prices, counts, values) {
		
		// maximum numbers of items constraints
		for (let i=0; i<this.m; i++) {
			this.numerator[i][i] = 1;
			this.b_numerator[i] = counts[i];
			this.b_denominator[i] = 1;
			this.f_numerator[i] = -values[i];
			this.f_denominator[i] = 1;
			this.free[i] = i;
		}
		
		let sum = profit(counts, values);
		sum = Math.floor(sum/2);
		// price constraints
		for (let i=0; i<prices.length; i++) {
			for (let j=0; j<values.length; j++) {
			    this.numerator[this.m+i][j] = prices[i][j];
			}
			this.b_numerator[this.m+i] = sum;
			this.b_denominator[this.m+i] = 1;
		}

		for (let i=0; i<this.n; i++) this.basis[i] = this.m + i;
	}


//**********************************************************
// method gauss(index_in, index_out)
// Gausss matrix transformation

	gauss(index_in, index_out) {
		var chisl = this.numerator[index_out][index_in];
		var znamen = this.denominator[index_out][index_in];
		var tmp_n = new Array(this.n);
		var tmp_d = new Array(this.n);

		if (chisl < 0) {
			tmp_n[index_out] = -znamen;
			tmp_d[index_out] = -chisl;
		} else {
			tmp_n[index_out] = znamen;
			tmp_d[index_out] = chisl;
		}

		var x, y, z;
		for (let i=0; i<this.m; i++) {
			if (this.numerator[index_out][i] === 0) continue;
			x = this.numerator[index_out][i] * znamen;
			y = this.denominator[index_out][i] * chisl;
			if (y < 0) {
				y = -y;
				x = -x;
			}
			z = nod(x, y);
			this.numerator[index_out][i] = x / z;
			this.denominator[index_out][i] = y / z;
		}
		x = this.b_numerator[index_out] * znamen;
		y = this.b_denominator[index_out] * chisl;
		if (y < 0) {
			y = -y;
			x = -x;
		}
		if(x===0) {
			this.b_numerator[index_out] = 0;
			this.b_denominator[index_out] = 1;
		} else {
			z = nod(x, y);
			this.b_numerator[index_out] = x / z;
			this.b_denominator[index_out] = y / z;
		}

		var a, b, c;
		for (let i=0; i<this.n; i++) {
			if (i == index_out) continue;
			a = this.numerator[i][index_in];
			b = this.denominator[i][index_in];
			if (a === 0) {
				tmp_n[i] = 0;
				tmp_d[i] = 1;
			} else {
				c = nod(a*znamen, b*chisl);
				if (b*chisl > 0) {
					tmp_n[i] = -a*znamen / c;
					tmp_d[i] = b*chisl / c;
				} else {
					tmp_n[i] = a*znamen / c;
					tmp_d[i] = -b*chisl / c;
				}
			}

			for (let j=0; j<this.m; j++) {
x = this.numerator[i][j] * this.denominator[index_out][j]*b - 
	this.denominator[i][j] * this.numerator[index_out][j]*a;
y = this.denominator[i][j] * this.denominator[index_out][j]*b;
				if (x===0) {
					this.numerator[i][j] = 0;
					this.denominator[i][j] = 1;
				} else {
		                        z = nod(x,y);
					this.numerator[i][j] = x / z;
					this.denominator[i][j] = y / z;
				}
			}

x = this.b_numerator[i] * this.b_denominator[index_out]*b - 
	this.b_denominator[i] * this.b_numerator[index_out]*a;
y = this.b_denominator[i] * this.b_denominator[index_out]*b;
			if (x===0) {
				this.b_numerator[i] = 0;
				this.b_denominator[i] = 1;
			} else {
				var z = nod(x,y);
				this.b_numerator[i] = x / z;
				this.b_denominator[i] = y / z;
			}

		}

		a = this.f_numerator[index_in];
		b = this.f_denominator[index_in];
		for (let j=0; j<this.m; j++) {
			x = this.f_numerator[j] * this.denominator[index_out][j]*b - 
				this.f_denominator[j] * this.numerator[index_out][j]*a;
			y = this.f_denominator[j] * this.denominator[index_out][j]*b;
			if (x===0) {
				this.f_numerator[j] = 0;
				this.f_denominator[j] = 1;
			} else {
	                        z = nod(x,y);
				this.f_numerator[j] = x / z;
				this.f_denominator[j] = y / z;
			}
		}
		c = nod(a*znamen, b*chisl);
		if (b*chisl > 0) {
			this.f_numerator[index_in] = -a*znamen / c;
			this.f_denominator[index_in] = b*chisl / c;
		} else {
			this.f_numerator[index_in] = a*znamen / c;
			this.f_denominator[index_in] = -b*chisl / c;
		}

		let tmp_index = this.basis[index_out];
	        this.basis[index_out] = this.free[index_in];
	        this.free[index_in] = tmp_index;

		for (let i=0; i<this.n; i++) {
			this.numerator[i][index_in] = tmp_n[i];
			this.denominator[i][index_in] = tmp_d[i];
		}
	} // end of gauss method


//**********************************************************
// method dopusk_out()
// search illegal constraint index for out from basis

	dopusk_out() {
		var ind = -1;
		var a = 0;
		for (let i=0; i<this.n; i++) {
			if (this.b_numerator[i] >= 0) continue;
			if (this.b_numerator[i]/this.b_denominator[i] <= a) {
				ind = i;
				a = this.b_numerator[i]/this.b_denominator[i];
			}
		}
		return ind;
	}

//**********************************************************
// method dopusk_in(index_out)
// search index for in to basis

	dopusk_in(index_out) {
		var ind = -1;
		var a = 0;
		for (let i=0; i<this.m; i++) {
			if (this.numerator[index_out][i] >= 0) continue;
			if (this.numerator[index_out][i]/this.denominator[index_out][i] < a) {
				ind = i;
				a = this.numerator[index_out][i]/this.denominator[index_out][i];
			}
		}
		return ind;
	}

//**********************************************************
// method dopusk()
// search for legal solution

	dopusk() {
		var ind_out = this.dopusk_out();
		while (ind_out >= 0) {
			var ind_in = this.dopusk_in(ind_out);
			if (ind_in == -1) return false;
			this.gauss(ind_in, ind_out);
			ind_out = this.dopusk_out();
		}
		return true;
	}

//**********************************************************
// method simplex_in()
// search index for in to basis

	simplex_min_in() {
		var ind = -1;
		var min_a = 0;
		for (var i=0; i<this.m; i++) {
			if (this.f_numerator[i] <= 0) continue;
			if (this.f_numerator[i]/this.f_denominator[i] > min_a) {
				ind = i;
				min_a = this.f_numerator[i]/this.f_denominator[i];
			}
		}
		return ind;
	}

//**********************************************************
// method simplex_in()
// search index for in to basis

	simplex_max_in() {
		var ind = -1;
		var min_a = 0;
		for (var i=0; i<this.m; i++) {
			if (this.f_numerator[i] >= 0) continue;
			if (this.f_numerator[i]/this.f_denominator[i] < min_a) {
				ind = i;
				min_a = this.f_numerator[i]/this.f_denominator[i];
			}
		}
		return ind;
	}

//**********************************************************
// method simplex_out(index_in)
// search index for out from basis

	simplex_out(index_in) {
		var ind = -1;
		var min_a = 0;
		for (let i=0; i<this.n; i++) {
			if (this.numerator[i][index_in] <= 0) continue;
var a = (this.b_numerator[i] / this.b_denominator[i]) * (this.denominator[i][index_in] / this.numerator[i][index_in]);
			if (a < 0) continue;
			if (ind == -1 || a < min_a) {
				ind = i;
				min_a = a;
			}
		}
		return ind;
	}

//**********************************************************
// method simplex()
// simlex method

	simplex2min() {
		var ind_in = this.simplex_min_in();
		while (ind_in >= 0) {
			var ind_out = this.simplex_out(ind_in);
			if (ind_out == -1) return false;
			this.gauss(ind_in, ind_out);
			ind_in = this.simplex_min_in();
		}
	}

//**********************************************************
// method simplex()
// simlex method

	simplex2max() {
		var ind_in = this.simplex_max_in();
		while (ind_in >= 0) {
			var ind_out = this.simplex_out(ind_in);
			if (ind_out == -1) return false;
			this.gauss(ind_in, ind_out);
			ind_in = this.simplex_max_in();
		}
	}

//**********************************************************
// method gomoryCut()
// Gomory cut method

	gomoryCut() {
		var bbb = 0;
		var ind, rest;
		for (let i=0; i<this.n; i++) {
			rest = this.b_numerator[i] % this.b_denominator[i];
			if (rest < 0) rest += this.b_denominator[i];
			rest = rest / this.b_denominator[i];
			if (rest > bbb) {
				ind = i;
				bbb = rest;
			}
		}
		rest = this.b_numerator[ind] % this.b_denominator[ind];
		if (rest < 0) rest += this.b_denominator[ind];
		this.b_numerator[this.n] = -rest;
		this.b_denominator[this.n] = this.b_denominator[ind];

		var arr_n = new Array(this.m);
		var arr_d = new Array(this.m);
		for (let i=0; i<this.m; i++) {
			rest = this.numerator[ind][i] % this.denominator[ind][i];
			if (rest < 0) rest += this.denominator[ind][i];
			if (rest === 0) {
				arr_n[i] = 0;
				arr_d[i] = 1;
			} else {
				arr_n[i] = -rest;
				arr_d[i] = this.denominator[ind][i];
			}
		}
		this.numerator[this.n] = arr_n;
		this.denominator[this.n] = arr_d;
		this.basis[this.n] = this.n + this.m + 1;
		this.n += 1;              
	}

//**********************************************************
// method simplex2_out()
// search index for out from basis

	simplex2_out() {
		var ind = -1;
		var a = 0;
		for (let i=0; i<this.n; i++) {
			if (this.b_numerator[i] >= 0) continue;
			if (this.b_numerator[i] / this.b_denominator[i] < a) {
				ind = i;
				a = this.b_numerator[i] / this.b_denominator[i];
			}
		}
		return ind;
	}

//**********************************************************
// method simplex2_in(index_out)
// search index for in to basis

	simplex2_in(ind_out) {
		var ind = -1;
		var min_a = 0;
		for (let i=0; i<this.m; i++) {
			if (this.f_numerator[i] > 0) continue;
			if (this.numerator[ind_out][i] >= 0) continue;
var a =  (this.f_numerator[i] * this.denominator[ind_out][i]) / (this.numerator[ind_out][i] * this.f_denominator[i]);
			if (a < 0) continue;

			if (ind == -1 || a < min_a) {
				ind = i;
				min_a = a;
			}
		}
		return ind;
	}

//**********************************************************
// method simplex2()
// simplex method dual

	simplex2() {
		var ind_out = this.simplex2_out();
		while (ind_out >= 0) {
			var ind_in = this.simplex2_in(ind_out);
			if (ind_in == -1) return false;
			this.gauss(ind_in, ind_out);
			ind_out = this.simplex2_out();
		}
		return true;
	}

//**********************************************************
// method check_b()
// check B vector for integers 

	check_b() {
		for (let i=0; i<this.n; i++) {
			if (this.basis[i] >= this.m) continue;
			if ((this.b_numerator[i] % this.b_denominator[i]) != 0) return false;
		}
		return true;
	}

//**********************************************************
// method solution()
// solution array 

	solution() {
		var res = new Array(this.m);
		for (let i=0; i<this.m; i++) res[i] = 0;
		for (let i=0; i<this.n; i++) {
			if (this.basis[i] < this.m) {
				var b_index = this.basis[i];
				res[b_index] = this.b_numerator[i]/this.b_denominator[i];
			}
		}
		return res;
	}

//**********************************************************
// method dump()
// dump matrix to log 

	dump(log) {
	    for (let i=0; i<this.n; i++) {
		log(this.basis[i]+": ["+ this.numerator[i].join(",")+"]/["+ this.denominator[i].join(",")+"] = "+this.b_numerator[i]+"/"+this.b_denominator[i]);
	    }
	    log(' F: '+this.f_numerator.join(" ; "));
	    log(' f: '+this.free.join(" ; "));
	}


}; // MATRIX class  ----------------------------------------------


//**********************************************************
//			trade agent

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
	this.second = me;
        this.counts = counts;
        this.values = values;
        this.rounds_max = max_rounds-1;
        this.rounds = max_rounds;
        this.log = log;
        this.total = profit(counts, values);
	this.history = [];

	this.limits = [];
	for (let i=0; i<counts.length; i++) {
		this.limits[i] = Math.floor(this.total/this.counts[i]);
	}
	this.prices = [];
	this.collect_prices(0, []);
	let bias = -1;
	for (let i=0; i<counts.length; i++)
	    if(counts[i] > this.total/2) bias = i;

	this.batches = [];
	var batch = counts.slice();
	for (let i=0; i<counts.length; i++) {
		if(!values[i]) batch[i] = 0;
	}

	this.batches[0] = batch;

	for (let i=0; i<counts.length; i++) {
		var batch = this.batches[0].slice();
		batch[i] = 0;
		if(profit(batch, this.values) < this.total/2) continue;
		if(!cnts_array(this.batches, batch))
			this.batches[this.batches.length] = batch;
	}

	if(bias >= 0) {
		batch = [];
		for (let i=0; i<counts.length; i++) batch[i] = 0;
		batch[beas] = 1;
		if(!cnts_array(this.batches, batch))
			this.batches[this.batches.length] = batch;
	} else {
		this.collect_batches(0, []);
	}

	while(this.batches.length > max_rounds-me)
		this.batches.splice(this.batches.length-1,1);

	this.batches.sort((a,b)=>{
		let sum_a=0, sum_b=0;
	        for (let i=0; i<a.length; i++) {
			sum_a += a[i];
			sum_b += b[i];
		}
		return sum_b - sum_a;
	});
    }

    collect_prices(index, arr) {
	if(index==this.counts.length) {
            if(profit(this.counts, arr) == this.total)
		this.prices[this.prices.length] = arr;
	} else {
            for (let i = 0; i<=this.limits[index]; i++) {
		var arr1 = arr.slice();
		arr1[index] = i;
		this.collect_prices(index+1, arr1);
            }
	}
    }

    collect_batches(index, arr) {
	if(index==this.counts.length) {
            if(profit(arr, this.values) >= Math.ceil(this.total/2)) {
		if(!cnts_array(this.batches, arr))
			this.batches[this.batches.length] = arr;
	    }
	} else {
	    if(this.values[index]) {
	            for (let i = 0; i<=this.counts[index]; i++) {
			var arr1 = arr.slice();
			arr1[index] = i;
			this.collect_batches(index+1, arr1);
		    }
            } else {
		var arr1 = arr.slice();
		arr1[index] = 0;
		this.collect_batches(index+1, arr1);
	    }
	}
    }

    reason(arr) {
	let oposit = this.counts.slice();
	for (let i = 0; i<arr.length; i++) oposit[i] -= arr[i];
	let res = 0;
	for(let i=0; i<this.prices.length; i++)
	    if(profit(oposit, this.prices[i]) >= Math.floor(this.total/2))
		res++;
	return res;
    }

    max_oposit_profit(arr) {
	let oposit = this.counts.slice();
	for (let i = 0; i<arr.length; i++) oposit[i] -= arr[i];
	let res = 0;
	for(let i=0; i<this.prices.length; i++) {
	    let sum = profit(oposit, this.prices[i]);
	    if( sum > res) res = sum;
	}
	return res;
    }

    offer(o) {

        this.rounds--;

        if (o) {

// statistical agreement

	    var benefit = 0;
            for (let i=0; i<o.length; i++) benefit += this.values[i]*o[i];
	    switch(this.rounds) {
		case this.rounds_max :
			if (benefit>this.total-3) return;
			break;
		case 0 :
			if(benefit>=(Math.ceil(this.total/2)+1-this.second)) return;
			break;
		default :
			if(benefit>this.total-4) return;
	    }

// cut excess prices

	    var oposite = this.counts.slice();
	    var occupied = 0;
	    for (let i = 0; i<o.length; i++) {
		oposite[i] -= o[i];
		if(oposite[i]) occupied++;
	    }

	    for (let i = this.prices.length-1; i>=0; i--) {
		let sum = profit(this.prices[i], oposite);
		if(sum < Math.ceil(this.total/2)) this.prices.splice(i,1);
	    }

	    if(this.history.length > 0) {
            
		var opo = this.counts.slice();
		for (let i = 0; i<o.length; i++)
			opo[i] -= this.history[this.history.length-1][i];

		for (let i = this.prices.length-1; i>=0; i--) {
			let sum = profit(this.prices[i], opo);
			if(sum > this.total-3) this.prices.splice(i,1);
		}
	    }

	    if(occupied == 1) {
		let index_occupied = 0;
		for (let i = 0; i<oposite.length; i++) if(oposite[i])
		    index_occupied=i;
		if(oposite[index_occupied] == 1) {
		    if(benefit) return;
		} else {
		    if(oposite[index_occupied] < this.counts[index_occupied] &&
		       benefit > this.total/2) {
			return;
		    } else {
			var res = o.slice();
			res[index_occupied] = this.counts[index_occupied] - 1;	
			if(cmp_array(res, o)) return;
			this.history[this.history.length] = res;
			return res;
		    }
		}
	    }
        }

// maximal profit when opponent profit >= total/2  for any price

	var stock = new MATRIX(this.prices.length+this.counts.length, this.counts.length);
	stock.load_2(this.prices, this.counts, this.values);
	stock.simplex2max();

	while (!stock.check_b()) {

		stock.gomoryCut();
		stock.simplex2();
		stock.dopusk();
		stock.simplex2max();
	}
	var max_set = stock.solution();
	if((profit(max_set, this.values) >= Math.ceil(this.total/2) + Math.ceil(this.rounds/2) ||
	    profit(max_set, this.values) > this.max_oposit_profit(max_set) - 5) &&
	   this.reason(max_set) &&
	   !over_array(this.history, max_set)) {
		if(o) {
			if(absorb_array(o, max_set)) return;
		}
		this.history[this.history.length] = max_set;
		return max_set;
	} else {

// minimal item number set when my profit >= opponent profit for any price

	    stock = new MATRIX(this.prices.length+this.counts.length, this.counts.length);
	    stock.load_1(this.prices, this.counts, this.values);
	    stock.simplex2max();
	    stock.simplex2min();
	    while (!stock.check_b()) {
		stock.gomoryCut();
		stock.simplex2();
		stock.dopusk();
		stock.simplex2max();
		stock.simplex2min();
	    }

	    var vin_set = stock.solution();
	    if(profit(vin_set, this.values) >= Math.ceil(this.totsl/2) &&
	       this.reason(vin_set) &&
	       !over_array(this.history, vin_set)) {

		if(o) {
			if(absorb_array(o, vin_set)) return;
		}
		this.history[this.history.length] = vin_set;
		return vin_set;
	    } else {

		for(let i=0; i<this.batches.length; i++) {
		    if(!over_array(this.history, this.batches[i]) &&
		       this.reason(this.batches[i])) {
			if(o) {
				if(absorb_array(o, this.batches[i])) return;
			}
			this.history[this.history.length] = this.batches[i];
			return this.batches[i];
		    }
		}
		if(o) {
			if(absorb_array(o, this.batches[0])) return;
		}
		return this.batches[0];
	    }
	}
    }
};

//**********************************************************
// service functions

function nod(x, y) {
	if(x*y===0) return 1;
	var x1 = Math.abs(x);
	var y1 = Math.abs(y);
	var a = x1;
	var b = y1;
	if (y1 > x1) {
		b = x1;
		a = y1;
	}
	var rest = a % b;
	while (rest > 0) {
		a = b;
		b = rest;
		rest = a % b;
	}
	return b;
}

function profit(counts, price) {
	let sum = 0;
	for(let i=0; i<counts.length; i++) sum += counts[i] * price[i];
	return sum;
}

function cmp_array(arr1, arr2) {
	if(arr1.length != arr2.length) return false;
	for(let i=0; i<arr1.length; i++) if(arr1[i] != arr2[i]) return false;
	return true;
}

function cnts_array(arr1, arr2) {
	for(let i=0; i<arr1.length; i++) if(cmp_array(arr1[i], arr2)) return true;
	return false;
}

function absorb_array(arr1, arr2) {
	if(arr1.length != arr2.length) return false;
	for(let i=0; i<arr1.length; i++) if(arr1[i] < arr2[i]) return false;
	return true;
}

function over_array(arr1, arr2) {
	for(let i=0; i<arr1.length; i++) if(absorb_array(arr2, arr1[i])) return true;
	return false;
}
