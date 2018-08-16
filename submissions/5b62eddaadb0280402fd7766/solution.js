'use strict'; /*jslint node:true*/
/*



*/


module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log)
	{


		//log("identity "  + "node51.js " + me); //log for custom arena
		//log("values " + me + " " + values[0]  + " " + values[1] + " " + values[2]); //log for custom arena

		this.show_log=false; //do not show logs

		//pause
		if (me==1 && this.show_log==true)
			{
				for (let z=0;z<1000000;z+=1)
					{
					//just for proper order in console
					}
			}
		
		this.me = me;
		this.enemy_best_offer; //array {,,,}
		this.my_worst_offer; //index in this.map
		this.poor_offer=[]; //obsolet
		this.enemy_offers=[]; //array of reseived offers
		this.turn = me;
		this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
		this.log = log;
 		this.total = 0;
        for (let i = 0; i<counts.length; i++)
		{
            this.total += counts[i]*values[i];
			this.poor_offer.push(counts[i]);
		}

		// make offers table with recursive function
		this.map = [];
		function get_variants (level)
		{
			var map = [];
			if (level==counts.length-1)
			{
				//return last level
				for (let q=0;q<=counts[level];q++)
				{
					map.push(String(q));
				}
			}
			else
			{
				//add current level to tree
				var branch=[];
				branch = get_variants(level+1);
				for (let q=0;q<=counts[level];q++)
				{
					for (let w=0;w<=branch.length-1;w++)
					{
						map.push(String(q)+String(branch[w]));
					}
				}
			}
		return map;			
		}
		
		//getting all possible offers
		this.map = get_variants(0);
		
		//make array with offer value
		this.off_sum = [];
		this.made_offers = [];
		var tot=0;
		for (let y=0;y<this.map.length;y++)
		{
			tot=0;
			for (let i=0;i<=counts.length-1;i++)
			{
			tot+=Number(this.map[y].charAt(i))*values[i];
			}
			this.off_sum.push(tot);
			this.made_offers.push(0);//unrealized feature
		}
		
		//sorting array by value
		var f;
		do
		{
			f=0;
			for (let i=0;i<this.map.length-1;i++)
			{
				if (this.off_sum[i]>this.off_sum[i+1])
				{
					var t = this.off_sum[i+1];
					this.off_sum[i+1]=this.off_sum[i];
					this.off_sum[i]=t;
					var t = this.map[i+1];
					this.map[i+1]=this.map[i];
					this.map[i]=t;
					f++;
				}
				else if (this.off_sum[i]==this.off_sum[i+1])
				{
					var c1=0,c2=0;
					for(let v=0;v<this.map[i].length;v++)
					{
						c1+=Number(String(this.map[i]).charAt(v));
						c2+=Number(String(this.map[i+1]).charAt(v));
					}
					if (c1>c2)
					{
					var t = this.off_sum[i+1];
					this.off_sum[i+1]=this.off_sum[i];
					this.off_sum[i]=t;
					var t = this.map[i+1];
					this.map[i+1]=this.map[i];
					this.map[i]=t;
					f++;
					}
				}
			}
		} while (f>0);

		 if (this.turn==0) //show debug info
		 {			 
			for (let g=0;g<this.map.length;g++)
				{
				if (this.show_log) this.log(this.map[g] + " = " + this.off_sum[g]);
				}
		 }
			
		//get possible price layouts with recursive function
		//price from 0 to 10 (a)
		function get_possible_values(level)
		{
			var val_map = [];
			if (level==counts.length-1)
			{
				//return last level
				for (let q=0;q<=10;q++)
				{
					val_map.push(q.toString(16));//convert to hex
 				}
			}
			else
			{
				//add current level to tree
				var branch=get_possible_values(level+1);
				for (let q=0;q<=10;q++)
				{
					for (let w=0;w<branch.length;w++)
					{
						val_map.push(q.toString(16)+branch[w].toString(16));
					}
				}
			}
		return val_map;	
		}

		//delete bad combinations (sum for opponent!=10)
		var val_map_old=get_possible_values(0);
		this.values_map=[];
		var sum=0;
		for(let q=0;q<val_map_old.length;q++)
			{
				sum=0;
				for (let j=0;j<String(val_map_old[q]).length;j++)
				{
					sum+=parseInt(String(val_map_old[q]).charAt(j),16)*counts[j];
				}
				if (sum==10)
				{
					this.values_map.push(val_map_old[q]);
				}
			}
		

		//print table for debug
		if (this.turn==0)
			{
			for(let q=0;q<this.values_map.length;q++)
				{
					if (this.show_log) this.log("poss price = " + this.values_map[q]);
				}
			}
	
		//starting point for making offer
			for(let t=0;t<this.map.length;t++)
				{
					if (this.off_sum[t]==10)
						{
							this.offer_iterator=t;
							this.my_worst_offer=t;
							if (t==this.map.length-1)
							{
								this.offer_iterator--;
								this.my_worst_offer--;
							}
							break;
						}
				}

	}
	
	offer(o)
	{
        //this.log(`${this.rounds} rounds left`);
        this.rounds--;
        //this.log(this.max_rounds + " u");
		var received_offer=o;
		
		if (o)
        {
			//add received order to array
			this.enemy_offers.push(o.slice());
			//this.log("push " + o + " pull " + this.enemy_offers[this.enemy_offers.length-1]);
			
			//clear possible prices set from unreal variants
			remove_unreal_price_sets(this.counts,this.values_map,o.slice(),this.log,this.show_log);
			
			//clear possible prices set from unreal variants (enemy rejects offer == 10)
			remove_unreal_price_sets_2(this.counts,this.values_map,this.my_worst_offer,this.log,this.show_log);
			
			//compute offer value
			let offer_value = get_offer_value(o,this.map,this.off_sum,this.log);
			
			//check if offer value = 10
			if (offer_value==10) return;
			
			//check if offer value >= my offer value
			if (offer_value>=this.off_sum[this.my_worst_offer]) 
				{
				return; // accept offer if it is better than mine
				}
				else
				{
				if (this.show_log) this.log("enemy_offer_value=" + offer_value + " my_worst_offer_value=" + this.off_sum[this.my_worst_offer] + " = no accept");	
				}
			
			//checking if enemy offers something better and update this.enemy_best_offer
			if (this.enemy_best_offer==undefined)
				{
				this.enemy_best_offer=o.slice();
				}
			else
				{
				if (offer_value>get_offer_value(this.enemy_best_offer,this.map,this.off_sum,this.log))
					{
					//new enemy_best_offer
					this.enemy_best_offer=o.slice();
					}
				}
		}
		
		// making offers for opponent
		//================================
		if (o==undefined)
			o = this.counts.slice();

		var offer_limit = 5 + this.rounds + 1;
		//this.log("offer_limit= " + offer_limit);
		
		if (this.rounds==this.max_rounds-1)
		{
			if (this.show_log) this.log("first offer");

			// first offer by iterator (best for me - 1 item for opponent)
			o=make_offer_from_iterator (this.map, this.offer_iterator,this.counts.length);
			
			if (this.show_log) this.log("I offer - " + o);
			
			return o;
		}

		if(this.rounds<(this.max_rounds-1)&&this.rounds>0)
		{
			if (this.show_log) this.log("middle rounds");
			// moving iterator by 1 
			this.offer_iterator--;
			
			o=make_offer_from_iterator (this.map, this.offer_iterator,this.counts.length);
			
			// if my offer value < offer_limit - keep it unchanged
			if(get_offer_value(o,this.map,this.off_sum,this.log) < offer_limit)
				{
					this.offer_iterator++;
					o=make_offer_from_iterator (this.map, this.offer_iterator,this.counts.length);
				}	
				
			if (this.show_log) this.log("my o=" + o + " value=" +get_offer_value(o,this.map,this.off_sum,this.log));
			if (this.show_log) this.log("enemy_best=" + this.enemy_best_offer + " value=" +get_offer_value(this.enemy_best_offer,this.map,this.off_sum,this.log));
			
			//check if there is better offer from opponent
			if (get_offer_value(o,this.map,this.off_sum,this.log)<=get_offer_value(this.enemy_best_offer,this.map,this.off_sum,this.log))
				{
				o=this.enemy_best_offer.slice();
				if (this.show_log) this.log("Return to enemy offer - " + o);
				}
			else
				{					
				if (this.show_log) this.log("I offer - " + o);
				}
			this.my_worst_offer=Get_iterator_from_offer(o,this.map);
			
			if (this.show_log) this.log("turn=" + this.turn);
			
			if (this.rounds==1) // && this.turn==1)
				
				{
				//try to make forecast for our last-chance offer 
				
				var enemy_prices = make_price_forecast(this.enemy_offers,this.values_map,this.log, this.counts,this.show_log);
				if (enemy_prices==undefined) return o; // no data, probably all-in enemy
				
				if (this.show_log) this.log("pre_last price forecast = (" + enemy_prices[0].toFixed(1) + " " + enemy_prices[1].toFixed(1) + " " + enemy_prices[2].toFixed(1)+")");
				//this.log("forecast " + this.turn + " " + enemy_prices[0].toFixed(2) + " " + enemy_prices[1].toFixed(2) + " " + enemy_prices[2].toFixed(2));
				
				for(let d=0;d<this.enemy_offers.length;d++)
					{
					//this.log("enemy offer = " + this.enemy_offers[d]);
					}

				//making array with enemy values
				var off_values_enemy=[];
				for (let y=0;y<this.map.length;y++)
				{
					var enemy_sum=0;
					for (let x=0;x<this.map[y].length;x++)
					{
						enemy_sum+=(this.counts[x]-Number(this.map[y].charAt(x)))*enemy_prices[x];
					}
					off_values_enemy[y]=enemy_sum;
					//this.log("map " + y + "val= " + off_values_enemy[y]);
				}
				
				//choosing offer
				var final_iterator=Get_iterator_from_offer(o,this.map);				
				for (let y=this.map.length-1;y>1;y--) // start from begining
				{
					//this.log("enemy_sum = " + off_values_enemy[y].toFixed(1) + " mine = " + this.off_sum[y]);
					if (this.turn==0)
					{
						//for turn==1 more greedy params
						if((off_values_enemy[y]>=4 && this.off_sum[y]>=6)||(this.off_sum[y-1]<7))
						{
						if (off_values_enemy[y]>0)
							{
							//make new offer
							o=make_offer_from_iterator (this.map, y,this.counts.length);
							if (this.show_log) this.log("new offer!! = " + o);
							break;
							}
						}
					}
					else
					{
						if((off_values_enemy[y]>=5 && this.off_sum[y]>=6)||(this.off_sum[y-1]<6))
						{
						if (off_values_enemy[y]>0)
							{
							//make new offer
							o=make_offer_from_iterator (this.map, y,this.counts.length);
							if (this.show_log) this.log("new offer!! = " + o);
							break;
							}
						}
					}
					
					
				}
				
				//remove zero-items from offer
				if (this.turn==1)
				{
					for (let i=0;i<o.length;i++)
						{
							if(this.values[i]==0) o[i]=0;
						}
					}
				}

				//check if we have 1 item with value 8-9-10
				//get rid from other items				
				if (this.turn==1)
				{
					for (let i=0;i<o.length;i++)
					{
						if(this.values[i]>=8) 
						{
							if (this.show_log) this.log("keep only valueble item" + this.values[i]);			    
							for (let j=0;j<o.length;j++)
							{
								if(this.values[j]<7) o[j]=0;
							}
						}
					}
				}
			return o;
		}
		
		if(this.rounds==0)
		{
			if(this.turn==0)
				{
				//making final offer
				if (this.show_log) this.log("making final offer");
				this.offer_iterator--;
				
				//check if enemy wants only 1 item
				{
					if (this.show_log) this.log("one item checking");
					var sum	 = 0;
					for (let i=0;i<received_offer.length;i++) sum+=(this.counts[i]-received_offer[i])
					//accept offer if enemy wants it for 3 rounds
					if (sum==1)
						{
						//check if offer the same for 3 rounds at least && value > 1
						if (get_offer_value(received_offer,this.map,this.off_sum,this.log)>1 && received_offer.toString()==this.enemy_offers[this.enemy_offers.length-2].toString() && received_offer.toString()==this.enemy_offers[this.enemy_offers.length-3].toString() && get_offer_value(received_offer,this.map,this.off_sum,this.log)>1) return;
						}
				}
				
				o=make_offer_from_iterator (this.map, this.offer_iterator,this.counts.length);
			
				// if my offer value < 6 - keep it unchanged
				if(get_offer_value(o,this.map,this.off_sum,this.log)<6)
					{
					this.offer_iterator++;
					o=make_offer_from_iterator (this.map, this.offer_iterator,this.counts.length);
					}	
				
				//Check if enemy offer is better
				if (get_offer_value(o,this.map,this.off_sum,this.log)<=get_offer_value(this.enemy_best_offer,this.map,this.off_sum,this.log))
					{
					o=this.enemy_best_offer.slice();
					if (this.show_log) this.log("Return to enemy order " + o);
					}
				else
					{					
					if (this.show_log) this.log("I offer - " + o + " iterator=" + this.offer_iterator);
					}
				this.my_worst_offer=Get_iterator_from_offer(o,this.map);				
				
				//trying to make forecast of opponent prices
				var enemy_prices = make_price_forecast(this.enemy_offers,this.values_map,this.log, this.counts,this.show_log);
				if (enemy_prices==undefined)
				{
					o=make_offer_from_iterator (this.map, this.offer_iterator+1,this.counts.length);
					return o; // no data, probably all-in enemy
				}
				
				if (this.show_log) this.log("price forecast = (" + enemy_prices[0].toFixed(1) + " " + enemy_prices[1].toFixed(1) + " " + enemy_prices[2].toFixed(1)+")");
				//this.log("forecast 0 " + enemy_prices[0].toFixed(2) + " " + enemy_prices[1].toFixed(2) + " " + enemy_prices[2].toFixed(2));
				for(let d=0;d<this.enemy_offers.length;d++)
					{
					//this.log("enemy offer = " + this.enemy_offers[d]);
					}

				//array of enemy values
				var off_values_enemy=[];
				for (let y=0;y<this.map.length;y++)
				{
					var enemy_sum=0;
					for (let x=0;x<this.map[y].length;x++)
					{
						enemy_sum+=(this.counts[x]-Number(this.map[y].charAt(x)))*enemy_prices[x];
					}
					off_values_enemy[y]=enemy_sum;
					//this.log("map " + y + "val= " + off_values_enemy[y]);
				}
				
				//trying to make reasonable offer to enemy
				var final_iterator=Get_iterator_from_offer(o,this.map);				
				for (let y=this.map.length-1;y>1;y--) // begin from start
				{
					if (this.show_log)  this.log("enemy_sum = " + off_values_enemy[y].toFixed(1) + " mine = " + this.off_sum[y]);
					if((off_values_enemy[y]>=4 && this.off_sum[y]>=6 && off_values_enemy[y]>0)||((this.off_sum[y-1]<6)))
					{
						if (off_values_enemy[y]>0)
						{
							//make new offer
							o=make_offer_from_iterator (this.map, y,this.counts.length);
							if (this.show_log) this.log("new offer!! = " + o);
							break;
						}
					}
				}

				//remove zero-items from offer
				for (let i=0;i<o.length;i++)
					{
						if(this.values[i]==0) o[i]=0;
					}
				
				//check if we have 1 item with value 8-9-10
				//get rid from other items				
				
				for (let i=0;i<o.length;i++)
					{
						if(this.values[i]>=8) 
						{
							if (this.show_log) this.log("keep only valueble item" + this.values[i]);			    
							for (let j=0;j<o.length;j++)
							{
								if(this.values[j]<8) o[j]=0;
							}
						}
					}
				
				return o;
				}
			else{
				//final accept
				if (this.show_log) this.log("making final accept");
				if (get_offer_value(o,this.map,this.off_sum,this.log)>=1) // total value
					{
					if (this.show_log) this.log("accepted sum= " + get_offer_value(o,this.map,this.off_sum,this.log));
					return;
					}
				}
		}
		return this.poor_offer;
    
		function Get_iterator_from_offer(o,map)
		{
			var y;
			for (let i=0;i<map.length;i++)
			{
				if (map[i]==o.join(""))
					y=i;
			}
			return y;
		}	

		//function ========================================================================
		
		function remove_unreal_price_sets_2(counts, values_map, my_offer, log, show_log)
		{
			//removes price sets where my rejected offer values >7 for enemy
			var value_for_enemy=0;
			for (let i=0;i<values_map.length;i++)
				{
					value_for_enemy=0;
					for(let j=0;j<counts.length;j++)
					{
						value_for_enemy+=(counts[j]-my_offer[j])*values_map[i][j];
					}
					//log("value for enemy="+value_for_enemy);

					if (value_for_enemy>7)
					{
						//delete variant from values_map

						if (values_map.length>3) 
							{
								values_map.splice(i,1);
								i--;
							}
							//log("must delete variant="+values_map[i] + " val for enemy=" + value_for_enemy);
					}
				}
			return 0;
		}

		
		//function ========================================================================
		
		function remove_unreal_price_sets(counts, values_map, last_offer, log,show_log)
		{
			//log("====remover: values_map.length=" + values_map.length);
			//log("last_offer=" + last_offer);
			var value_for_enemy=0;
			for (let i=0;i<values_map.length;i++)
				{
					value_for_enemy=0;
					for(let j=0;j<counts.length;j++)
					{
						value_for_enemy+=(counts[j]-last_offer[j])*parseInt(values_map[i].charAt(j),16);
						//log("price = " + parseInt(values_map[i].charAt(j),16));
					}
					//log("value for enemy=" + value_for_enemy + " i=" + i);

					if (value_for_enemy<=4)
					{
						//delete variant from values_map
						//if (show_log) log("delete variant="+ values_map[i] + " val for enemy=" + value_for_enemy + " last_offer " + last_offer);
						if (values_map.length>3) 
							{
								values_map.splice(i,1);
								i--;
							}					
					}
				}
			return 0;
		}
		
//function ========================================================================

		function get_offer_value(offer,map,off_sum,log)
		{
			for(let y=0;y<map.length;y++)
			{
				if (map[y]==offer.join(""))
				{
				//log("get_offer_value=" + off_sum[y]);
				return Number(off_sum[y]);
				}
			}
		}
		
//function ========================================================================
	
		function make_price_forecast(enemy_offers,values_map,log,counts,show_log)
		{
			
			//makes forecast of opponent prices based on received offers
			var sums=[];
			var sums_f_avg=[];
			var price_weight = [];
			var price_prc_03 = [];
			var price_prc_07 = [];
			
			for(let i=0;i<enemy_offers[0].length;i++)
			{
				sums[i]=0;
				sums_f_avg[i]=0;
				price_weight[i]=0;
				price_prc_03[i]=0;
				price_prc_07[i]=0;
			}
			
			
			var tmp_arr=[];
			var ii;
			
			
			for(let i=0;i<values_map[0].length;i++)
			{
				if (tmp_arr.length>0) tmp_arr.splice(0,tmp_arr.length); //очистка массива	
				
				for(let y=0;y<values_map.length;y++)
				{
					tmp_arr.push(parseInt(values_map[y][i],16));
					//log ("push_tmp " + values_map[y][i]);
				}
				tmp_arr.sort(function(a,b) {
						return   a-b;         //сортировка по возрастанию
									});
				ii=0;
				do 
				{
					//calculating percentiles
					if (ii<=((tmp_arr.length-1)*0.35) && (ii+1)>((tmp_arr.length-1)*0.35)) 
					{
						price_prc_03[i]=parseInt(tmp_arr[ii],16)+(parseInt(tmp_arr[ii+1],16)-parseInt(tmp_arr[ii],16))*((tmp_arr.length-1)*0.35-ii);
						//log("ii="+ ii + "<=" + ((tmp_arr.length-1)*0.3) + " val(ii)=" + parseInt(tmp_arr[ii],16) + " val(ii+1)=" + parseInt(tmp_arr[ii+1],16) +  " perc(" + ((tmp_arr.length-1)*0.3-ii) + " * " + (parseInt(tmp_arr[ii+1],16)-parseInt(tmp_arr[ii],16))+ ")");
						//if (ii<(tmp_arr.length*0,7-1) && (ii+1)>=(tmp_arr.length*0,7-1)) price_prc_07[i]=parseInt(tmp_arr[ii+1],16);
						//log("tmp[i]= " + tmp_arr[ii]);
					}
					ii++;
				} while (ii<tmp_arr.length-1);
				if (show_log) log("percentile 0.3=" + price_prc_03[i] + " 0.7= " + price_prc_07[i]);
			}
		
			//calculating weigths
			for(let y=0;y<enemy_offers.length;y++)
			{
				for(let i=0;i<enemy_offers[y].length;i++)
				{
					sums[i]+=Number(enemy_offers[y][i])/counts[i];
					//log("sum=" + sums[i]);
					
					for(let z=0;z<values_map.length;z++)
					{
					if(price_weight[z]==undefined) price_weight[z]=0; 
					//add some points to price sets 
					if (sums[i]==0)  
						{
							if (parseInt(values_map[z][i],16)>price_prc_03[i])
							{
							price_weight[z]++;
							//log("sums[" + i + "]=" + sums[i] + " " + parseInt(values_map[z][i],16) + " > " + price_prc_03[i]);
							}
						}	
					else
						{	
							if (parseInt(values_map[z][i],16)<price_prc_03[i]) 
							{
							price_weight[z]++;
							//log("sums[" + i + "]=" + sums[i] + " " + parseInt(values_map[z][i],16) + " <= " + price_prc_03[i]);
							}
						}
					}
				
				}

					if (show_log) log("s= " + sums[0] + " " + sums[1] + " " + sums[2]);
				
					//sum_k+=1; //enemy_offers.length-y;
			
			}
			//check some correspondense between prices and add some points to price sets
			for(let z=0;z<values_map.length;z++)
				{
					//if (Check_correspondence (values_map[z],sums,log)) price_weight[z]+=3;
					price_weight[z]+=Check_correspondence (values_map[z],sums,log);
				}
			if (show_log) log("correspondence check complete");
			//sorting array by points
			
			var c;
			do{
				c=0;
				for(let i=0;i<values_map.length-1;i++)
				{
					//log(price_weight[i]+ "   " + price_weight[i+1]);
					if (price_weight[i]<price_weight[i+1])
						{
						//log("swap");
						//make swap
						var t=price_weight[i];
						price_weight[i]=price_weight[i+1];
						price_weight[i+1]=t;
						
						t=values_map[i];
						values_map[i]=values_map[i+1];
						values_map[i+1]=t;
						c++;
						}
				}
			} while (c>0);
			
			//average price 
			for (let j=0;j<counts.length;j++)
				{
				var i_max;
				if (values_map.length>=3) i_max=3; else i_max=values_map.length;
				for (let i=0;i<i_max;i++)
					{
						//log ("v_map_parce = " + parseInt(values_map[i].charAt(j),16));
						sums_f_avg[j]+=parseInt(values_map[i].charAt(j),16);	
				
					}
				}
			var aver_price = [];
			
			for (let i=0;i<counts.length;i++)
				{
					aver_price[i]=sums_f_avg[i]/i_max;
					//log ("sum_avg="+ sums_f_avg[i]);
				}
			
			//print weigth table for debug
			for (let z=0;z<values_map.length;z++)
				{
				if (show_log) log(values_map[z] + " " + price_weight[z]);
				}
			if (show_log) log("aver price = " + aver_price);
			return aver_price;
		}

//end function====================================
		
// function ========================================================
		function Check_correspondence (values_in,weights_in,log) //1 - string, 2- arr
		{       
				
				var values=values_in + values_in.charAt(0);//add first to end
				var weights=weights_in.slice();
				var score=0;
				
				weights.push(weights[0]);	//add first to end
				for (let i=0;i<values.length-1;i++)
				{
				//log(values + " = " + weights);
				//log("ch i=" + i + " wi=" + weights[i] + " wi+1=" + weights[i+1] + " vi=" + parseInt(values.charAt(i),16) + " vi+1=" + parseInt(values.charAt(i+1),16) );
				if (weights[i]>weights[i+1] && (parseInt(values.charAt(i),16)<=parseInt(values.charAt(i+1),16)))
					{
						score+=3;
						//check passed
					}
				if (weights[i]<weights[i+1] && (parseInt(values.charAt(i),16)>=parseInt(values.charAt(i+1),16)))
					{
						//check passed
						score+=3;
					}
				//additional checks
				if (weights[i]==0 && values[i]<4) score--; // предмет, который не предлагали не может стоить менее 4
				}
				return score;
		}
	
// end function =====================================================	

	function make_offer_from_iterator (map, iterator,count_length)
		{
			var o=[0];
			for (let i=0;i<count_length;i++)
				{
					o[i]=Number(map[iterator].charAt(i));
				}
				return o;
		}
// end function =====================================================	


	}
	
	
	
	
};
	