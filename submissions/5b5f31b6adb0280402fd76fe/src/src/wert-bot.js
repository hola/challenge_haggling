'use strict'; /*jslint node:true*/

module.exports = class Agent {
	
    constructor(me, counts, values, max_rounds, log, parameters){
		//if (arguments.length == 6) {
		//	let tmp = log;
		//	log = parameters;
		//	parameters = log;
		//}
		
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.maxRounds = max_rounds;
		this.log = log;
        this.total = 0;
		this.opponentValues = []; 
		this.itemTypesCount = counts.length;
		this.itemsCount = 0;
		this.names = ["Book", "Hat ", "Ball"];
        for (let i = 0; i < this.itemTypesCount; i++){
            this.total += counts[i] * values[i];
			this.itemsCount += counts[i];
			if (i > this.names.length) {
				this.names[i] = "";
			}
		}
        for (let i = 0; i < this.itemTypesCount; i++){
            this.opponentValues[i] = 0;
		}
		
		this.minAcceptPart = 0.56;
		this.maxAcceptPart = 1.00;
		this.minOpponentCost = 0.15;
		this.maxOpponentCost = 0.85;
		
		//Перестраховываемся, чтобы на конкурсе внезапно что-то не передали шестым параметром (Зачем? Загадка.) и бот не сломался.
		parameters = undefined;
		
		//Если запущено локально и передан параметр настроек
		if (parameters != undefined) {
			this.minAcceptPart = parameters.myMin;
			this.maxAcceptPart = parameters.myMax;
			this.minOpponentCost = parameters.oppMin;
			this.maxOpponentCost = parameters.oppMax;
			this.log(JSON.stringify(parameters));
		}
		
		//Отключаем логирование
		this.log  = function(){}; 
    }
	
    offer(opponentOffer){		
		let myOffer = undefined;
		let roundsPassed = this.maxRounds - this.rounds;
		let roundsK = ((this.rounds - 1) / (this.maxRounds - 1));
		let acceptPartSize = this.minAcceptPart + (this.maxAcceptPart - this.minAcceptPart) * roundsK;
		let acceptOpponentPartSize = this.maxOpponentCost - (this.maxOpponentCost - this.minOpponentCost) * roundsK;
		let opponentWantsAll = false;
		
		let opponentOfferSum = 0;
		let kData = [];
		let opponentValuesKSumm = 0;
		
		//Уменьшаем значение ценности каждой вещи для оппонента.
		for (let i = 0; i < this.itemTypesCount; i++) {
			this.opponentValues[i] = Math.max(0, this.opponentValues[i] - 0.5);
		}
		
		//
		
		//Если есть предложение от оппонента - считаем сумму которую получаем мы и увеличиваем показатель ценности этих вещей для оппонента.
		if (opponentOffer) {
			opponentWantsAll = true;
			for (let i = 0; i < this.itemTypesCount; i++) {
				if (opponentOffer[i] > 0){
					opponentWantsAll = false;
				}
			}
			if (!opponentWantsAll) {
				for (let i = 0; i < this.itemTypesCount; i++) {
					opponentOfferSum += this.values[i] * opponentOffer[i];
					this.opponentValues[i] += (this.counts[i] - opponentOffer[i]) / this.counts[i];
					opponentValuesKSumm += this.opponentValues[i];
				}			
			}
		}
			
		//Если сумма которую мы получим от предложения оппонента нас устраивает - принимаем его.
		if (opponentOfferSum >= this.total * acceptPartSize) {
			return myOffer;
		}
		
		//По ценности вещей для оппонента считаем коэффициент каждой вещи
		//this.log("Ценность вещей для оппонента/меня и соотношение:");
		for (let i = 0; i < this.itemTypesCount; i++) {
			var opponentK = opponentValuesKSumm == 0 ? (1.0 / this.itemsCount) : this.opponentValues[i] / opponentValuesKSumm;
			var myK = ((0.9 / this.itemsCount) + this.values[i]) / (this.total + 0.9);
			var k = 0;
			if (myK == 0) {
				if (opponentK == 0) {
					k = 1;
				}else{
					k = 10;
				}
			}else{
				if (opponentK == 0) {
					k = -10;
				}else {
					k = opponentK / myK;
				}
			}
			kData[i] = { 
				index: i, 
				value: k,
				opponentK: opponentK,
				myK: myK
			};
			//this.log(opponentK.toFixed(2) + "/" + myK.toFixed(2) + "/" + k.toFixed(2));
		}
		
		kData.sort(function(a, b) {
			if (a.value > b.value) {
				return 1;
			}
			if (a.value < b.value) {
				return -1;
			}
			return 0;
		});
		
		let totalOpponentK = 0;
		for(let i = 0; i < this.itemTypesCount; i++) {
			let index = kData[i].index;
			totalOpponentK += kData[i].opponentK * this.counts[index];
			this.log(this.names[index] + ": " + kData[i].opponentK.toFixed(2) + "/" + this.counts[index]);
		}
		this.log(totalOpponentK);
		
		//Подготавливаем наше предложение для оппонента
		//Идём от того, что мы всё отдаём оппоненту
		myOffer = [];
		for (let i = 0; i < this.itemTypesCount; i++) {
			myOffer[i] = 0;
		}
		var myOfferOpponentCost = 1.0;
		var myOfferMyCost = 0;
		
		//Если сумма значимости вещеё для оппонента нулевая - сбрасываем её в еденицу, чтобы избежать ошибки деления на ноль.
		totalOpponentK = totalOpponentK == 0 ? 1 : totalOpponentK;
		for (let i = 0; i < kData.length; i++)
		{
			let currentData = kData[i];
			let index = kData[i].index;
			for (let j = 0; j < this.counts[index]; j++) {
				let newOpponentCost = myOfferOpponentCost - currentData.opponentK / totalOpponentK;
				
				if (newOpponentCost >= acceptOpponentPartSize || myOfferMyCost <= acceptPartSize) {
					myOfferOpponentCost = newOpponentCost;
					myOfferMyCost += currentData.myK;
					myOffer[index]++;
					this.log("Наша часть: " + myOfferMyCost.toFixed(2) + "/" + acceptPartSize.toFixed(2));
					this.log("Их   часть: " + myOfferOpponentCost.toFixed(2) + "/" + acceptOpponentPartSize.toFixed(2));
				}
			}			
		}	
        this.rounds--;
        //Проверяем - не пытаемся-ли мы предложить то-же самое?	
		if (opponentOffer) {
			let sameOffer = true;
			for (let i = 0; i < this.itemTypesCount; i++) {
				if (opponentOffer[i] != myOffer[i]) {
					sameOffer = false;
					break;
				}
			}
			//Если мы пытаемся предложитьв ответ тоже-самое, то просто принимаем оффер оппонента.
			if (sameOffer) {
				myOffer = undefined;
			}
		}
		//this.log("Наша часть: " + myOfferMyCost.toFixed(2) + "/" + acceptPartSize.toFixed(2));
		//this.log("Их   часть: " + myOfferOpponentCost.toFixed(2) + "/" + acceptOpponentPartSize.toFixed(2));
		return myOffer;
    }
};
