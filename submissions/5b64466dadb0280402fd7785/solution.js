"use strict";
const logOn = true;
class Bot {
    constructor(isMyStartTurn, // 0, если ваша очередь первая, или 1, если вторая.
    counts, // массив целых чисел, содержащий количество объектов каждого типа. Он содержит от 2 до 10 элементов.
    values, // массив целых чисел такой же длины, что и counts, описывающий ценность объекта каждого из типов для вас.
    maxRounds, // число раундов переговоров (каждый раунд состоит из двух реплик).
    log // функция, которую можно вызывать для отладочного вывода (console.log работать не будет).
    ) {
        this.isMyStartTurn = isMyStartTurn;
        this.counts = counts;
        this.values = values;
        this.maxRounds = maxRounds;
        this.log = log;
        this.Counter = 0;
        if (logOn) {
            this.log(`{
                isMyStartTurn: ${this.isMyStartTurn === 0},
                counts: ${JSON.stringify(this.counts)}, 
                values: ${JSON.stringify(this.values)}, 
                maxRounds: ${this.maxRounds}
            }`);
        }
        this.Strategy = new Strategy(isMyStartTurn, counts, values, maxRounds, log);
    }
    offer(offerIn) {
        this.log(this.Counter);
        this.Counter++;
        let myOffer = this.Strategy.GetCounterOffer(offerIn);
        if (myOffer !== undefined) {
            this.log(`My offer: ${myOffer.join(",")}`);
        }
        else {
            if (offerIn !== undefined) {
                this.log(`I agree for offer: ${offerIn.join(",")}`);
            }
        }
        return myOffer;
    }
}
class Strategy {
    constructor(isMyStartTurn, counts, prices, maxRounds, log) {
        this.ItemTypes = [];
        this.Items = [];
        this.OffersLog = [];
        this.CurrentTurn = 0;
        this.MaxPrice = 0;
        this.Log = log;
        this.IsMyStartTurn = isMyStartTurn === 0;
        this.AllItems = counts;
        this.MaxTurns = maxRounds * 2;
        this.GenerateTypes(counts, prices);
        this.GenerateItems();
        if (this.IsMyStartTurn) {
            this.CurrentTurn = -1;
        }
    }
    maxThresholdCoeffInTurn() {
        let initialThreshold = 0.85; // 85
        if (this.CurrentTurn === 1 && !this.IsMyStartTurn) {
            return initialThreshold;
        }
        else if (this.CurrentTurn === this.MaxTurns - 1 && this.IsMyStartTurn) {
            return initialThreshold - 0.55;
        }
        else if (this.CurrentTurn === this.MaxTurns && !this.IsMyStartTurn) {
            return initialThreshold - 0.65; // 65
        }
        else {
            let borderSize = 0.19;
            let stepSize = borderSize / this.MaxTurns;
            let finalSize = stepSize * this.CurrentTurn;
            return initialThreshold - finalSize;
        }
    }
    itemsToOfferOut(items, ignoreExcluded = false) {
        let result = this.getInitResult();
        for (let item of items) {
            if (!item.IsExcluded || ignoreExcluded) {
                result[item.Type]++;
            }
        }
        return result;
    }
    getCurrentOfferPrice(offerIn) {
        let offerPrice = 0;
        for (let i = 0; i < this.ItemTypes.length; i++) {
            offerPrice += offerIn[i] * this.ItemTypes[i].Price;
        }
        return offerPrice;
    }
    getInitResult() {
        let result = [];
        for (let i = 0; i < this.ItemTypes.length; i++) {
            result[i] = 0;
        }
        return result;
    }
    isLogSimilar() {
        let strings = [];
        for (let log of this.OffersLog) {
            strings.push(log.Offer.join(","));
        }
        for (let i = 0; i < strings.length - 1; i++) {
            if (strings[i] !== strings[i + 1]) {
                return false;
            }
        }
        return true;
    }
    GetCounterOffer(offerIn) {
        this.CurrentTurn += 2;
        this.Log(`Situation. Current turn: ${this.CurrentTurn}, is my start turn: ${this.IsMyStartTurn}`);
        let currentOfferPrice = 0;
        let turnOptimalPrice = this.MaxPrice * this.maxThresholdCoeffInTurn();
        if (offerIn !== undefined) {
            currentOfferPrice = this.getCurrentOfferPrice(offerIn);
            this.OffersLog.push(new OfferLog(offerIn, currentOfferPrice));
            this.Log(`Current offer price: ${currentOfferPrice}`);
            this.Log(`Current offer: ${offerIn.join(";")}`);
            this.Log(`Current optimal price: ${this.MaxPrice * this.maxThresholdCoeffInTurn()}`);
        }
        // TODO: если предлагаю тоже самое - то соглашаться, если не то же самое, но цена та же - соглашаться!!! в любом раунде!
        // Согласие на сделку, если цена 9-10, смысла бодаться дальше нет.
        if (currentOfferPrice >= this.MaxPrice - 1) {
            return undefined; // Макcимальный выигрыш - автоматическое согласие
        }
        let hasSingleBig = false;
        for (let itemType of this.ItemTypes) {
            if (itemType.Price >= this.MaxPrice - 2) {
                hasSingleBig = true;
            }
        }
        if (this.CurrentTurn <= 2) {
            if (hasSingleBig) {
                this.Items.sort((a, b) => a.Price - b.Price);
                return this.itemsToOfferOut([this.Items[this.Items.length - 1]], true);
            }
        }
        let finalTurn = this.CurrentTurn === this.MaxTurns && !this.IsMyStartTurn;
        let lastOfferСhance = this.CurrentTurn === this.MaxTurns - 1 && this.IsMyStartTurn;
        if ((lastOfferСhance || finalTurn) && this.isLogSimilar()) {
            if (currentOfferPrice > 0) {
                return undefined;
            }
        }
        if (lastOfferСhance) {
            this.OffersLog.sort((a, b) => a.Price - b.Price);
            for (let lg of this.OffersLog) {
                this.Log(`Массив цен логов: ${lg.Offer.join(",")}; цена: ${lg.Price}`);
            }
            let offerOut = this.OffersLog[this.OffersLog.length - 1];
            if (offerOut.Price > currentOfferPrice) {
                this.Log(`Дофинальная сделка (ВЫГОДНА, предлагаем): ${offerOut.Offer.join(",")}; цена: ${offerOut.Price}`);
                return offerOut.Offer;
            }
            else {
                this.Log(`Дофинальная сделка (НЕ ВЫГОДНА, соглашаемся на текущую): ${offerOut.Offer.join(",")}; цена: ${offerOut.Price}`);
                if (offerOut.Price < turnOptimalPrice && currentOfferPrice < turnOptimalPrice) {
                    this.Items.sort((a, b) => a.Price - b.Price);
                    let outArr = [];
                    if (this.Items.length <= 4) {
                        outArr.push(this.Items[this.Items.length - 1]);
                    }
                    if (this.Items.length > 4) {
                        outArr.push(this.Items[this.Items.length - 1]);
                        outArr.push(this.Items[this.Items.length - 2]);
                        outArr.push(this.Items[this.Items.length - 3]);
                    }
                    for (let arrItem of outArr) {
                        arrItem.IsExcluded = false;
                    }
                    return this.itemsToOfferOut(outArr);
                }
            }
        }
        if (currentOfferPrice >= this.MaxPrice * this.maxThresholdCoeffInTurn()) {
            return undefined;
        }
        let itemsToOffer = ItemSortByPrice(this.Items).filter(item => !item.IsExcluded);
        if (this.getCurrentOfferPrice(this.itemsToOfferOut(itemsToOffer)) >= this.MaxPrice * this.maxThresholdCoeffInTurn()) {
            if (itemsToOffer.length > 1) {
                itemsToOffer[0].IsExcluded = true;
            }
        }
        return this.itemsToOfferOut(itemsToOffer);
    }
    GenerateItems() {
        for (let i = 0; i < this.ItemTypes.length; i++) {
            let itemType = this.ItemTypes[i];
            for (let j = 0; j < itemType.Qty; j++) {
                this.Items.push(new Item(itemType.Type, itemType.Price));
                this.MaxPrice += itemType.Price;
            }
        }
        this.Log(`Max price: ${this.MaxPrice}`);
    }
    GenerateTypes(counts, prices) {
        for (let i = 0; i < counts.length; i++) {
            this.ItemTypes.push(new ItemTypeInfo(i, counts[i], prices[i]));
        }
    }
}
function ItemSortByPrice(collection) {
    collection.sort((a, b) => a.Price - b.Price);
    return collection;
}
class OfferLog {
    constructor(offer, price) {
        this.Offer = offer;
        this.Price = price;
    }
}
class Item {
    constructor(type, price) {
        this.Type = type;
        this.Price = price;
        this.IsExcluded = false;
    }
}
class ItemTypeInfo {
    constructor(type, qty, price) {
        this.Type = type;
        this.Qty = qty;
        this.Price = price;
    }
}
module.exports = Bot;
