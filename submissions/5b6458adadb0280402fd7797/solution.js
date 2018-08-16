'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        

        /* Strategy: assign a randomly generated string for each object (hopefully that string does not repeat),
           then order the objects in the val_obj class according to their value, and store the name in the keySorted array.
           Now we have an array of sorted objects (keySorted) and an object (name_obj) which stores the 'name'
           (the randomly assigned string) of the object with its index in the 'counts' array as value, 
           thus enabling us to request the objects by their index in an ascending order.

           Alright, so we've reached this far. We're now going to start by requesting all objects 
           (who knows, maybe the opponend has a buggy script that will accept) and with our threshold set to the total value - 1.
           We're now going to use the xc variable to reduce the number of objects requested in ascending order.
           That means, that we'll drop the objects with the smallest value for us and keep all the ones with a higher value.
           We also make sure that the requested objects' value isn't smaller than our threshold, and, if it is
           we request all of the objects excluding the one with the smallest value. We'll also stop substracting and only
           keep lowering our threshold to see what the opponent comes up with (the opponent will most likely reduce its request value too).

           And that's pretty much it. Hoping the probability will help us
        
        */
        this.counts = counts;
        
        this.values = values;
        
        this.rounds = max_rounds;
        
        this.log = log;
        
        this.total = 0;
        
        for (let i = 0; i < counts.length; i++){
           
            this.total += counts[i] * values[i];
        }

        this.object_types = this.counts.length;
        
        this.obj = {};

        // Store as key-value pair

        this.name_obj = {};
        this.val_obj = {};
        this.countsc = [];

        for(let i = 0; i < this.object_types; i++){

            this.countsc[i] = this.counts[i];

        }

        // Well, firstly we need to name each of our objects randomly, and store the name in an object
        // key-value pair with its index in the counts array

        this.names = [];
        
        for(let i = 0; i < this.object_types; i++){
            
            var name = Math.random().toString(36).substring(2, 5);
            
            this.name_obj[name] = i;
            this.val_obj[name] = this.values[i];

            this.names.push(name);
        }

        var list = this.val_obj;
    

        // Order the name list

        this.keySorted = Object.keys(list).sort(function(a,b){return list[a] -list[b]});
        
        // Set a threshold 

        this.threshold = this.total - 1;

        // This will be our count for substractions
        this.xc = 0;

        // Tells us if we should continue substracting or not
        this.substract = true;
        this.substractT = true;
    }


    offer(o){
               
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
       
        // Reduce the threshold if the round is a multiple of 2
        // We could reduce the threshold every round, but this gives us a higher threshold

        if(this.rounds % 2 == 0 && this.substractT){
            
            this.threshold--;
           
        }
        if(this.rounds == 1){
            this.threshold = this.total / 2 + 1;
            this.substractT = false;
        }

        // Tricky part: 
        
        if(this.countsc[this.name_obj[this.keySorted[this.xc]]] > 0 && this.substract){

            this.countsc[this.name_obj[this.keySorted[this.xc]]] -= 1;
        }
       
        if(this.countsc[this.name_obj[this.keySorted[this.xc]]] == 0){
            
            if(this.xc > (this.object_types - 1)){
                this.xc = 0;
            }
            else{
                this.xc++;
            }

        }

        var s = 0;
        
        for (let i = 0; i < this.counts.length; i++) {         
                
            s += this.countsc[i] * this.values[i];
        
        }

        if(s < this.threshold){
            
            this.substract == false;
           
            for(let i = 0; i < this.object_types; i++){
                this.countsc[i] = this.counts[i];
            }

            if(this.countsc[this.name_obj[this.keySorted[0]]] > 1){
    
                this.countsc[this.name_obj[this.keySorted[0]]] -= 1;
            }
            else{
                this.countsc[this.name_obj[this.keySorted[0]]] = 0;
            }
        }
        
        if (o){

            let sum = 0;

            for (let i = 0; i < o.length; i++){
               
                sum += this.values[i] * o[i];
            }

            if (sum > this.threshold)
                return;       
        }

        o = this.counts.slice();

        for (let i = 0; i < o.length; i++) {         
                
            o[i] = this.countsc[i];
        
        }

        return o;
    }
};
