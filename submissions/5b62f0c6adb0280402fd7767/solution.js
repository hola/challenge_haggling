'use strict';
/**
 * Краткое описание
 * 
 * 1. Инициализация.
 * 1.1. На основе входящих данных происходит генерация всех возможных исходящих предложений, расчет их ст-ти, группировка и сортировка по стоимости
 * 1.2. Для каждого исходящего предложения устанавливаютя признаки:
 *    active - если стоимость больше нуля
 *    offered - для последующей отметки запрошенных
 *    double - если предложение имеет такую же ст-ть, как другое, но запрашиваемое количество товаров больше
 * 1.3. Устанавливается нижний порог ст-ти для исходящих предложений (равен 5)
 * 1.4. Устанавливаются начальные к-ты потребности оппонента в каждой позиции товара на основе количества
 * 1.4. Устанавливается принимаемая стоимость входящего предложения (равна 7)
 * 
 * 2. Торговля (при поступлении каждого входящего предложения)
 * 2.1. Получаем ст-ть входящего предложения, сравниваем с принимаемой ст-тью. Если удовлетворяет, то принимаем. Иначе запоминаем это предложение, его ст-ть и
 * обновляем к-ты потребности оппонента
 * 2.2. Формируем исходящее предложение с самой приоритетной для нас позицией (краткий алгоритм ниже), сравниваем с принимаемой ст-тью. Если ст-ть исходящего 
 * предложения оказалась ниже принимаемой ст-ти, то понижаем принимаемую ст-ть, ищем среди входящих предложений - не поступало ли с удовлетворяющей нас ст-тью.
 * Если находим, то отправляем из входящих предложений, если нет, то отправляем наше исходящее предложение.
 * 2.3. Если это раунд, в котором возможен последний запрос, то отправляем самое выгодное предложение из ранее входящих
 * 
 * Алгоритм формирования предложений
 * 3.1. Определяются к-ты потребности оппонента в каждой позиции товара (чем чаще и больше запрашивается определенная позиция, тем выше к-нт)
 * 3.2. Определяется к-во возможных исходящих предложений и групп ст-ти на их основе. Если возможных предложений меньше, чем вариантов ст-ти предложений,
 * то соседние варианты собираются в одну группу. Если больше, то создаются группы с одинаковой ст-тью
 * 3.3. Все исходящие предложения сортируютя по к-там потребности. Ищется позиция со стоимостью из первой группы стоимости и возвращается
  */

class OfferCostReq {
    constructor(offersCost = [], countReqs = 0) {
        this._offersCost = offersCost;
        this._countReqs = countReqs;
        this.offerCost = offersCost[0];
    }

    markOffered() {
        this._countReqs--;
        if (this._countReqs === 0) {
            this._offersCost.forEach(offerCost => offerCost.offered = true);
        } else {
            this.offerCost.offered = true;
        }
    }
}

class OffersGroup {
    constructor(count, price, inversSort = false) {
        
        // нижняя граница стоимости предложения для распределения количества запросов по ценам
        this._COST_LOW = 5;
        
        this._count = count;
        this._offersCost = [];
        this._offersGroupCost = [];
        this._inversSort = inversSort;

        if (price !== undefined) {
            // create all offers and costs
            for (let i = count[0]; i >= 0; i--) {
                for (let j = count[1]; j >= 0; j--) {
                    for (let k = count[2]; k >= 0; k--) {
                        if (i === count[0] && j === count[1] && k === count[2] || i === 0 && j === 0 && k === 0) {
                            continue;
                        }
                        let offer = [i, j, k];
                        let cost = price[0] * offer[0] + price[1] * offer[1] + price[2] * offer[2];
                        let offerInv = count.map((v, i) => v - offer[i]);
                        let offerCost = {cost, offer, offerInv, actual: cost > 0, double: false, offered: false};
                        this._offersCost.push(offerCost);
                        
                        let offerGroupCost = this._offersGroupCost.find(v => v.cost === cost);
                        if (offerGroupCost === undefined) {
                            offerGroupCost = {cost, offersCost: []};
                            this._offersGroupCost.push(offerGroupCost);
                        }
                        offerGroupCost.offersCost.push(offerCost);
                    }
                }
            }
            this._offersCost.sort((a, b) => b.cost - a.cost);
            this._offersGroupCost.sort((a, b) => b.cost - a.cost);


            // определение дублей - разных предложений с одинаковой для нас ст-тью
            if (price.includes(0)) {
                let priceNorm = price.map(v => v === 0 ? 0 : 1);
                for (let offerGroupCost of this._offersGroupCost) {
                    
                    let offersCostFiltered = [];
                    for (let offerCost of offerGroupCost.offersCost) {
                        let offerNorm = offerCost.offer.map((v, i) => v * priceNorm[i]);
                        let offerCostfiltered = offersCostFiltered.find(offerCostfiltered => offerCostfiltered.key.every((v, i) => v === offerNorm[i]));
                        if (offerCostfiltered === undefined) {
                            offerCostfiltered = {key: offerNorm, offersCost: []};
                            offersCostFiltered.push(offerCostfiltered);
                        }
                        offerCostfiltered.offersCost.push(offerCost);
                        offerCost.double = true;
                    }
                    //для каждой позиции нуля найдем минимальные значения, это значения которые будут использоваться для предложений
                    for (let offerCostfiltered of offersCostFiltered) {
                        for (let i = 0; i < priceNorm.length; i++) {
                            if (priceNorm[i] === 0) {
                                let offerCost = offerCostfiltered.offersCost.reduce((a, b) => a.offer[i] < b.offer[i] ? a : b);
                                offerCost.double = false;
                            }
                        }
                    }
                }
            }
        }
    }

    _getReqStage(filter) {
        
        let reqStage = {countCosts: 0, countOffers: 0, countOffersDouble: 0, costsList: [], offersCost: []};
        for (let offerGroupCost of this._offersGroupCost) {
            let offersCost = offerGroupCost.offersCost.filter(filter);
            let countOffers = offersCost.filter(v => !v.double).length;
            
            if (offersCost.length > 0 && offersCost.some(v => !v.double)) {
                reqStage.costsList.push({cost: offerGroupCost.cost, countOffers, countOffersDouble: offersCost.length - countOffers});
                reqStage.countOffers += countOffers;
                reqStage.countOffersDouble += offersCost.length - countOffers;
                reqStage.countCosts++;
                reqStage.offersCost.push(...offersCost);
            }
        }
        return reqStage;
    }


    getNextOfferCostReq(offerRates, countRequests) {

        let reqStage;
        for (let costLow = this._COST_LOW; costLow > 0; costLow--) {
            reqStage = this._getReqStage(v => v.actual && !v.offered && v.cost >= costLow);
            if (reqStage.countOffers + reqStage.countOffersDouble >= countRequests) {
                break;
            }
        }

        if (reqStage.countOffers === 0) {
            // пустой запрос
            let offerCostReq = new OfferCostReq();
            return offerCostReq;
        }

        let costsGroup = [];
        if (countRequests <= reqStage.countCosts) {
            // предолжений меньше или равно, чем существует вариантов cost
            // сборка cost в группы
            let remCountRequests = countRequests;
            let remCountCosts = reqStage.countCosts;

            for (let iReq = 0; iReq < countRequests; iReq++) {
                let countCostsInGroup = Math.ceil(remCountCosts / remCountRequests);
                let costGroup = {costs: [], countReqs: 1};
                costsGroup.push(costGroup);
                
                for (let j = 0; j < countCostsInGroup; j++) {
                    costGroup.costs.push(reqStage.costsList[remCountCosts - 1].cost);
                    remCountCosts--;
                }
                remCountRequests--;
            }
            costsGroup.reverse();


        } else {
            // предложений больше, чем cost
            let remCountRequests = countRequests;
            for (let costListElem of reqStage.costsList) {
                costsGroup.push({costs: [costListElem.cost], countReqs: 1});
                remCountRequests--;
            }
            
            for (let [i, costListElem] of reqStage.costsList.entries()) {
                for (let j = 0; j < costListElem.countOffers - 1 && remCountRequests > 0; j++) {
                    costsGroup[i].countReqs++;
                    remCountRequests--;
                }
                for (let j = 0; j < costListElem.countOffersDouble && remCountRequests > 0; j++) {
                    costsGroup[i].countReqs++;
                    remCountRequests--;
                }
            }
        }

        // убрать лишние double по наборам costs, где нет лишних запросов
        let offersCost = reqStage.offersCost.filter(offerCost => {
            if (offerCost.double) {
                let costList = reqStage.costsList.find(v => v.cost === offerCost.cost);
                let costGroup = costsGroup.find(v => v.costs.includes(offerCost.cost));
                return costGroup.countReqs > costList.countOffers;
            }
            return true;
        });

        // здесь сортируем по к-там и определяем самый приоритетный offerCost
        let costGroup = costsGroup[0];
        let offersCostSort = offerRates.sortOffersCost(offersCost, this._inversSort);

        // после сортировки оставить только по первой costsGroup 
        // и убрать лишние double до количества запросов по наборам costs
        let costList = reqStage.costsList.find(v => costGroup.costs.includes(v.cost));
        let countDoublesDel = costGroup.countReqs > costList.countOffers ? costList.countOffers + costList.countOffersDouble - costGroup.countReqs : 0;
        let offersCostFiltred = offersCostSort.filter((offerCost, i) => costGroup.costs.includes(offerCost.cost) && i >= countDoublesDel);
        let offerCostReq = new OfferCostReq(offersCostFiltred, costGroup.countReqs);
        return offerCostReq;
    }

    set(cost, offer) {
        
        let offerInv = this._count.map((v, i) => v - offer[i]);
        let offerCost = {cost, offer, offerInv, actual: cost > 0, double: false, offered: false};
        this._offersCost.push(offerCost);
        
        let offerGroupCost = this._offersGroupCost.find(v => v.cost === cost);
        if (offerGroupCost === undefined) {
            offerGroupCost = {cost, offersCost: []};
            this._offersGroupCost.push(offerGroupCost);
        }
        offerGroupCost.offersCost.push(offerCost);

        this._offersCost.sort((a, b) => b.cost - a.cost);
        this._offersGroupCost.sort((a, b) => b.cost - a.cost);
    
        return offerCost;
    }

    findCost(offer) {
        let offerCost = this._offersCost.find(offerCost => offerCost.offer.every((v, i) => v === offer[i]));
        return offerCost && offerCost.cost;
    }

    findOfferCost(offer) {
        let offerCost = this._offersCost.find(offerCost => offerCost.offer.every((v, i) => v === offer[i]));
        return offerCost;
    }

    resetOffered() {
        this._offersCost.forEach(offerCost => offerCost.offered = false);
    }

}

class OfferRates {
    constructor (count) {
        this._count = count;
        this._wts = count.map(v => v / 1000);
        this._flRounds = count.map(() => true);
    }

    update(offer, roundDown) {
        // установка весовых к-тов
        // каждая предложенная еденица товара имеет вес 0.01
        // для каждой позиции добавляется к-т соответствующий общему количеству товаров в позиции, по 0.001
        // каждый ход так же имеет весовой к-нт от 0.0005 до 0
        let offerInv = this._count.map((v, i) => v - offer[i]);
        // this._wts = this._wts.map((v, i) => v + offerInv[i] / 100 + (offerInv[i] && this._flRounds[i] ? roundDown / 10000 : 0));
        this._wts = this._wts.map((v, i) => v + Math.ceil(offerInv[i] / this._count[i] * 100) / 100 + (offerInv[i] && this._flRounds[i] ? roundDown / 10000 : 0));
        this._wts = this._wts.map(v => Math.ceil(v * 10000) / 10000);
        offerInv.forEach((v, i) => v && (this._flRounds[i] = false));
    }

    sortOffersCost(offersCost, inversSort) {
        let indWts = this._wts.map((v, i) => ({v, i})).sort((a, b) => b.v - a.v);
        
        let offersCostSort = offersCost.map(offerCost => offerCost).sort((a, b) => {
            for (let i = 0; i < a.offerInv.length; i++) {
                let aValue = a.offerInv[indWts[i].i];
                let bValue = b.offerInv[indWts[i].i];
                
                if (a.double && !b.double) {
                    return -1;
                } else if (!a.double && b.double){
                    return 1;
                
                } else if (aValue !== bValue) {
                    if (a.double && b.double) {
                        return aValue - bValue ;
                    } else if (!a.double && !b.double) {
                        return bValue - aValue;
                    }
                }
            }
            return 0;
        });

        if (inversSort) {
            offersCostSort.reverse();
        }

        return offersCostSort;
    }
}

class Trader {
    constructor(me = 0, count = [1,1,1], price = [0,0,10], maxRounds = 5) {
        
        this._me = me;
        this._count = count;
        this._price = price;
        this._maxRounds = maxRounds;
        this._round = 0;
        this._offerRates = new OfferRates(count);
        this._acceptableCost = 7;

        this._offersGroup = new OffersGroup(count, price);
        this._inOffersGroup = new OffersGroup(count, undefined, true);
    }
    
    offer(inOffer) {
        this._round++;
        // let countReqs = this._maxRounds - this._round - this._me;
        let countReqs = this._maxRounds - this._round;

        let cost = 0;

        // есть товары предлагаемые нам
        if (inOffer !== undefined && this._offersGroup.findOfferCost(inOffer) !== undefined) {
            // стоимость предложения для нас
            cost = this._offersGroup.findCost(inOffer);
            // если такого предложжения еще не было
            if (this._inOffersGroup.findCost(inOffer) === undefined) {

                // обновление весовых к-тов
                this._offerRates.update(inOffer, this._maxRounds - this._round + 1);
                // запомним все входящие предложения
                this._inOffersGroup.set(cost, inOffer);
                
                // соответствующее наше пометим, как запрошенное
                let offerCostMark = this._offersGroup.findOfferCost(inOffer);
                offerCostMark.offered = true;
            }

            if (cost >= this._acceptableCost) {
                // принимаем текущее предложение
                return undefined;
            }
        }
        
        // предложение для запроса с максимальной ценой из входящих
        let inOfferCostReq = this._inOffersGroup.getNextOfferCostReq(this._offerRates, 1);

        // Если это последний ход, то запрашиваем из ранее предложенных нам
        // if (this._maxRounds - this._round - this._me === 0) {
        // if (this._maxRounds - this._round - this._me === 0 && this._me === 0) {
        if (countReqs === 0 && this._me !== 1) {
            
            // может и не быть (поступали с нулевой ст-тью или все запрашивались)
            if (inOfferCostReq.offerCost !== undefined) {
                
                if (cost >= inOfferCostReq.offerCost.cost) {
                    // принимаем текущее предложение
                    return undefined;
                }
                
                inOfferCostReq.offerCost.offered = true;

                // соответствующее наше тоже пометим
                let offerCostMark = this._offersGroup.findOfferCost(inOfferCostReq.offerCost.offer);
                offerCostMark.offered = true;
                
                return inOfferCostReq.offerCost.offer;
            }
            

        } else if (this._round === this._maxRounds) {
            // можем только согласиться, если есть ценность
            if (cost > 0) {
                return undefined;
            } else {
                return this._count;
            }
        }

        // получим исходящее предложение для запроса с максимальной ценой
        // let offerCostReq = this._offersGroup.getNextOfferCostReq(this._offerRates, (this._maxRounds - this._round - this._me) || 1);
        let offerCostReq = this._offersGroup.getNextOfferCostReq(this._offerRates, countReqs || 1);
        if (offerCostReq.offerCost === undefined) {
            // не осталось вариантов исходящих предложений (все запросили)
            // начнем с начала
            this._offersGroup.resetOffered();
            // offerCostReq = this._offersGroup.getNextOfferCostReq(this._offerRates, (this._maxRounds - this._round - this._me) || 1);
            offerCostReq = this._offersGroup.getNextOfferCostReq(this._offerRates, countReqs || 1);
        }

        // сравним с максимальной ценой из входящих
        if (inOfferCostReq.offerCost !== undefined && inOfferCostReq.offerCost.cost >= offerCostReq.offerCost.cost) {
            // было предложено с более высокой ценой, чем текущее исходящее
            this._acceptableCost = inOfferCostReq.offerCost.cost;
            
            if (cost >= this._acceptableCost) {
                // принимаем текущее предложение
                return undefined;
            }
           
            inOfferCostReq.offerCost.offered = true;

            // соответствующее наше тоже пометим
            let offerCostMark = this._offersGroup.findOfferCost(inOfferCostReq.offerCost.offer);
            offerCostMark.offered = true;
            
            return inOfferCostReq.offerCost.offer;
        }

        
        // сравним со стоимостью принимаемого
        if (offerCostReq.offerCost.cost < this._acceptableCost) {
            this._acceptableCost = offerCostReq.offerCost.cost;
            
            if (cost >= this._acceptableCost) {
                // принимаем текущее предложение
                return undefined;
            }
            
            // проверяем не поступало ли предложение входящее в новую границу допустимого
            if (inOfferCostReq.offerCost !== undefined && inOfferCostReq.offerCost.cost >= this._acceptableCost) {
                
                // возможно оппонент и не примет, то что предлагал ранее, поэтому пометим, что бы больше не использовать
                inOfferCostReq.offerCost.offered = true;

                // соответствующее наше тоже пометим
                let offerCostMark = this._offersGroup.findOfferCost(inOfferCostReq.offerCost.offer);
                offerCostMark.offered = true;
            
                return inOfferCostReq.offerCost.offer;
            }
        }

        offerCostReq.markOffered();
        return offerCostReq.offerCost.offer;
    }
}

module.exports = Trader;
