'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
		this.getPrice = function (mp,mc){
			let sum = 0;
			for (let i = 0; i<mc.length; i++)
				sum += mc[i]*mp[i];
			return sum;
		};
		this.getCost = function(val,cnt){
			let sum = 0;
			for(let i=0;i<val.length;i++)sum+=val[i]*cnt[i];
			return sum;
		}
		this.getNegCost = function(val,cntNeg,cnt){
			let sum = 0;
			for(let i=0;i<val.length;i++)sum+=val[i]*(cnt[i]-cntNeg[i]);
			return sum;
		}
		this.getCount = function(cnt){
			let sum = 0;
			for(let i=0;i<cnt.length;i++)sum+=cnt[i];
			return sum;
		}
		function Combo(v,c,cc){
			this.value=v;
			this.count=c;
			this.combi=cc.slice();
			this.toString=function(){return "V:"+this.value+" C:"+this.count+" T:"+this.combi;}
			};
		this.perebrat = function perebor(cv,vv){
			let res = []
			if(cv.length==1){
				if(vv[0]==0){
					res.push([0]);
				}else {
					for(let i = 0; i<=cv[0];i++){
						res.push([i]);
					}
				}
				return res;
			}
			let curVal = cv.pop();
			let curPrice = vv.pop();
			let valuesBefore = perebor(cv,vv);
			if (curPrice==0){
				for(let j=0;j<valuesBefore.length;j++){
					let newmas = valuesBefore[j].slice();
					newmas.push(0);
					res.push(newmas);
				}
			}else {
				for(let i = 0; i<=curVal;i++){
					for(let j=0;j<valuesBefore.length;j++){
						let newmas = valuesBefore[j].slice();
						newmas.push(i);
						res.push(newmas);
					}
				}
			}
			return res;
		}
		
		this.suggestion = [];
		this.me = me;
		this.round = 0;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = this.getPrice(counts,values);
        this.totalVal = this.getCost(values,counts);
        this.totalCnt = this.getCount(counts);
		this.possiblePrices = [];
		this.possiblePricesRating = [];
		this.possibleCombo = [];
		
		
		let prices = [];
        for (let i = 0; i<counts.length; i++){
			prices.push(0);
		}
		let i =  0;
        while (i<counts.length){//пока не прошли все цифры
			i =  0; //сбрасываем счетчик цифр
			let curPrice = this.getPrice(prices,counts);//вычисляем текущую стоимость
			if(curPrice<this.total && prices[0]<=this.total){prices[0]++;continue;}//пока цена меньше, увеличиваем цену крайнего элемента
			if(curPrice==this.total){this.possiblePrices.push(prices.slice());this.possiblePricesRating.push(0);prices[0]++;continue;}//если цена нормальная, тогда запоминаем её
			//переход к след.цифре
			while(i<counts.length && (prices[i]>this.total || this.getPrice(prices,counts)>this.total)){ 
				prices[i]=0; //обнуляем текущую цифру
				i++;			
				if(i<counts.length)prices[i]++; //увеличиваем следующую
			}
		}
		

		let tmpCombies = this.perebrat(counts.slice(),values.slice());
		for(let i = 0; i<tmpCombies.length;i++){
			let valOfCombo = this.getCost(values,tmpCombies[i]);
			let cntOfCombo = this.getCount(tmpCombies[i]);
			if (cntOfCombo < this.totalCnt){//Если равно, то это все предметы, на такое другая сторона точно не пойдёт
				this.possibleCombo.push(new Combo(valOfCombo,cntOfCombo,tmpCombies[i].slice()));
			}
		}

		this.possibleCombo.sort(function (a,b){if(a.value<b.value)return -1;if(a.value>b.value)return 1;if(a.count>b.count)return -1;return 1});
		this.lastComboIndex = this.possibleCombo.length-1;
//		log ("There is "+counts.length+" element total price "+this.total);
//		log("R:"+this.possibleCombo);
//		log("AVG:"+avgval+"/"+this.possibleCombo.length+"="+(1.0*avgval/this.possibleCombo.length));
		
//		this.possiblePrices.forEach(function(item,i,arr){log("possible prices: "+item)});

		
    }
    offer(o){
		this.round++;
//        this.log(`round ${this.round}: ${this.rounds} rounds left`);
        this.rounds--;
		
        if (o)
        {
			if(this.getPrice(this.values,o)==this.total) return; //максимальная цена - соглашаемся сразу
			this.suggestion.push(o.slice());//запоминаем встречные предложения
			if (this.me==0 && this.rounds==0){
				//если я начинал и сейчас последний раунд, то предлагаем лучшее из предложенных мне
				let bestD = 0;
				let bestV = this.getCost(this.values,this.suggestion[0]);
				for(let i=1;i<this.suggestion.length;i++){
					if(this.getCost(this.values,this.suggestion[i])>bestV){
						bestD=i;
						bestV = this.getCost(this.values,this.suggestion[i]);
					}
				}
				if (bestV>=this.total/2)return this.suggestion[bestD].slice();
			}
			if (this.me==1 && this.rounds==0){
				if(this.getCost(this.values,o)>=this.total*0.4)return;
			}
			this.lastComboIndex--;
			if(this.lastComboIndex<1 && this.possibleCombo.length>1)this.lastComboIndex=1;//самой последней (нулевой) комбинацией является ноль, а это нас не устраивает
			//надо подумать, какую информацию можно  извлечь из этого предложения
			
			//увеличим рэйтинг цен
//			this.log("Enemy suggest "+o);
//			for(let i=0;i<this.possiblePrices.length;i++){
//				this.possiblePricesRating[i]+=this.getNegCost(this.possiblePrices[i],o,this.counts);
//				this.log("possible prices: "+this.possiblePrices[i]+" rating "+this.possiblePricesRating[i]);
//			}
			
//			if(this.rounds==1){
//				//предпоследний раунд - попробуем вычислить оптимальный выйгрыш согласно рейтинга цен
//			
//			}
			//но пока просто предлагаем менее затратное для меня
			return this.possibleCombo[this.lastComboIndex+1].combi.slice();
        }
		this.lastComboIndex--;
		//наше первое предложение
		return this.possibleCombo[this.lastComboIndex+1].combi.slice();
    }
};
