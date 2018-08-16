/* 

████████╗ ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗██████╗  ██████╗ ██╗   ██╗
╚══██╔══╝██╔═══██╗██║   ██║██╔════╝ ██║  ██║██╔══██╗██╔═══██╗╚██╗ ██╔╝
   ██║   ██║   ██║██║   ██║██║  ███╗███████║██████╔╝██║   ██║ ╚████╔╝ 
   ██║   ██║   ██║██║   ██║██║   ██║██╔══██║██╔══██╗██║   ██║  ╚██╔╝  
   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝██║  ██║██████╔╝╚██████╔╝   ██║   
   ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝    ╚═╝   
                               
   ~ “Security is mostly a superstition. Life is either a daring adventure or nothing.” ~
                                                                           — Helen Keller

    => by Ivan Sedletzki for Hola
*/


module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me
        this.rounds = max_rounds;
        this.lowestIndex = 0
        this.counts = counts
        this.values = values
        for(var i = 1; i < counts.length; i ++) {
            this.lowestIndex = counts[i] > 0 && values[i] < values[this.lowestIndex] ? i : this.lowestIndex
        }
    }
    offer(o){
        this.rounds--;

        // accept exceptional offers
        if(o){
            let score = 0
            for(var i = 0; i < o.length; i ++) {
                score += o[i] * this.values[i]
            }
            if(score >= 8) return undefined
        }

        // nah
        if(this.rounds > 0) {
            return this.counts
        }
        
        // well, needs to concede if that's really the only option
        if(this.me == 1) {
            return o.reduce((acc, a) => acc + a) > 0 ? undefined : this.counts
        }

        // concede some crap
        this.counts[this.lowestIndex] --
        return this.counts
    }
};
