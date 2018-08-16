/* common */
const sum = (value1, value2) =>
    value1 + value2;

/* offer */
const isEqualTo = offer1 => offer2 =>
    offer1.every(
        (count1, index) => count1 === offer2[index]
    );

const calcAmount = counts =>
    counts.reduce(sum, 0);

const calcValue = (counts = [], values) =>
    counts.reduce(
        (totalValue, count, index) =>
            totalValue + values[index] * count,
        0
    );

const isBetter = (offer1, offer2, values) =>
    calcValue(offer1, values) > calcValue(offer2, values);

const bestOffer = (offer1, offer2, values) =>
    isBetter(offer2, offer1, values)
        ? offer2
        : offer1;

const isValuable = ({ value }) =>
    value > 0;

const byValueDesc = (item1, item2) =>
    item2.value - item1.value;

const byAmountAsc = (offer1, offer2) => {
    const amount1 = calcAmount(offer1);
    const amount2 = calcAmount(offer2);

    return amount1 - amount2;
}

const getItemsSorted = (values, counts) =>
    values
        .map(
            (value, index) => ({
                value,
                index,
                amount: counts[index]
            })
        )
        .filter(isValuable)
        .sort(byValueDesc);

const takeFirst = (items, n) => {
    let restAmount = n;

    return items.reduce(
        (taken, item) => {
            if (restAmount === 0)
                return taken;

            const { value, amount, index } = item;
            const takenAmount = Math.min(restAmount, amount);
            restAmount -= takenAmount;

            return taken.concat([{
                value,
                amount: takenAmount,
                index
            }]);
        }, []
    );
};

const extractValue = ({ value, amount}) =>
    value * amount;

const getOfferOptions = (desiredValue, totalValue, items, itemsCount) => {
    if (desiredValue === 0)
        return [
            new Array(itemsCount).fill(0)
        ];

    if (desiredValue > totalValue)
        return [];

    const { value, amount, index } = items[0];
    const maxAmount = Math.floor(desiredValue / value);
    const availableAmount = Math.min(maxAmount, amount);
    const restTotalValue = totalValue - value * amount;
    const restItems = items.slice(1);

    return new Array(availableAmount + 1).fill(0)
        .map((_, count) => {
            const additionalValue = value * count;
            const restDesiredValue = desiredValue - additionalValue;

            return getOfferOptions(restDesiredValue, restTotalValue, restItems, itemsCount)
                .map(
                    option => {
                        option[index] = count;

                        return option;
                    }
                );
        })
        .reduce(
            (options, part) => options.concat(part),
            []
        );
};

class Solution {
    constructor(me, counts, values, max_rounds) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.movesLeft = max_rounds;

        this.prevOffers = [];
        this.bestOffer = undefined;
        this.desiredValue = 0;
        this.options = [];
    }

    get firstOffer() {
        return this.prevOffers[0];
    }

    get lastOffer() {
        return this.prevOffers[this.prevOffers.length - 1];
    }

    set lastOffer(offer) {
        const { lastOffer } = this;
        const isOldOffer = lastOffer && isEqualTo(lastOffer)(offer);

        if (!isOldOffer)
            this.prevOffers.push(offer);
    }

    offer(offer) {
        this.storeBestOffer(offer);

        const counterOffer = this.prepareOffer();
        const offerValue = calcValue(offer, this.values);
        const counterOfferValue = calcValue(counterOffer, this.values);
        if (counterOfferValue > offerValue) {
            this.lastOffer = counterOffer;

            return this.lastOffer;
        }

        if (offerValue === 0)
            return this.prepareFirstOffer();

        return undefined;
    }

    storeBestOffer(offer) {
        this.bestOffer = bestOffer(this.bestOffer, offer, this.values);
    }

    prepareOffer() {
        this.movesLeft--;

        if (this.movesLeft === 0)
            return this.prepareLastOffer();

        const newOffer = this.prepareNewOffer();

        return bestOffer(this.bestOffer, newOffer, this.values);
    }

    prepareNewOffer() {
        return this.lastOffer
            ? this.prepareNextOffer()
            : this.prepareFirstOffer();
    }

    prepareFirstOffer() {
        this.prevOffers = [];
        const value = this.calculateFirstValue();
        this.setDesiredValue(value);

        return this.prepareNextOffer();
    }

    prepareNextOffer() {
        const option = this.getNewOfferOption();
        if (option)
            return option;

        if (this.desiredValue === 1)
            return this.prepareFirstOffer();

        this.setDesiredValue(this.desiredValue - 1);
        return this.prepareNextOffer();
    }

    prepareLastOffer() {
        if (this.me !== 0)
            return undefined;

        const bestOfferValue = calcValue(this.bestOffer, this.values);
        return bestOfferValue > 0
            ? this.bestOffer
            : this.prepareNewOffer();
    }

    calculateFirstValue() {
        const totalAmount = calcAmount(this.counts);
        const fareAmount = Math.ceil(totalAmount / 2);
        // const fareAmount = totalAmount;
        const sortedItems = getItemsSorted(this.values, this.counts);

        return takeFirst(sortedItems, fareAmount)
            .map(extractValue)
            .reduce(sum, 0);
    }

    setDesiredValue(value) {
        this.desiredValue = value;

        const totalValue = calcValue(this.counts, this.values);
        const items = getItemsSorted(this.values, this.counts);
        const itemsCount = this.counts.length;

        this.options = getOfferOptions(value, totalValue, items, itemsCount)
            .sort(byAmountAsc);
    }

    getNewOfferOption() {
        while (this.options.length) {
            const option = this.options.shift();
            if (!this.isOldOffer(option))
                return option;
        }

        return null;
    }

    isOldOffer(offer) {
        return this.prevOffers
            .some(isEqualTo(offer));
    }
}

module.exports = Solution;