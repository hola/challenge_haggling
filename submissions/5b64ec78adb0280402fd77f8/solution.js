'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
		this.turnSecond = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
		this.prevAnswers = new Array();
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
		
		if(o && this.getTotalValue(o) >= (this.total/2+2)) {
			return;
		}
		
		let combList = new Array();
		combList.push({index:0, value:this.getTotalValue(this.comb_0_1_2())});
		combList.push({index:1, value:this.getTotalValue(this.comb_0_1())});
		combList.push({index:2, value:this.getTotalValue(this.comb_0_2())});		
		combList.push({index:3, value:this.getTotalValue(this.comb_1_2())});				
		combList.push({index:4, value:this.getTotalValue(this.comb_0())});				
		combList.push({index:5, value:this.getTotalValue(this.comb_1())});	
		combList.push({index:6, value:this.getTotalValue(this.comb_2())});		
		combList = this.sortCombList(combList);		
		let i1 = 0;
		let i2 = 0;		
		let results = new Array();		
		if(this.rounds == 5) {			
			results = this.turnSecond ? this.getDefaultCombination(o) : this.makeFirstOffer();			
		} else if(this.rounds == 4) {
			results = this.getCombinationByIndex(combList[0].index);
		} else if(this.rounds == 3) {
			results = this.getCombinationByIndex(combList[1].index);
		} else if(this.rounds == 2) {
			i2 = this.getRandomIndex(new Array());
			results = this.getCombinationByIndex(combList[i2].index);
		} else if(this.rounds == 1) {
			if(Math.random() > 0.2 && this.getTotalValue(o) > 1) {
				return;
			}
			i1 = this.getRandomIndex([i2]);
			results = this.getCombinationByIndex(combList[i1].index);
		} else {
			results = this.getDefaultCombination(o);
		}				
		results = this.checkPrevAnswers(results);
		this.prevAnswers.push(results);
		this.rounds--;
		if(!o) {
			return results;
		}				
		return this.getTotalValue(o) > this.getTotalValue(results) ? undefined : results;
    }
	
	checkPrevAnswers(results) {		
		if(this.isAnswerPresent(results)) {					
			let results4 = this.getNewResults4();
			let results3 = this.getNewResults3();
			let results2 = this.getNewResults2();
			let results1 = this.getNewResults4();			
			if(this.rounds == 4) {
				if(!this.isAnswerPresent(results4)) {
					return results4;
				} else if(!this.isAnswerPresent(results3)) {
					return results3;
				} else if(!this.isAnswerPresent(results2)) {
					return results2;
				} else if(!this.isAnswerPresent(results1)) {
					return results1;
				} else {
					return results;
				}
			} else if(this.rounds == 3) {
				if(!this.isAnswerPresent(results3)) {
					return results3;
				} else if(!this.isAnswerPresent(results2)) {
					return results2;
				} else if(!this.isAnswerPresent(results1)) {
					return results1;
				} else if(!this.isAnswerPresent(results4)) {
					return results4;
				} else {
					return results;
				}
			} else if(this.rounds == 2) {
				if(!this.isAnswerPresent(results2)) {
					return results2;
				} else if(!this.isAnswerPresent(results1)) {
					return results1;
				} else if(!this.isAnswerPresent(results4)) {
					return results4;
				} else if(!this.isAnswerPresent(results3)) {
					return results3;
				} else {
					return results;
				}				
			} else if(this.rounds == 1) {
				if(!this.isAnswerPresent(results1)) {
					return results1;
				} else if(!this.isAnswerPresent(results4)) {
					return results4;
				} else if(!this.isAnswerPresent(results3)) {
					return results3;
				} else if(!this.isAnswerPresent(results2)) {
					return results2;
				} else {
					return results;
				}				
			}
		}
		return results;
	}
	
	isAnswerPresent(results) {
		let present = false;
		for (let i = 0; i<this.prevAnswers.length; i++) {
			if(this.isArraysEqual(this.prevAnswers[i], results)) {
				present = true;
				break;
			}
		}
		return present;
	}
	
	getNewResults1() {
		let numbers = this.counts.slice();
		let newResults = new Array();
		for (let i = 0; i < numbers.length; i++) {
			newResults[i] = 0;
		}
		let index = this.counts.length - 1;
		for (let i = 0; i < this.getTotalNumberObjects(); i++) {
			if(numbers[index] > 0) {
				newResults[index] = newResults[index] + 1;
				numbers[index] = numbers[index] - 1;
				if(this.getTotalValue(newResults) >= (this.total/2 + 1)) {
					return newResults;
				}
			}
			if(numbers[index] == 0) {
				index--;
			}			
			if(index < 0) {
				index = this.counts.length - 1;
			}
		}
	}	
	
	getNewResults2() {
		let numbers = this.counts.slice();
		let newResults = new Array();
		for (let i = 0; i < numbers.length; i++) {
			newResults[i] = 0;
		}		
		let index = 0;
		for (let i = 0; i < this.getTotalNumberObjects(); i++) {
			if(numbers[index] > 0) {
				newResults[index] = newResults[index] + 1;
				numbers[index] = numbers[index] - 1;
				if(this.getTotalValue(newResults) >= (this.total/2 + 1)) {
					return newResults;
				}
			}
			if(numbers[index] == 0) {
				index++;
			}			
			if(index >= this.counts.length) {
				index = 0;
			}
		}
	}	
	
	getNewResults3() {
		let numbers = this.counts.slice();
		let newResults = new Array();
		for (let i = 0; i < numbers.length; i++) {
			newResults[i] = 0;
		}		
		let index = this.counts.length - 1;
		for (let i = 0; i < this.getTotalNumberObjects(); i++) {
			if(numbers[index] > 0) {
				newResults[index] = newResults[index] + 1;
				numbers[index] = numbers[index] - 1;
				if(this.getTotalValue(newResults) >= (this.total/2 + 1)) {
					return newResults;
				}
			}
			index--;
			if(index < 0) {
				index = this.counts.length - 1;
			}
		}
	}	
	
	getNewResults4() {
		let numbers = this.counts.slice();
		let newResults = new Array();
		for (let i = 0; i < numbers.length; i++) {
			newResults[i] = 0;
		}		
		let index = 0;
		for (let i = 0; i < this.getTotalNumberObjects(); i++) {			
			if(numbers[index] > 0) {				
				newResults[index] = newResults[index] + 1;
				numbers[index] = numbers[index] - 1;				
				if(this.getTotalValue(newResults) >= (this.total/2 + 1)) {					
					return newResults;
				}				
			}
			index++;
			if(index >= this.counts.length) {
				index = 0;
			}
		}
	}
	
	isArraysEqual(a, b) {	
		if (a == null || b == null) {
			return false;
		}
		if (a.length != b.length) {
			return false;	
		}
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return false;	
			}
		}
		return true;
	}
	
	makeFirstOffer() {
		let result = this.counts.slice();
        for (let i = 0; i<result.length; i++)
        {
            if (!this.values[i])
                result[i] = 0;
        }
        return result;
	}
	
	getTotalNumberObjects() {
		let result = 0;
		for (let i = 0; i<this.counts.length; i++) {
			result += this.counts[i];
		}
		return result;
	}
	
	getDefaultCombination(o) {
		let result = o.slice();
        for (let i = 0; i<result.length; i++) {
            if (!this.values[i]) {
				result[i] = 0;
			}                
        }
		const total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let count = 0;
			while(count < 4) {
				count++;
				let index = -1;
				const indexes = [0,1,2];
				for (let i = 0; i<indexes.length; i++) {
					if(result[indexes[i]] == 0 && this.values[indexes[i]]) {
						index = indexes[i];
					}
				}
				if(index != -1) {
					let quantity = this.counts[index];
					if(quantity > 1) {
						quantity = Math.round(quantity/2);
					}
					result[index] = quantity;							
				}
				if(this.getTotalValue(result) > (this.total/2 + 3)) {
					break;
				}
			}			
		}		
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
        return result;
	}
	
	getRandomIndex(indexes) {
		let number = 2;
		let found = false;
		while (!found) {
			let number = Math.random() * (7 - 2) + 2;
			if(number > 6) {
				number = 6;
			}
			if(indexes.indexOf(number) == -1) {
				found = true;
			}
		}
		return number;
	}
	
	getCombinationByIndex(index) {		
		if(index == 0) {
			return this.comb_0_1_2();
		} else if(index == 1) {
			return this.comb_0_1();
		} else if(index == 2) {
			return this.comb_0_2();
		} else if(index == 3) {
			return this.comb_1_2();
		} else if(index == 4) {
			return this.comb_0();
		} else if(index == 5) {
			return this.comb_1();
		} else if(index == 6) {
			return this.comb_2();
		} else {
			return this.comb_0_1_2();
		}
	}
	
	sortCombList(l) {
		const result = l.slice();		
		for (let i = 0; i<result.length-1; i++) {
			for (let j = i+1; j<result.length; j++) {				
				if(result[j].value > result[i].value) {
					const t = result[i];
					result[i] = result[j];
					result[j] = t;
				}
			}				
		}
		return result;
	}
	
	comb_0_1_2() {		
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if(this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}
		return result;
	}
	
	comb_0_1() {
		const indexes = [0,1];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		const total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[2];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[2] = quantity;			
		}
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;
	}

	comb_0_2() {
		const indexes = [0,2];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		const total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[1];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[1] = quantity;			
		}
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;		
	}	
	
	comb_1_2() {
		const indexes = [1,2];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		const total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[0];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[0] = quantity;			
		}	
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;		
	}	
	
	comb_0() {
		const indexes = [0];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		let total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[1];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[1] = quantity;			
		}
		total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[2];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[2] = quantity;			
		}	
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;		
	}

	comb_1() {
		const indexes = [1];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		let total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[0];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[0] = quantity;			
		}
		total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[2];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[2] = quantity;			
		}	
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;		
	}	
	
	comb_2() {
		const indexes = [2];
		const result = this.counts.slice();
		for (let i = 0; i<this.counts.length; i++) {
			if((indexes.indexOf(i) != -1) && this.values[i]) {
				let quantity = this.counts[i];
				if(quantity > 1) {
					quantity = Math.round(quantity/2);
				}
				result[i] = quantity;
			} else {
				result[i] = 0;
			}
		}
		let total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[0];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[0] = quantity;			
		}
		total = this.getTotalValue(result);
		if(total < (this.total/2 + 3)) {
			let quantity = this.counts[1];
			if(quantity > 1) {
				quantity = Math.round(quantity/2);
			}
			result[1] = quantity;			
		}	
		if(this.getTotalValue(result) < (this.total/2 + 3)) {
			for (let i = 0; i<this.counts.length; i++) {
				if(this.values[i] && this.counts[i] > result[i]) {
					result[i] = result[i] + 1;
				}					
			}
		}		
		return result;
	}	
	
	getTotalValue(o) {
		let sum = 0;
		for (let i = 0; i<o.length; i++)
			sum += this.values[i]*o[i];
		return sum;
	}	
};
