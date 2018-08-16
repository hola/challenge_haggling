'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
		this.max_rounds = max_rounds;
		this.me = me;
        this.log = log;
        this.total = 0;
		this.variant = 0;
		this.skidka_full = 0;
		this.maxValue = 0;
		this.maxValueCount = -1;
		this.maxValueI = -1;
		this.variant_mass_uje = new Array (counts.length);
		this.contr_variant = this.counts.slice(); 

		for (let i = 0; i<counts.length; i++)
		{	
			this.variant_mass_uje[i] = counts[i];			
			this.total += counts[i]*values[i]; ;
			if (this.values[i] > 0)
			{
				this.contr_variant[i] = 0;
				this.variant_mass_uje[i] = 0;
				if((this.values[i] > this.maxValue) && ((this.values[i] * this.counts[i]) <=7 ))
				{
					this.maxValue = this.values[i];
					this.maxValueCount = this.counts[i];
					this.maxValueI = i;					
				}
			} 
		}
    }
	
	
	
    offer(o){
        this.log(`${this.rounds} rounds left~~~`);
		this.rounds--;	
		let sum;
		let contr_sum;
		let mne_pred;
		
        if (o)
        {
            sum = 0;
			mne_pred = o.slice();
            for (let i = 0; i<o.length; i++)
			    {
				sum += this.values[i]*o[i];
				}		
			if (sum > this.variant) 
			{
				      this.variant = sum;
				for (let i = 0; i<o.length; i++)
		                   {
			                this.contr_variant[i] = o[i];							
		                   }
		    } 
								
			var skidka_raschetnaya =this.total - this.total*((this.max_rounds - this.rounds - 1)/(this.max_rounds + this.me + 1));
			if(this.me == 1) {skidka_raschetnaya = skidka_raschetnaya - 1;}
			
			let uslovie51 = (this.me == 0);
			let uslovie52 = (this.rounds  == 0);
			let uslovie55 = ( uslovie51 && uslovie52 && (sum >= this.total * 0.37));
			let uslovie1 = (sum >= 0.75 * this.total) && ((this.rounds + 1) < this.max_rounds );
			let uslovie2 = (sum > 0 && this.me == 1 && this.rounds == 0);			
			let uslovie3 = (sum >=  skidka_raschetnaya);
			let uslovie4 = (sum >= 0.9 * this.total) && ((this.rounds + 1) == this.max_rounds );

            if (uslovie1 || uslovie2 || uslovie3 || uslovie4 || uslovie55)
			{				
				return;
			}
			
        }  
		else 
		{
			o = this.counts.slice();
			for (let i = 0; i<o.length; i++)
			    {
				    if (!this.values[i])
				  	o[i] = 0;
				}
			return o;											
		}
	
		if (this.rounds >= 0)
			{
				contr_sum = 0;
				let flag_skidki = 0;
				
			    for (let i = 0; i<o.length; i++)
				    {	
						let uslovie23 = (flag_skidki == 0);
						let uslovie24 = ((this.values[i]+ this.skidka_full) <= (this.total - skidka_raschetnaya));
						let uslovie22 = (this.counts[i] > this.variant_mass_uje[i]);
						let uslovie21 = (! (mne_pred[i] > this.variant_mass_uje[i]) );                             
			            if (uslovie21 && uslovie22 && uslovie23 && uslovie24)
							{
								flag_skidki = 1;
								let skidkaFull = this.skidka_full;
								let variantMassUje = this.variant_mass_uje[i];
								while((skidkaFull < (this.total - skidka_raschetnaya))&& (variantMassUje < this.counts[i]))
									{
										variantMassUje = variantMassUje + 1;
										skidkaFull =this.skidka_full +  (this.values[i] * (variantMassUje +1 ));
										if(skidkaFull <= (this.total - skidka_raschetnaya))
										{
											variantMassUje = variantMassUje + 1;
										}
									}	
								this.variant_mass_uje[i] = variantMassUje;
								this.skidka_full = this.skidka_full +  (this.values[i] * this.variant_mass_uje[i]);
							} 
							
						o[i] = this.counts[i] - this.variant_mass_uje[i];
						let uslovie71 = (o[i] < mne_pred[i]);
						if(uslovie71)
							{
							o[i] = mne_pred[i];}
							contr_sum  = contr_sum + this.variant_mass_uje[i] * this.values[i]; 
							}
			}
	
			if(contr_sum > 0)
			{ 
			    if(sum >= (this.total - contr_sum)) return; 
			} 
	
			let uslovie61 = (this.me == 0);
			let uslovie62 = (this.rounds  == 0);
			let uslovie63 = (this.variant > 0);
			let uslovie64 = (this.variant < this.maxValue * this.maxValueCount);			
			if (uslovie61 && uslovie62 && uslovie63 && !uslovie64)
			{
			      o = this.contr_variant.slice();				  
			}
			
			if (uslovie61 && uslovie62 && !uslovie63 && !uslovie64)
			{	
				o = this.counts.slice();
				contr_sum = 0;
				for (let i = 0; i<o.length; i++)
					{
						if (!this.values[i])
						o[i] = 0;
						contr_sum =contr_sum + o[i]*this.values[i];
					}
			} 
					
			if (uslovie61 && uslovie62 && !uslovie63 && uslovie64)		
			{
				o = this.counts.slice();
				contr_sum = 0;
				for (let i = 0; i<o.length; i++)
					{
						if (!this.values[i]) o[i] = 0;
						
						if(i == this.maxValueI) o[i] = 0;
							
						contr_sum =contr_sum + o[i]*this.values[i];
					}
						
			}				
			
		return o;
    }
};
