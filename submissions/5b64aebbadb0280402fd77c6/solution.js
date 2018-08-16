'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
		this.me = me;
		this.counts = counts;
		this.values = values;
		this.my_values = [];
		this.his_values = [];
		this.last_offer = [];
		this.offers_num = 0;
		this.rounds = max_rounds;
		this.rounds_max = max_rounds;
        this.log = log;
        this.total = 0; // Баланс сделки
		this.items_max = 0; // Максимальное число предметов
		this.values_sum = 0;
		this.next = 434639;
		
        for (let i = 0; i<counts.length; i++) {
			this.total += counts[i]*values[i];
			this.values_sum += values[i];
			this.items_max += counts[i];
		}
		
		// Находим удельную ценность каждого предмета (свою, и оценку для оппонента)
		for (let i = 0; i<values.length; i++) {
			this.my_values[i] = (1.0 * values[i]) / this.values_sum;
			this.his_values[i] = 1.0;
		}  

		this.his_values = this.values_normalization(this.his_values);
		this.last_total = this.total + 1;
    }
	
	// Функция задаёт решающий функционал, чем он больше, тем выгоднее для нас раунд
	rule (my_counts, his_values)
	{
		let sum = 0;
		let his_count = 0;
		for (let i = 0; i<my_counts.length; i++)
        {
			his_count = this.counts[i] - my_counts[i];
			//if (this.my_values[i] != 0)
				sum += my_counts[i] * this.my_values[i] - his_count * his_values[i];
        }
		
		return sum;
	}

	rand()
	{
	  this.next = (this.next * 1103515245 + 12345) % 65536;
	  return this.next;
	}

	total_get(offer) 
	{
		let total = 0;
		for(let i = 0; i < offer.length; ++i)
			total += offer[i] * this.values[i];
		return total;
	}
	
	my_offer_get(n)
	{
		let my_offer = [];
		let items_left = this.items_max;
		//this.log('make offer');
		for (let i = 0; i<n; i++) {
			if (items_left > 0 || this.values[i] == 0) {
				let items_num = (this.rand() % (this.counts[i] + 1));
				//this.log(`items_num: ${items_num}`);
				
				if (items_num <= items_left) {
					my_offer[i] = items_num;
					items_left -= items_num;
				}
				else {
					my_offer[i] = items_left;
					items_left = 0;
				}
			}
			else {
				my_offer[i] = 0;
			}
		}
			
		return my_offer;
	}

	values_normalization(in_values)
	{
		let sum = 0;
		for (let i = 0; i < in_values.length; ++i)
		{
			sum += in_values[i];
		}

		let out_values = [];
		for (let i = 0; i < in_values.length; ++i)
			out_values[i] = (1.0 * in_values[i]) / sum;
		return out_values;
	}

	is_equal_offer (offer1, offer2)
	{
		for (let i = 0; i < offer1.length; ++i){
			if (offer1[i] != offer2[i])
				return false;
		}
		return true;
	}
	
	is_equal_last_offer(my_offer)
	{
		for (let i = 0; i < this.offers_num; ++i)
		{
			if (this.is_equal_offer(my_offer, this.last_offer[i])) {
				return true;
			}				
		}

		return false;
	}

    offer(o){
		//var time = (new Date).getTime();

        //this.log(`${this.rounds} rounds left`);
        this.rounds--;
		
		// Если не первый ход
        if (o)
        {
			let in_total = this.total_get(o);
			if (in_total >= 8)
				return;
			else {
				//this.log(`input total: ${in_total}`);
			}
				

			let his_values_est = [];
			for (let i = 0; i <o.length; i++){
				let his_count = this.counts[i] - o[i];
				//this.log(`his_count: ${his_count}/${this.counts[i]}`);
				his_values_est[i] = (1.0 * his_count * this.items_max) / (this.counts[i] * this.counts[i]);
			}

			his_values_est = this.values_normalization(his_values_est);
			if ((this.rounds + 1 == this.rounds_max) || (this.me && (this.rounds+2 == this.rounds_max)))
				for (let i = 0; i < this.his_values.length; ++i)
					this.his_values[i] = his_values_est[i];
			else
				for (let i = 0; i < this.his_values.length; ++i)
					this.his_values[i] = (0.2 * this.his_values[i] + 0.8 * his_values_est[i]);

			
			//this.log(`his_values_est: ${his_values_est}`);
			//this.log(`his_values: ${this.his_values}`);

			let my_values_sum = 0;
			let his_values_sum = 0;
			for (let i = 0; i < o.length; ++i){
				my_values_sum += this.my_values[i];
				his_values_sum += this.his_values[i];
			}
			
			//this.log(`total: ${this.total}`);
			//this.log(`my_values_sum: ${my_values_sum}`);
			//this.log(`his_values_sum: ${his_values_sum}`);

			let res = 0;
			
			// Иначе делаем несколько итераций по выбору наилучшего предложения
			let cnt = 1000000;

			for (let i = 0; i<this.counts.length; i++)
			{
				if (0 == this.my_values[i])
					o[i] = 0;
				else
					o[i] = this.counts[i];
			}
			
			let res2;
			let my_offer = [];

			while (cnt-- > 0) {
				my_offer = this.my_offer_get(o.length);
				res2 = this.rule(my_offer, this.his_values);
				
				if (res2 > res) {
					if (this.total_get(my_offer) >= 8) {
						if (!this.is_equal_last_offer(my_offer)) {
							res = res2;
							for (let i = 0; i<o.length; i++) {
								o[i] = my_offer[i];
							} 
						}
					}
				}
			}
			
			this.last_offer[this.offers_num++] = o;
			//this.log(`${o.toString()} offer`);
			this.last_total = this.total_get(o);
			//this.log(`last_total: ${this.last_total}`);

			//time = (new Date).getTime() - time;
			//this.log(`time ${time}`);
            return o;
        }
		
		//this.log('my first round');

		// Если первый ход
        o = [];
        for (let i = 0; i<this.counts.length; i++)
        {
            if (0 == this.my_values[i])
				o[i] = 0;
			else
				o[i] = this.counts[i];
		}
		
		this.last_offer[this.offers_num++] = o;
		//this.log(`${o.toString()} offer`);
		this.last_total = this.total_get(o);
		//this.log(`last_total: ${this.last_total}`);

		//time = (new Date).getTime() - time;
		//this.log(`time ${time}`);
        return o;
    }
};