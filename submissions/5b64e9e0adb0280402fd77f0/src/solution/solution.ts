import "./array";

class HistoryItem {
    constructor(public readonly me: boolean, public readonly offer: number[]) {
    }
}

class Offer {
    public count: number;

    constructor(
        public readonly counts: number[],
        public readonly value: number,
        public readonly p: number
    ) {
        this.count = counts.reduce((acc, count) => acc + count);
    }
}

class RivalValues {
    constructor(
        public readonly values: number[],
        public readonly value: number,
        public readonly p: number
    ) {
    }
}

//The maximum is inclusive and the minimum is inclusive
const randomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class {
    private round: number = 0;
    private readonly me: boolean;
    private readonly length: number;
    private readonly totalValue: number;
    private readonly history: HistoryItem[] = [];
    private readonly allOffers: Offer[];
    private readonly allRivalValues: number[][];

    private readonly myFirstP: number = 0.9;
    private readonly myLastButOneP: number = 0.6;
    private readonly myLastP: number = 0.2;
    private readonly rivalFirstP: number = 0.9;
    private readonly rivalLastP: number = 0.4;
    private readonly myProbabilities: number[];
    private readonly rivalProbabilities: number[];
    private readonly epsilonP: number = 0.05;

    constructor(
        me: number,
        private readonly counts: number[],
        private readonly values: number[],
        private readonly max_rounds: number,
        private readonly log: (s: string) => void
    ) {
        this.me = me === 0;
        this.length = counts.length;
        this.totalValue = this.getValue(counts, values);
        this.allOffers = this.getAllOffers();
        this.allRivalValues = this.getAllRivalValues();
        this.myProbabilities = this.getMyProbabilities();
        this.rivalProbabilities = this.getProbabilities(this.rivalFirstP, this.rivalLastP, this.max_rounds);
    }

    private getValue(o: number[], values: number[] = this.values): number {
        return o.reduce((acc, count, i) => acc + count * values[i], 0);
    }

    private getAllOffers(): Offer[] {
        const allOffers: Offer[] = [];
        this.setNextOffers(new Array<number>(), 0, allOffers);
        allOffers.orderBy({ order: Order.Desc, selector: _ => _.value });
        return allOffers;
    }

    private setNextOffers(counts: number[], index: number, allOffers: Offer[]): void {
        for (let count = 0; count <= this.counts[index]; count++) {
            counts[index] = count;
            counts.fill(0, index + 1);
            if (index === this.length - 1) {
                const copy = counts.slice();
                const value = this.getValue(copy);
                const p = this.getP(value);
                allOffers.push(new Offer(copy, value, p));
            }
            if (index + 1 < this.length) {
                this.setNextOffers(counts, index + 1, allOffers);
            }
        }
    }

    private getAllRivalValues(): number[][] {
        const allValues: number[][] = [];
        this.setNextRivalValues(new Array<number>(this.length), 0, allValues);
        return allValues;
    }

    private setNextRivalValues(values: number[], index: number, allValues: number[][]): void {
        for (let value = 0; value <= this.totalValue; value++) {
            values[index] = value;
            values.fill(0, index + 1);
            const totalValue = this.getValue(this.counts, values);
            if (totalValue > this.totalValue) {
                break;
            }
            if (totalValue === this.totalValue && index === this.length - 1) {
                allValues.push(values.slice());
            }
            if (index + 1 < this.length) {
                this.setNextRivalValues(values, index + 1, allValues);
            }
        }
    }

    private getMyProbabilities(): number[] {
        const result = this.getProbabilities(this.myFirstP, this.myLastButOneP, this.max_rounds - 1);
        result.push(this.myLastP);
        return result;
    }

    private getProbabilities(firstP: number, lastP: number, count = this.max_rounds): number[] {
        const delta = (lastP - firstP) / (count - 1);
        const result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(firstP + delta * i);
        }
        return result;
    }

    private getP(value: number): number {
        return value / this.totalValue;
    }

    private inverse(o: number[]): number[] {
        return o.map((count, i) => this.counts[i] - count);
    }

    private getRivalCountStatistics(): number[] {
        const rivalHistory = this.history.filter(_ => !_.me);
        const result = new Array<number>(this.length);
        result.fill(0);
        for (let item of rivalHistory) {
            for (let i = 0; i < this.length; i++) {
                result[i] += item.offer[i];
            }
        }
        for (let i = 0; i < this.length; i++) {
            result[i] = result[i] / rivalHistory.length;
        }
        return result;
    }

    private valuesCount(values: number[]): number {
        return values.reduce((acc, value) => acc + value > 0 ? 1 : 0, 0);
    }

    private excludeFreeCounts(offers: Offer[]): Offer[] {
        return offers.filter(offer => !offer.counts.some((count, i) => count > 0 && this.values[i] === 0));
    }

    private excludeEverything(offers: Offer[]): Offer[] {
        return offers.filter(offer => !offer.counts.equal(this.counts));
    }

    private getAvailableOffers(): Offer[] {
        //exclude everything offer
        let allOffers = this.excludeFreeCounts(this.allOffers);
        if (allOffers.length > 1) {
            allOffers = this.excludeEverything(allOffers);
        }

        let p = this.myProbabilities[this.round];
        if (p > allOffers[0].p) {
            p = allOffers[0].p - this.epsilonP;
        }

        return allOffers.filter(_ => _.p >= p);
    }

    private diff(counts1: number[], counts2: number[]): number {
        //return counts1.reduce((acc, count, i) => acc + Math.abs(count - counts2[i]), 0);
        return counts1.reduce((acc, count, i) => acc + Math.pow(count - counts2[i], 2), 0);
    }

    private findFirstOffer(): number[] {
        let myOffers = this.allOffers.filter(_ => _.p >= 1);
        if (myOffers.length > 1) {
            myOffers = this.excludeEverything(this.excludeFreeCounts(myOffers));
        } else {
            myOffers = this.excludeFreeCounts(this.allOffers);
            const filtered = myOffers.filter(_ => _.p >= this.myFirstP && _.p < 1);
            if (filtered.length > 0) {
                myOffers = filtered;
            }
        }
        const index = randomInt(0, myOffers.length - 1);
        return myOffers[index].counts;
    }

    private findOffer(): number[] {
        let myOffers = this.getAvailableOffers();
        const rivalHistory = this.history.filter(_ => !_.me);
        if (rivalHistory.length > 0) {
            const countStatistics = this.getRivalCountStatistics();
            const countStatisticsP = countStatistics.map((count, i) => count / this.counts[i]);

            const allRivalValues = this.allRivalValues.map(values => {
                const value = this.getValue(countStatistics, values);
                return new RivalValues(values, value, this.getP(value));
            });
            allRivalValues.orderBy(
                { order: Order.Desc, selector: _ => _.value },
                { order: Order.Desc, selector: _ => this.valuesCount(_.values) }
            );

            const rivalValues = allRivalValues[0].values;

            const myOffersMap = myOffers.map(offer => {
                const inverseOffer = this.inverse(offer.counts);
                const rivalValue = this.getValue(inverseOffer, rivalValues);
                const rivalP = this.getP(rivalValue);
                const diff = this.diff(inverseOffer, countStatistics);
                return {
                    offer: offer,
                    rivalValue: rivalValue,
                    rivalP: rivalP,
                    diff: diff
                }
            });

            myOffersMap.orderBy(
                { order: Order.Desc, selector: _ => _.rivalValue },
                { order: Order.Desc, selector: _ => _.offer.value },
                { order: Order.Asc, selector: _ => _.offer.count },
            );

            let myOffer = myOffersMap[0];

            //if (this.round >= this.max_rounds - 1) {
            const rivalP = this.rivalProbabilities[this.round];
            const filteredMyOffersMap = myOffersMap.filter(_ => _.rivalP >= rivalP);
            if (filteredMyOffersMap.length > 0) {
                filteredMyOffersMap.orderBy(
                    { order: Order.Desc, selector: _ => _.offer.value },
                    { order: Order.Asc, selector: _ => _.offer.count }
                );
                myOffer = filteredMyOffersMap[0];
            }
            //}

            return myOffer.offer.counts;
        }
        const index = randomInt(0, myOffers.length - 1);
        return myOffers[index].counts;
    }

    private checkOffer(o: number[]): boolean {
        const value = this.getValue(o);
        const p = this.me && this.round >= this.max_rounds - 1 ? 0.4 : this.myProbabilities[this.round];
        return this.getP(value) >= p;
    }

    offer(o: number[]): number[] | undefined {
        let myOffer: number[];
        if (o === undefined) {
            myOffer = this.findFirstOffer();
        } else {
            this.history.push(new HistoryItem(false, this.inverse(o)));
            if (this.checkOffer(o)) {
                return undefined;
            }
            myOffer = this.findOffer();
        }
        this.history.push(new HistoryItem(true, myOffer));
        this.round++;
        return myOffer;
    }
}