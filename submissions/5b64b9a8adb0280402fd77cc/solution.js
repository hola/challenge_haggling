
module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me; //0, если ваша очередь первая, или 1, если вторая.
        this.counts = counts; //массив целых чисел, содержащий количество объектов каждого типа. Он содержит от 2 до 10 элементов.
        this.values = values; //массив целых чисел такой же длины, что и counts, описывающий ценность объекта каждого из типов для вас.
        this.rounds = max_rounds; // число раундов переговоров (каждый раунд состоит из двух реплик).
        this.maxRounds = max_rounds;
        this.log = log;//функция, которую можно вызывать для отладочного вывода (console.log работать не будет).
        this.total = 0;
        this.totalCount = 0;

        this.maxPercent = 100;
        this.minPercent = 50;
        this.stepPercent = (this.maxPercent - this.minPercent) / this.rounds;

        this.goods = [];
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
            this.totalCount += counts[i];

            let item = {};
            item.id = i;
            item.count = counts[i];
            item.price = values[i];
            this.goods[i] = item;
        }

        this.goods.sort(this.compareGoods);

    }

    compareGoods(a, b) {
        if (a.price < b.price) return 1;
        if (a.price > b.price) return -1;
        return 0;
    }
    /**Метод offer вызывается каждый раз, когда наступает ваша очередь. 
     * Его аргумент o — это массив целых чисел такой же длины, как counts. 
     * Аргумент описывает, сколько объектов каждого из типов вам предлагает партнёр. 
     * Если ваша очередь первая, и это самый первый раунд, то o равно undefined.
     * Метод offer должен вернуть undefined, если вы принимаете предложение (кроме случая, когда o равно undefined). 
     * В противном случае он должен вернуть массив целых чисел такой же длины, как counts, описывающий, сколько объектов каждого типа вы хотите оставить себе. 
     * Обратите внимание, что и аргумент o, и возвращаемое значение offer описывают раздел предметов с вашей точки зрения. */
    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (!o || (this.rounds == this.maxRounds - 1)) {
            return this.firstOffer();
        } else if (this.rounds == this.maxRounds - 2) {

            return this.secondOffer();
        } else if (this.rounds == this.maxRounds - 3) {

            return this.thirdOffer(this.rounds);
        } else {
            var myResult = this.nextOffer(this.rounds);
            if (this.rounds == 0) {
                if (this.calcResultSum(o) == 0 && this.me == 0) {
                    return myResult;
                } else {
                    return;
                }
            } else if (this.rounds == 1) {
                if (this.calcResultSum(o) == 0 && this.calcResultSum(myResult) < this.total) {
                    return this.invertOffer(myResult);
                } else {
                    if (this.calcResultSum(o) == this.total) {
                        return;
                    } else {

                        if (this.calcResultSum(myResult) <= this.calcResultSum(o)) {
                            return;
                        } else if (this.compareResult(myResult, o)) {
                            return;
                        } else {
                            return myResult;
                        }
                    }
                }
            } else {
                if (this.calcResultSum(o) == this.total) {
                    return;
                } else {

                    if (this.calcResultSum(myResult) <= this.calcResultSum(o)) {
                        return;
                    } else if (this.compareResult(myResult, o) && this.calcResultSum(myResult) > 0) {
                        return;
                    } else {
                        return myResult;
                    }
                }
            }
        }
    }

    firstOffer() {
        var objects = this.goods.slice();
        var result = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].price != 0) {
                var item = this.clone(objects[i]);
                result[result.length] = item;
            }
        }
        return this.convertToResult(result);
    }

    secondOffer() {
        var objects = this.goods.slice();
        var result = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].price != 0) {
                var item = this.clone(objects[i]);
                result[result.length] = item;
            } 
        }

        for (var i = objects.length - 1; i > 0; i--) {
            if (objects[i].price > 0 && i >= 1) {
                var item = this.clone(objects[i]);
                if (item.count > 1)
                    item.count = 1;
                else
                    item.count = 0;
                result[result.length] = item;
                break;
            }
        }

        return this.convertToResult(result);
    }

    thirdOffer(roundsLeft) {
        var objects = this.goods.slice();
        var result = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].price != 0) {
                var item = this.clone(objects[i]);
                result[result.length] = item;
            } 
        }

        for (var i = objects.length - 1; i > 0; i--) {
            if (objects[i].price > 0 && i >= 1) {
                var item = this.clone(objects[i]);
                if (item.count == 1)
                    return this.nextOffer(roundsLeft);
                result[result.length] = item;
                break;
            }
        }

        return this.convertToResult(result);
    }

    nextOffer(roundsLeft) {
        var objects = this.goods.slice();
        var numObjects = objects.length;

        var limitPercent = this.maxPercent - this.stepPercent * (this.maxRounds - roundsLeft);
        var limit = this.total * limitPercent / 100;
        var result = [];
        var me = this.total;
        var i = numObjects - 1;

        do {
            if (objects[i].price != 0) {
                var item = this.clone(objects[i]);
                result[result.length] = item;
            } else {
                var item = this.find(result);
                if (item == null) {
                    item = this.clone(objects[i]);
                    item.count = 1;
                    me -= item.price;
                    result[result.length] = item;
                }
                var costlyItem = null;
                if (i > 0 && item.count > 1 && item.count < objects[i].count) {

                    var itemPrice = (item.count + 1) * item.price;
                    if (itemPrice == 0) {
                        for (var j = 0; j < i; j++) {
                            if (objects[j].price <= itemPrice) {
                                if (this.find(result, objects[j].id) == null) {
                                    costlyItem = objects[j];
                                    break;
                                }

                            }
                        }
                    }

                    if (costlyItem) {
                        var exchangeCount = 0;
                        for (var j = 0; j < (item.count + 1); j++) {
                            if (costlyItem.price <= item.price * j) {
                                exchangeCount = j;
                                break;
                            }
                        }
                        if (!exchangeCount) {
                            this.log("Error exchangeCount");
                            exchangeCount = 1;
                        }

                        if (item.count == exchangeCount) {
                            result.splice(result.length - 1, 1);
                        } else {
                            item.count -= exchangeCount;
                        }
                        me += item.price * exchangeCount;

                        item = this.clone(costlyItem[i]);
                        item.count = 1;
                        me -= item.price;
                        result[result.length] = item;

                    }
                }
                if (item.count < objects[i].count) {
                    // Не нашли подходящего, берем просто еще один
                    if (!costlyItem) {
                        item.count++;
                        me -= item.price;
                    }

                }

            }
            i--;
        } while (me > limit && i > 0);

        return this.convertToResult(result);
    }

    invertOffer(counts) {
        var result = [];
        for (var i = 0; i < this.counts.length; i++) {
            result[i] = 0;
        }

        for (var i = 0; i < counts.length; i++) {
            result[i] = this.counts[i] - counts[i];
        }
        return result;
    }

    resultCount(counts) {
        var count = 0;
        for (var i = 0; i < counts.length; i++) {
            count += counts[i];
        }
        return count;
    }

    compareResult(list1, list2) {
        for (var i = 0; i < this.counts.length; i++) {
            if (list1[i] != list2[i]) {
                return false;
            }
        }
        return true;
    }

    calcResultSum(counts) {
        var sum = 0;
        for (var i = 0; i < counts.length; i++) {
            sum += counts[i] * this.values[i];
        }
        return sum;
    }

    convertToResult(list) {
        var result = [];
        for (var i = 0; i < this.counts.length; i++) {
            result[i] = 0;
        }

        for (var i = 0; i < list.length; i++) {
            result[list[i].id] = list[i].count;
        }
        return result;
    }

    find(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id)
                return list[i];
        }
        return null;
    }

    clone(item) {
        var result = {};
        result.id = item.id;
        result.count = item.count;
        result.price = item.price;
        return result;
    }
};