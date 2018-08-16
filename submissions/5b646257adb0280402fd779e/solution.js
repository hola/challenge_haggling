


module.exports = class {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.me = me;
        this.log = log;
        this.values = values;
        this.maxRounds = max_rounds;

        this.totalCost = this.values.reduce((sum, items, index) => sum + items * this.counts[index], 0);
        this.totalItems = this.counts.reduce((sum, items) => sum + items);
        this.enemyValues = this.counts.map(items => this.totalCost / this.totalItems );
        this.roundsLeft = () => this.maxRounds - this.currentRound + 1;

        this.orderMap = this.getAllTradableVariants();

        //Исключение предложений, которые оставляют себе предметы нулевой стоимости
        this.orderMap = this.orderMap.filter(
            (order) => !order.offer.some((item, itemIndex) => item > 0 && this.values[itemIndex] === 0)
        );
        this.orderMap.sort(sortOrderVariants);

        this.log("Стартовый расклад возможных предложений");
        this.orderMap.forEach((order) => this.log(`${order.offer} = ${order.cost}`));

        // Помечаем самый первый варинт, как последнее сделанное предложение
        this.lastOffer = this.orderMap[0];

        // Абсалютное значение стоимости нашего последнего предлажения для оппонента (на момент предложения)
        this.lastOfferAbsoluteCost = 0;

        this.currentRound = 0;

    }

    getAllTradableVariants() {
        const orderMap = [];

        const firstOder = this.counts.map(() => 0);

        let nextOrder = firstOder.map(number => number);

        do {
            nextOrder = getNextOrder(nextOrder.map(number => number), this.counts);
            if (nextOrder) {
                const orderCost = nextOrder.reduce((sum, itemNumber, itemIndex) => itemNumber * this.values[itemIndex] + sum, 0);

                orderMap.push({
                    offer: nextOrder,
                    cost: orderCost,
                    offerTimes: 0,
                    costForEnemy: nextOrder.reduce((sum, itemNumber, itemIndex) => (this.counts[itemIndex] - itemNumber)* this.values[itemIndex] + sum, 0)
                });
            }
        } while (nextOrder);

        return orderMap;
    }

    getMirrorOffer(offer) {
        return offer.map((offerItems, itemIndex) => this.counts[itemIndex] - offerItems);
    }

    myOffersLeft() {
        return this.me ? this.roundsLeft() - 1 : this.roundsLeft();
    }

    enemyOffersLeft() {
        return this.roundsLeft() - 1;
    }

    //Пересчет стоимости для оппонента
    recalEnemyCosts(o) {
        let lostCost = 0;

        if (this.currentRound > 1) {
            const offerToEnemy = this.getMirrorOffer(this.lastOffer.offer);

            offerToEnemy.forEach((items, index) => {
                if (items > 0) {
                    const lost = this.enemyValues[index] * (0.1 * items);

                    this.enemyValues[index] -= lost;

                    lostCost += lost * this.counts[index];
                }
            });
        }

        o.forEach((items, itemIndex) => {
            const oldEnemyItemCost = this.enemyValues[itemIndex];
            let newEnemyItemCost = oldEnemyItemCost;

            if (items > 0) {
                newEnemyItemCost = newEnemyItemCost / 3;

                this.enemyValues[itemIndex] = newEnemyItemCost;
            }

            lostCost += (oldEnemyItemCost - newEnemyItemCost) * this.counts[itemIndex];

        });

        const notTradableItemsCount = o.reduce((sum, items, itemIndex) => {
            return sum + (this.counts[itemIndex] - items);
        }, 0);

        const addItemsCost = lostCost / notTradableItemsCount;
        let extraCost = 0;
        let notMaxedItems = 0;

        o.forEach((items, itemIndex) => {
            if (items === 0) {
                this.enemyValues[itemIndex] += addItemsCost;
            } else if (this.counts[itemIndex] - items > 0) {
                this.enemyValues[itemIndex] += addItemsCost * (this.counts[itemIndex] - items) / this.counts[itemIndex];
            }

            const maxItemCost = Math.floor(this.totalCost / (this.counts[itemIndex]));

            if (this.enemyValues[itemIndex] > maxItemCost) {
                extraCost += this.counts[itemIndex] * (this.enemyValues[itemIndex] - maxItemCost);
                this.enemyValues[itemIndex] = maxItemCost;
            } else if (this.enemyValues[itemIndex] < 0.4 && items === this.counts[itemIndex]) {
                extraCost += this.counts[itemIndex] * this.enemyValues[itemIndex];
                this.enemyValues[itemIndex] = 0;
            } else {
                notMaxedItems += this.counts[itemIndex];
            }


        });

        if (extraCost > 0) {
            this.counts.forEach((items, itemIndex) => {
                const maxItemCost = Math.floor(this.totalCost / items);

                if (this.enemyValues[itemIndex] < maxItemCost && this.enemyValues[itemIndex] > 0) {
                    this.enemyValues[itemIndex] += extraCost / notMaxedItems;
                    extraCost -= (extraCost / notMaxedItems) * items;
                    notMaxedItems -= items;
                }
            });
        }
    }

    /**
     *
     * @param o
     * @returns {Array|undefined}
     */
    offer(o) {
        this.currentRound++;

        const offerCost = o && getOfferCost(o, this.values);

        let costForEnemy = this.totalCost;

        if (o) {


            this.recalEnemyCosts(o);

            this.log(`Расчетная ценность предметов для оппонента: ${this.enemyValues}`);

            costForEnemy = getOfferCost(this.getMirrorOffer(o), this.enemyValues);

            this.log(`Осталось предложений от оппонента ${this.enemyOffersLeft()}`);

            const minAccept = 2 * this.enemyOffersLeft() + 1 + this.me;

            /*
            const absoluteAcceptCost = Math.round(
                Math.min(minAccept, this.totalCost * (0.3 + 0.1 * this.enemyOffersLeft()))
            );
            */

            let absoluteAcceptCost = 9;
            if (this.enemyOffersLeft() === 0) {
                absoluteAcceptCost = (3 - (this.me * 2))
            }

            const relativeAcceptCost = this.currentRound >= 2
                ? costForEnemy * (1.3 - 0.13 * (this.currentRound))
                : absoluteAcceptCost;

            // Если последний раунд и мы ходим первыми, то будем делать "убер"-предложение
            if (this.currentRound === this.maxRounds && !this.me) {
                absoluteAcceptCost = this.totalCost * 0.8;
            }


            this.log(`Стоимость для меня => ${offerCost}`);
            this.log(`Стоимость для оппонента => ${costForEnemy}`);
            this.log(`Порог принятия по общей стоимости => ${absoluteAcceptCost}`);
            this.log(`Порог принятия по стоимости для оппонета => ${relativeAcceptCost}`);

            const incomingOfferEqulaMyLastOffer = this.lastOffer.cost <= offerCost;

            this.log(`Предложение не хуже нашего прошлого => ${incomingOfferEqulaMyLastOffer}`);

            if ( incomingOfferEqulaMyLastOffer ||
                offerCost >= absoluteAcceptCost
                || (this.currentRound > 1 && offerCost >= relativeAcceptCost)
            ) {
                //Принимаем предложение
                return undefined;
            }
        }


        //Пересчет стоимости предложений для оопнента в таблице
        this.orderMap.forEach((order) => {
            order.costForEnemy = order.offer.reduce((sum, items, itemIndex) => {
                return (this.counts[itemIndex] - items) * this.enemyValues[itemIndex] + sum;
            }, 0)
        });
        this.orderMap.sort(sortOrderVariants); //Пересортировка предложений в таблице

        let offer = null;

        if (this.currentRound === 1) {
            this.lastOffer = this.orderMap[0];
        }

        const lastRelativeCost = Math.ceil(this.lastOffer.costForEnemy / this.lastOffer.cost * 10);
        const mostCostEnemyItemPrice = Math.max(...this.enemyValues);

        this.log(`Наших предложений осталось: ${this.myOffersLeft()}`);

        const minOfferCost = this.myOffersLeft();

        this.log(`Стоимость нашего последнего предложения для оппонента: ${this.lastOfferAbsoluteCost}`);

        //Перебор таблицы вариантов
        for (let i = 0; i < this.orderMap.length && !offer; i++) {
            const relativeCost = Math.ceil(this.orderMap[i].costForEnemy / this.orderMap[i].cost * 10);
            const itemsInHands = this.orderMap[i].offer.reduce((sum, items) => sum + items);

            this.log(`${this.orderMap[i].offer}; ${this.orderMap[i].costForEnemy} / ${this.orderMap[i].cost} = ${relativeCost}`);

            const canRepeat = itemsInHands <= (this.myOffersLeft());

            const alreadyGivvenOffer = this.orderMap[i].offerTimes > 0;
            const offerHaveCostForEnemy = relativeCost > 0;
//            const currentRelativeCostMoreThanLastOffer = (relativeCost > lastRelativeCost) || (this.orderMap[i] === this.lastOffer);
            const currentRelativeCostMoreThanLastOffer = (this.orderMap[i].costForEnemy > this.lastOffer.costForEnemy) || (this.orderMap[i] === this.lastOffer);
            const offerCostForMeMoreThanMinLevel = this.orderMap[i].cost >= minOfferCost;

            // Если последний раунд и мы ходим первыми, то будем делать "убер"-предложение
            const ubberOffer = this.currentRound === this.maxRounds && !this.me
                && this.orderMap[i].costForEnemy >= 3;
            const giveMoreCostForEnemy = mostCostEnemyItemPrice <= 4.5 || this.orderMap[i].costForEnemy >= mostCostEnemyItemPrice;

            this.log(`${ubberOffer} || (${!alreadyGivvenOffer} || ${canRepeat}) && ${giveMoreCostForEnemy} && ${offerHaveCostForEnemy} ${currentRelativeCostMoreThanLastOffer} ${offerCostForMeMoreThanMinLevel}`);

            if (

               ubberOffer ||
                (!alreadyGivvenOffer || canRepeat)
                && giveMoreCostForEnemy
                && offerHaveCostForEnemy
                && currentRelativeCostMoreThanLastOffer
                && offerCostForMeMoreThanMinLevel
            ) {
                offer = this.orderMap[i];
            }
        }

        if (!offer) {
            this.log("repeat last offer");
            offer = this.lastOffer;
        }

        const wantDoSameOffer = (offerCost >= offer.cost)/*o && offer.offer.reduce((res, items, itemIndex) => res && items === o[itemIndex], true)*/;

        if (wantDoSameOffer/* || (o && this.lastOffer.costForEnemy >= costForEnemy)*/) {
            this.log(`Выбранное предложение стоит ${offer.cost}, а предложение противника ${offerCost}`);
            this.log("Accept!");
            return undefined;
        }

        this.log("Делаем предложение");
        this.log(`Для нас ${offer.cost}, для оппонента ${offer.costForEnemy}`);

        this.lastOffer = offer;
        this.lastOfferAbsoluteCost = this.lastOffer.costForEnemy;

        offer.offerTimes++;

        return offer.offer;
    }
};


//Функция для получения комбинаций офферов
function getNextOrder(current, counts) {
    current[0]++;
    for (let i = 0; i < counts.length; i++) {
        if (current[i] > counts[i]) {
            current[i] = 0;
            if (i + 1 >= counts.length) {
                return;
            }
            current[i + 1]++;
        }
    }

    return current.map(number => number );
}

//Фнукци для пересортировки вариантов предложений
function sortOrderVariants(a, b) {
    const aCost = a.cost;
    const bCost = b.cost;

    if (aCost === bCost) {
        return b.costForEnemy - a.costForEnemy
    }

    return bCost - aCost;
}


// Получаем стоимость офера по казаным ценам
function getOfferCost(offer, values) {
    return offer.reduce((sum, items, itemIndex) => sum + items * values[itemIndex], 0);
}
