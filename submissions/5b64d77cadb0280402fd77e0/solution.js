'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, /*genome,*/ counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.round = 0;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];

        this.myOffers = [];
        this.enemyOffers = [];

        this.me = me;

        this.offerIndex = 0;

        //this.genome = genome;

      //this.genome = [3,2,0,1,1,8,1,8,0,7,1,1,1,1,0,2,2,3,4,1,0,3,3,5,1,1,1,1,1,0,0,1,0,1,1,1,0,1,0,0,1,1,1,1,1,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,1,0,0,1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,4,5,7,4];
        this.genome = [3,2,0,1,1,8,1,8,0,7,1,1,1,1,0,2,2,3,4,1,0,3,3,5,1,0,1,1,1,0,0,1,0,1,1,1,0,1,0,0,1,1,1,1,1,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,1,0,0,1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,4,5,7,4];

        this.fakeValues = [];
        var minDist = this.genome[86];
        for (var v1 = 0; v1 <= 10; v1++) {
            for (var v2 = 0; v2 <= 10; v2++) {
                for (var v3 = 0; v3 <= 10; v3++) {
                    var total = counts[0] * v1 + counts[1] * v2 + counts[2] * v3;
                    if (total == 10) {
                        var dist = Math.abs(v1 - values[0]) + Math.abs(v2 - values[1]) + Math.abs(v3 - values[2]);
                        if (dist < minDist && dist > this.genome[87]) {
                            minDist = dist;
                            this.fakeValues = [v1, v2, v3];
                        }
                    }
                }
            }
        }

    }

    offer(o) {
        this.round++;

        if (o) {
            this.enemyOffers.push([o[0], o[1], o[2]]);

            let sum = 0;

            for (let i = 0; i < o.length; i++) {
                sum += this.values[i] * o[i];
            }

            //accept it immidiately
            if (this.genome[83] < this.round && sum == 10) return;
            if (this.genome[0] < this.round && sum == 9) return;
            if (this.genome[1] < this.round && sum == 8) return;
            if (this.genome[2] < this.round && sum == 7) return;
        }

        //последний раунд
        //делаем последний оффер (самый точный), либо принимаем последний оффер
        if (this.round == 5) {
            if (this.me == 0) {
                return this.generateOffer(this.counts, this.values, this.myOffers, this.enemyOffers, true);
            } else {
                return this.checkOffer(o, this.counts, this.values, this.myOffers, this.enemyOffers, true) ? undefined : this.counts;
            }
        } else {
            var isGoodOffer = false;

            if (this.round > this.genome[3] && o) {
                var isGoodOffer = this.checkOffer(o, this.counts, this.values, this.myOffers, this.enemyOffers, false);
            }

            if (isGoodOffer) {
                return undefined
            } else {
                var values = this.values;

                if (this.round > this.genome[84] && this.round <= this.genome[85] && this.fakeValues.length) {
                    values = this.fakeValues;
                }

                //предлагаем по нисходящей сумме тупо
                var offer = this.generateOffer(this.counts, values, this.myOffers, this.enemyOffers, false);

                this.myOffers.push(offer);

                return offer;
            }
        }
    }


    //генерируем максимальный оффер но не меньше threshold которого еще не было
    //если нет такого, то минимальный который был но не меньше threshold
    generateOfferThreshold(counts, values, myOffers) {

        var lastOffers = {};
        for (var i = 0; i < myOffers.length; i++) {
            var o = myOffers[i];
            lastOffers['' + o[0] + o[1] + o[2]] = 1;
        }

        var possibleOffersNew = [];
        var possibleOffersAll = [];

        for (var c1 = 0; c1 <= counts[0]; c1++) {
            for (var c2 = 0; c2 <= counts[1]; c2++) {
                for (var c3 = 0; c3 <= counts[2]; c3++) {
                    var sum = values[0] * c1 + values[1] * c2 + values[2] * c3;
                    var offerHash = '' + c1 + c2 + c3;
                    if (sum >= this.genome[4]) {
                        if (lastOffers[offerHash]) {
                            possibleOffersNew.push({sum: sum, offer: [c1, c2, c3]});
                        }
                    }

                    if (sum >= this.genome[5]) {
                        possibleOffersAll.push({sum: sum, offer: [c1, c2, c3]});
                    }
                }
            }
        }

        if (possibleOffersNew.length) {
            //самый жирный для нас оффер, из тех что еще не были от нас и которые больше или равно threshold сумме
            possibleOffersNew = possibleOffersNew.sort(function(a, b) {
                return b.sum - a.sum; //reverse
            });

            return possibleOffersNew[0].offer;
        } else {
            //если таких нет тогда самый НЕ жирный для нас оффер, которые больше или равно threshold сумме
            possibleOffersAll = possibleOffersAll.sort(function(a, b) {
                return a.sum - b.sum; //direct
            });

            return possibleOffersAll[0].offer;
        }
    }



    calcPossibleIncome(offer, values) {
        var possibleEnemySums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (var i = 0; i < values.length; i++) {
            var tmp = values[i];
            if (tmp.active) {
                var sum = tmp.values[0] * offer[0] + tmp.values[1] * offer[1] + tmp.values[2] * offer[2];
                possibleEnemySums[sum]++;
            }
        }

        var sum = 0;
        var count = 0;
        for (var i = 0; i < possibleEnemySums.length; i++) {
            sum += i * possibleEnemySums[i];
            count += possibleEnemySums[i];
        }
        if (count) {
            var avg = sum / count;
        } else {
            var avg = 0;
        }

        return avg;
    }


    calcOfferProfitability(params) {
        if (this.genome[6]) {
            return this.calcOfferProfitability1(params);
        } else {
            return this.calcOfferProfitability2(params);
        }
    }


    calcOfferProfitability1(params) {

        var possibleEnemySums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < params.enemyValues.length; i++) {
            var tmp = params.enemyValues[i];
            if (tmp.active) {
                var sum = tmp.values[0] * params.enemyDivision[0] + tmp.values[1] * params.enemyDivision[1] + tmp.values[2] * params.enemyDivision[2];
                possibleEnemySums[sum]++;
            }
        }

        var sum = 0;
        var count = 0;
        var totalEn = 0;
        var totalMy = 0;
        for (var i = 0; i < possibleEnemySums.length; i++) {
            sum += i * possibleEnemySums[i];
            count += possibleEnemySums[i];

            totalEn += i * possibleEnemySums[i];
            totalMy += params.sum * possibleEnemySums[i];
        }

        if (totalEn == 0 || totalMy == 0) return undefined;

        return (totalEn + 5 - this.genome[7]) <= totalMy;
    }

    calcOfferProfitability2(params) {

        var possibleEnemySums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < params.enemyValues.length; i++) {
            var tmp = params.enemyValues[i];
            if (tmp.active) {
                var sum = tmp.values[0] * params.enemyDivision[0] + tmp.values[1] * params.enemyDivision[1] + tmp.values[2] * params.enemyDivision[2];
                possibleEnemySums[sum]++;
            }
        }

        var less = 0;
        var equal = 0;
        var more = 0;
        for (var i = 0; i < possibleEnemySums.length; i++) {
            if (i < params.sum) less += possibleEnemySums[i];
            if (i == params.sum) equal += possibleEnemySums[i];
            if (i > params.sum) more += possibleEnemySums[i];
        }

        if (less + equal + more == 0) {
            return undefined;
        }

        if (less + more == 0) {
            return true;
        }

        return less >= more;
    }


    generateOffer(counts, values, myOffers, enemyOffers, isLast) {

        if (this.genome[8] && !isLast) {
            // var o = counts.slice();
            // for (let i = 0; i< o.length; i++) {
            //     if (!values[i])
            //         o[i] = 0;
            // }
            // return o;

            var possibleOffers = [];

            for (var c1 = 0; c1 <= counts[0]; c1++) {
                for (var c2 = 0; c2 <= counts[1]; c2++) {
                    for (var c3 = 0; c3 <= counts[2]; c3++) {
                        var sum = values[0] * c1 + values[1] * c2 + values[2] * c3;
                        if (sum >= this.genome[9]) {
                            possibleOffers.push({sum: sum, offer: [c1, c2, c3]});
                        }
                    }
                }
            }

            possibleOffers = possibleOffers.sort(function(a, b) {
                return b.sum - a.sum;
            });


            this.offerIndex = this.offerIndex % possibleOffers.length;

            var offer = possibleOffers[this.offerIndex].offer;

            this.offerIndex = (this.offerIndex + 1) % possibleOffers.length;

            return offer;
        }


        var aiOffer;

        if (this.genome[10] && this.genome[11]) {
            aiOffer = true;
        }

        if (!this.genome[10] && this.genome[11]) {
            aiOffer = isLast ? false : true;
        }

        if (this.genome[10] && !this.genome[11]) {
            aiOffer = isLast ? true : false;
        }

        if (!this.genome[10] && !this.genome[11]) {
            aiOffer = false;
        }


        var lastOffers = {};
        for (var i = 0; i < myOffers.length; i++) {
            if (this.genome[12]) {
                var o = myOffers[i];
                lastOffers['' + o[0] + o[1] + o[2]] = 1;
            }
        }

        if (!aiOffer) {
            var possibleOffers = [];


            if (this.genome[13])  {
                for (var c1 = 0; c1 <= (values[0] == 0 ? 0 : counts[0]); c1++) {
                    for (var c2 = 0; c2 <= (values[1] == 0 ? 0 : counts[1]); c2++) {
                        for (var c3 = 0; c3 <= (values[2] == 0 ? 0 : counts[2]); c3++) {
                            var sum = values[0] * c1 + values[1] * c2 + values[2] * c3;
                            var offerHash = '' + c1 + c2 + c3;
                            if (!lastOffers[offerHash]) {
                                possibleOffers.push({sum: sum, offer: [c1, c2, c3]});
                            }
                        }
                    }
                }
            } else {
                //decided to not offer items with zero value for me
                for (var c1 = 0; c1 <= counts[0]; c1++) {
                    for (var c2 = 0; c2 <= counts[1]; c2++) {
                        for (var c3 = 0; c3 <= counts[2]; c3++) {
                            var sum = values[0] * c1 + values[1] * c2 + values[2] * c3;
                            var offerHash = '' + c1 + c2 + c3;
                            if (!lastOffers[offerHash]) {
                                possibleOffers.push({sum: sum, offer: [c1, c2, c3]});
                            }
                        }
                    }
                }
            }

            possibleOffers = possibleOffers.sort(function(a, b) {
                return b.sum - a.sum;
            });

            var offer = possibleOffers.length ? possibleOffers[0].offer : counts;
            var sum = offer[0] * values[0] + offer[1] * values[1] + offer[2] * values[2];


            //console.log(this.me, 'send offer:', offer, ' my sum is: ', sum);


            return offer;
        } else {
            //получаем список возможных вариантов оценки для соперника
            var possibleValuesEnemy = this.getPossibleEnemyValues(counts, myOffers, enemyOffers, false);

            //получаем список возможных вариантов оценки которые предположительно сделал соперник о нас
            var possibleValuesMy = this.getPossibleEnemyValues(counts, enemyOffers, myOffers, true);


            //перебираем все варианты разбиения и получаем:
            //сумму которую мы получим
            //сумму которую получит противник
            //сумму которую получим мы по мнению противника
            var offersAvg = [];
            var offersMinDist = [];


            if (this.genome[14]) {

                for (var c1 = 0; c1 <= counts[0]; c1++) {
                    for (var c2 = 0; c2 <= counts[1]; c2++) {
                        for (var c3 = 0; c3 <= counts[2]; c3++) {
                            var offer = [c1, c2, c3];
                            var offerHash = '' + c1 + c2 + c3;
                            var sumMy = values[0] * offer[0] + values[1] * offer[1] + values[2] * offer[2];

                            var enemyAvg = this.calcPossibleIncome([counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]], possibleValuesEnemy);
                            var myAvg = this.calcPossibleIncome(offer, possibleValuesMy);

                            //выкидываем варианты где моя сумма меньше суммы соперника
                            //и выкидываем варианты где соперник думает что моя сумма больше
                            if (sumMy >= enemyAvg && enemyAvg >= myAvg && sumMy >= this.genome[15]) {
                                if (!lastOffers[offerHash]) {
                                    offersAvg.push({offer: offer, sumMy: sumMy, enemyAvg: enemyAvg, myAvg: myAvg});
                                }
                            }

                            if (sumMy >= this.genome[16] && enemyAvg < sumMy) {
                                if (!lastOffers[offerHash]) {
                                    offersMinDist.push({offer: offer, sumMy: sumMy, enemyAvg: enemyAvg, myAvg: myAvg, dist: sumMy - enemyAvg});
                                }
                            }
                        }
                    }
                }

                //перебираем все варианты разбиения и получаем:
                //больше вероятность что у нас меньше чем у него или нет
                //больше вероятность что у нас меньше чем у него или нет с точки зрения соперника
                var offersAbs = [];

                for (var c1 = 0; c1 <= counts[0]; c1++) {
                    for (var c2 = 0; c2 <= counts[1]; c2++) {
                        for (var c3 = 0; c3 <= counts[2]; c3++) {
                            var offer = [c1, c2, c3];
                            var offerHash = '' + c1 + c2 + c3;
                            var sumMy = values[0] * offer[0] + values[1] * offer[1] + values[2] * offer[2];

                            var enemyAvg = this.calcPossibleIncome([counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]], possibleValuesEnemy);

                            var myProfitability = this.calcOfferProfitability({
                                myDivision: offer,
                                enemyDivision: [counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]],
                                sum: sumMy,
                                enemyValues: possibleValuesEnemy
                            });

                            var enemyProfitability = this.calcOfferProfitability({
                                myDivision: [counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]],
                                enemyDivision: offer,
                                sum: enemyAvg,
                                enemyValues: possibleValuesMy
                            });

                            //оставляем только те варианты где я в профите, а соперник думает что он в профите
                            if (myProfitability > 0 && enemyProfitability > 0 && sumMy >= this.genome[17]) {
                                if (!lastOffers[offerHash]) {
                                    offersAbs.push({offer: offer, sumMy:sumMy, enemyAvg:enemyAvg, myProfitability: myProfitability, enemyProfitability: enemyProfitability});
                                }
                            }
                        }
                    }
                }
                // console.log('-');
                // console.log(offersAvg);
                // console.log('-');
                // console.log(offersAbs);
                // console.log('-');
                // console.log(offersMinDist);

                if (offersAvg.length) {
                    // console.log('------offersAvg-----');

                    offersAvg = offersAvg.sort(function(a, b) {
                        return b.sumMy - a.sumMy; //reverse
                    });

                    // console.log(offersAvg[0]);

                    return offersAvg[0].offer;
                }

                if (offersAbs.length) {
                    // console.log('------offersAbs-----');

                    offersAbs = offersAbs.sort(function(a, b) {
                        return b.sumMy - a.sumMy; //reverse
                    });

                    // console.log(offersAbs[0]);

                    return offersAbs[0].offer;
                }


                // console.log('------offersMinDist-----');

                offersMinDist = offersMinDist.sort(function(a, b) {
                    return a.dist - b.dist; //direct
                });

                // console.log(offersMinDist[0]);

                if (offersMinDist.length) {
                    return offersMinDist[0].offer;
                } else {
                    return this.generateOfferThreshold(counts, values, myOffers);
                }

            } else {

                for (var c1 = 0; c1 <= counts[0]; c1++) {
                    for (var c2 = 0; c2 <= counts[1]; c2++) {
                        for (var c3 = 0; c3 <= counts[2]; c3++) {
                            var offer = [c1, c2, c3];

                            var sumMy = values[0] * offer[0] + values[1] * offer[1] + values[2] * offer[2];

                            var enemyAvg = this.calcPossibleIncome([counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]], possibleValuesEnemy);

                            var myProfitability = this.calcOfferProfitability({
                                myDivision: offer,
                                enemyDivision: [counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]],
                                sum: sumMy,
                                enemyValues: possibleValuesEnemy
                            });

                            var enemyProfitability = this.calcOfferProfitability({
                                myDivision: [counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]],
                                enemyDivision: offer,
                                sum: enemyAvg,
                                enemyValues: possibleValuesMy,
                            });


                            if (myProfitability === true && enemyProfitability === true && sumMy >= this.genome[18]) {
                                offersAvg.push({offer: offer, sumMy: sumMy});
                            }
                        }
                    }
                }

                if (offersAvg.length) {

                    offersAvg = offersAvg.sort(function(a, b) {
                        return b.sumMy - a.sumMy; //reverse
                    });

                    return offersAvg[0].offer;
                }

                return this.generateOfferThreshold(counts, values, myOffers);

            }
        }

    }


    reverseOffers(offers, counts) {
        var res = [];

        for (var i = 0; i < offers.length; i++) {
            var division = counts.slice();
            for (let j = 0; j < division.length; j++) {
               division[j] -= offers[i][j];
            }
            res.push(division);
        }

        return res;
    }


    getPossibleEnemyValues(counts, myOffers, enemyOffers, reverseOffers) {
        var possibleValuesEnemy = [];
        for (var v1 = 0; v1 <= 10; v1++) {
            for (var v2 = 0; v2 <= 10; v2++) {
                for (var v3 = 0; v3 <= 10; v3++) {
                    var total = counts[0] * v1 + counts[1] * v2 + counts[2] * v3;
                    if (total == 10) {
                        possibleValuesEnemy.push({active: true, values:[v1, v2, v3]});
                    }
                }
            }
        }

        if (reverseOffers) {
            myOffers = this.reverseOffers(myOffers, counts);
            enemyOffers = this.reverseOffers(enemyOffers, counts);
        }

        var enemyOffersFromItsSide = this.reverseOffers(enemyOffers, counts);


        var enemyOffersMap = {};
        for (var i = 0; i < enemyOffersFromItsSide.length; i++) {
            var o = enemyOffersFromItsSide[i];
            enemyOffersMap['' + o[0] + o[1] + o[2]] = 1;
        }

        //считаем для каждого возможного варианта списки получаемых сум по офферу
        //считаем что вариант подходит если суммы равномерно невозрастают
        for (var i = 0; i < possibleValuesEnemy.length; i++) {
            var prevSum = 10;
            var possible = true;
            var v = possibleValuesEnemy[i].values;

            if (this.genome[19]) {
                var hasNotGreaterSum = false;
            } else {
                var hasNotGreaterSum = true;
            }


            for (var j = 0; j < enemyOffersFromItsSide.length; j++) {
                var c = enemyOffersFromItsSide[j];
                var sum = v[0] * c[0] + v[1] * c[1] + v[2] * c[2];
                if (sum > prevSum) {
                    //разрешаем повысить сумму если этот оффер соперника уже был у него
                    if (enemyOffersMap['' + c[0] + c[1] + c[2]] && this.genome[27]) {
                        // prevSum = sum
                    } else {
                        possible = false;
                    }
                }

                for (var m = 0; m <= 4; m++) {
                    if (this.genome[28 + m * 11] && j == m && sum == 0) possible = false;
                    if (this.genome[29 + m * 11] && j == m && sum == 1) possible = false;
                    if (this.genome[30 + m * 11] && j == m && sum == 2) possible = false;
                    if (this.genome[31 + m * 11] && j == m && sum == 3) possible = false;
                    if (this.genome[32 + m * 11] && j == m && sum == 4) possible = false;
                    if (this.genome[33 + m * 11] && j == m && sum == 5) possible = false;
                    if (this.genome[34 + m * 11] && j == m && sum == 6) possible = false;
                    if (this.genome[35 + m * 11] && j == m && sum == 7) possible = false;
                    if (this.genome[36 + m * 11] && j == m && sum == 8) possible = false;
                    if (this.genome[37 + m * 11] && j == m && sum == 9) possible = false;
                    if (this.genome[38 + m * 11] && j == m && sum == 10) possible = false;
                }

                if (this.genome[19]) {
                    //перебираем все возможные наши вельюсы с этим оффером
                    //если у нас нет ни одного варианта суммы меньше или равной сумме которую получит соперник, считаем это невозможным кейсом
                    //переберем по possibleValuesEnemy, просто не учитывая active, ведь сами варианты едины для обоих
                    for (var k = 0; k < possibleValuesEnemy.length; k++) {
                        var c1 = enemyOffers[j];
                        var v1 = possibleValuesEnemy[k].values;
                        var sumMy = v1[0] * c1[0] + v1[1] * c1[1] + v1[2] * c1[2];

                        if (sumMy <= sum) hasNotGreaterSum = true;
                    }
                }


                if (!possible || !hasNotGreaterSum) break;

                prevSum = sum;
            }

            if (!possible || !hasNotGreaterSum) {
                possibleValuesEnemy[i].active = false;
            }
        }

        if (this.genome[20]) {
            var myOffersFromItsSide = [];
            for (var i = 0; i < myOffers.length; i++) {
                var enemyDivision = counts.slice();
                for (let j = 0; j < enemyDivision.length; j++) {
                   enemyDivision[j] -= myOffers[i][j];
                }
                myOffersFromItsSide.push(enemyDivision);
            }


            for (var i = 0; i < possibleValuesEnemy.length; i++) {
                var v = possibleValuesEnemy[i].values;
                var possible = true;
                for (var j = 0; j < myOffersFromItsSide.length; j++) {
                    var c = myOffersFromItsSide[j];
                    var sum = v[0] * c[0] + v[1] * c[1] + v[2] * c[2];
                    if (j > this.genome[21] && sum == 10) possible = false;
                    if (j > this.genome[22] && sum == 9) possible = false;
                    if (j > this.genome[23] && sum == 8) possible = false;
                    if (j > this.genome[24] && sum == 7) possible = false;
                }
                if (!possible) {
                    possibleValuesEnemy[i].active = false;
                }
            }
        }

        return possibleValuesEnemy;
    }

    checkOffer(offer, counts, values, myOffers, enemyOffers, isLast) {

        var possibleValuesEnemy = this.getPossibleEnemyValues(counts, myOffers, enemyOffers, false);

        var sumMy = values[0] * offer[0] + values[1] * offer[1] + values[2] * offer[2];

        var profitability = this.calcOfferProfitability({
            myDivision: offer,
            enemyDivision: [counts[0] - offer[0], counts[1] - offer[1], counts[2] - offer[2]],
            sum: sumMy,
            enemyValues: possibleValuesEnemy
        });

        if (!isLast && profitability == undefined) return false;

        if (profitability == undefined) {
            if (sumMy >= this.genome[25]) {
                profitability = true;
            } else {
                profitability = false;
            }
        }

        if (profitability && sumMy >= this.genome[26]) {
            return true;
        } else {
            return false;
        }
    }
};