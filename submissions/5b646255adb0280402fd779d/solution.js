
module.exports = class Agent {

constructor(me, counts, values, max_rounds, log){
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
	let elements = 0;
    for (let i = 0; i<counts.length; i++){
        this.total += counts[i]*values[i]; //number of max value
	    elements += counts[i];  // number of all elements
	}
	let loop = Math.ceil(elements/2);
	this.myoffer = new Array(counts.length).fill(0);
	var val = Object.create(values);
	while (loop>0) {
		var mindex = val.indexOf(Math.max.apply(null, val));
		var change = Math.min(counts[mindex],loop);
		this.myoffer[mindex] = change;
		loop -= change;
		val[mindex]=-1;
	}
	this.hispriority = Array(counts.length).fill(0);
	this.minoptimal = Math.ceil(this.total/2); // need to change for more optimal value
    }


offer(o){
    this.rounds--;
    if (o) { 
        let sum = 0;
        for (let i = 0; i<o.length; i++){
            sum += this.values[i]*o[i];
	        this.hispriority[i] += o[i]/this.counts[i];
        }
	    if (this.rounds === 0 && sum >= this.minoptimal)
		     return;
	    else  
            if (sum > this.minoptimal)
			    return;
    }
	else {
		return this.myoffer;
	}

	var maximum = 0;
	var priority =  Object.create(this.hispriority);
	var available = [[],[]];
	for (let i =0; i<o.length; i++) {
		maximum = Math.max.apply(null, priority); 
		var maxindex = priority.indexOf(maximum);
		var free = 0;
		var j=0;
		for (let i=0; i<o.length; i++) {
		    free = this.counts[i]-o[i];
		    if (free > 0)
		        while (free>0) {
		            available[0][j]= this.values[i];
		            available[1][j]= i;
		            j++;
		            free--;
		        }
		}
	
        const twoSum = (arr, target) => {
		    let map = {},
		    k = 0,
		    results = [];
			for (let i=0; i<arr.length; i++) {
				if (map[arr[i]] !==undefined) {
					results.push([k, i]);
				} else {
					map[target-arr[i]] = arr[i];
					k=i;
				}
			}
			return results;
		};

		
		var change = -1;
		change = twoSum(available[0],this.values[maximum]);
		if ((change.length > 0) && (change != -1)){
	        	this.myoffer[change[0][0]] += 1; //need optimization for better proirity
	        	this.myoffer[change[0][1]] +=1;
			this.myoffer[maxindex]--;
	    	}
		priority.splice(priority.indexOf(maximum),0);	
	}        
        return this.myoffer;
    }

};
