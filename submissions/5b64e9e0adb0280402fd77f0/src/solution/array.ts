enum Order {
    Asc,
    Desc
}

interface OrderPredicate<T> {
    order: Order,
    selector: (item: T) => any
}

interface Array<T> {
    orderBy(...predicates: OrderPredicate<T>[]): Array<T>;
    equal(other: T[]): boolean;
}

Array.prototype.orderBy = function <T>(...predicates: OrderPredicate<T>[]): Array<T> {
    const compare = (a: any, b: any): number => {
        for (let item of predicates) {
            const aValue = item.selector(a);
            const bValue = item.selector(b);
            if (item.order === Order.Asc && aValue > bValue || item.order === Order.Desc && aValue < bValue) {
                return 1;
            }
            if (item.order === Order.Asc && aValue < bValue || item.order === Order.Desc && aValue > bValue) {
                return -1;
            }
        }
        return 0;
    };
    return this.sort(compare);
}

Array.prototype.equal = function <T>(other: T[]): boolean {
    if (this.length !== other.length) {
        return false;
    }

    for (let i = 0; i < this.length; i++) {
        if (this[i] !== other[i]) {
            return false;
        }
    }
    return true;
}
