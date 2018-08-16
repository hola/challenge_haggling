"use strict" /*jslint node:true*/;

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        /**
         * Базовые параметры
         */
        this.myStepFirst = !me;
        this.itemsTotalCounts = counts;
        this.itemsValues = values;
        this.maxRounds = max_rounds;
        this.log = log;

        /**
         * Производные параметры
         */
        this.goldenRatio = 0.62; // справедливость = (sqrt(5) - 1) / 2

        this.roundNum = 0; // номер текущего раунда
        this.partnerTotal = this._offerValue(this.itemsTotalCounts); // ценность всех предметов для партнёра
        this.myOffers = []; // история моих предложений (в рамках раунда)
        this.partnerOffers = []; // история предложений от партнёра для меня (в рамках раунда)
        this.allMyOfferCombinations = this._generateMyOfferCombinations(); // все возможные комбинации для моих предложений
        this.allPriceCombinations = this._generateAllPricesVariants(); // все возможные комбинации цен товаров для партнёра
        this._recalcPricesProbability(); // вероятности для цен
        this.weight = {
            // score weight
            value: 100, // стоимость оффера
            agreementEvaluation: 50, // оценка вероятности, что партнёр согласится на оффер
            rejected: 10, // мои офферы (и сопутствующие..), которые были отклонены партнёром
            orthogonality: 10, // ортогональность к предыдущим моим офферам
            diffValueThreshold: 2, // оценка близости к справедливому дележу
            coorientation: 1, // сонаправленность с офферами партнёра
            countItemsForPartner: 1, // кол-во товаров в оффере идеально попополам
            random: 1 // дань энтропии - удача на нашей стороне!
        };
    }
    offer(partnerOffer) {
        this.roundNum++;
        if (partnerOffer) {
            this.partnerOffers.push(partnerOffer);
            this._recalcPricesProbability();
            if (this._isFairPartnerOffer(partnerOffer)) {
                return;
            }
        } else {
            this._recalcPricesProbability();
        }

        let myOffer = this._makeOffer();
        this.myOffers.push(myOffer);
        return myOffer;
    }

    /**
     * Оценивает справедливость оффера
     */
    _isFairPartnerOffer(offer) {
        let offerObject = this._offerToObject(offer);
        let minThresholdValue = this._minThresholdValue();
        return offerObject.value >= minThresholdValue;
    }
    _minThresholdValue() {
        let result = 0;
        if (!this.myStepFirst) {
            if (this.roundNum >= this.maxRounds) {
                result = 2;
            } else {
                result = 7 - this.roundNum*0.5;
            }
        } else {
            // последний ход будет наш
            result = 10 - this.roundNum*0.7;
        }
        return result;
    }
    _makeOffer() {
        let result = [];
        let scores = this._scoreOutboundOffers();
        scores.sort(function(a, b) {
            return +a.score < +b.score ? 1 : +b.score < +a.score ? -1 : 0;
        });
        let bestOffer;
        if (
            scores[0] &&
            scores[0].hash &&
            this.allMyOfferCombinations[scores[0].hash]
        ) {
            bestOffer = this.allMyOfferCombinations[scores[0].hash];
        } else {
            bestOffer = this.allMyOfferCombinations[
                Object.keys(this.allMyOfferCombinations)[0]
            ];
        }
        result = bestOffer.offer;

        let bestOffers = [];
        for (let i = 0; i < scores.length && i < 5; i++) {
            bestOffers.push(this.allMyOfferCombinations[scores[i]["hash"]]);
        }
        return result;
    }
    /**
     * Считаем оценку для исходящего оффера
     */
    _scoreOutboundOffers() {
        let result = [];
        let offer;
        let score;

        this._normalize(this.allMyOfferCombinations, "value");
        this._calcAgreementEvaluation(); // оцениваем вероятность соглашения
        this._calcOrthogonalityToMyPrevOffers(); // считаем ортогональность к своим предложениям
        this._calcCoorientationToPartnerPrevOffers(); // считаем сонаправленность офферам партнёра
        this._calcThreshodDistance(); // "расстояние" до справедливой сделки
        this._calcRejectedMyOffers(); // считаем отклонённые мои предыдущие предложения
        this._calcScoreCountItemsForPartner(); // оценка кол-ва офферов для партнёра

        // подсчёт очков
        for (let hash in this.allMyOfferCombinations) {
            offer = this.allMyOfferCombinations[hash];
            score = 0;
            score += offer.valueNorm * this.weight.value;
            score += offer.agreementEvalNorm * this.weight.agreementEvaluation;
            score += offer.thDistanceNorm * this.weight.diffValueThreshold;
            score +=
                offer.countItemsForPartnerScoreNorm *
                this.weight.countItemsForPartner;
            score += offer.orthogonalityNorm * this.weight.orthogonality;
            score += offer.coorientationNorm * this.weight.coorientation;
            score += offer.rejectedNorm * this.weight.rejected;
            score += offer.randomNorm * this.weight.random;
            result.push({
                hash: hash,
                score: score
            });
            this.allMyOfferCombinations[hash].score = score;
        }

        return result;
    }
    /**
     * Кол-во товаров для партнёра
     */
    _calcScoreCountItemsForPartner() {
        let itemsTotalCount = this.itemsTotalCounts.reduce((a, b) => a + b, 0);
        for (let hash in this.allMyOfferCombinations) {
            let offer = this.allMyOfferCombinations[hash];
            // Ерунда какая-то
            if (offer.countItemsForPartner - itemsTotalCount * 0.5 == 0) {
                this.allMyOfferCombinations[hash][
                    "countItemsForPartnerScore"
                ] = itemsTotalCount;
            } else {
                this.allMyOfferCombinations[hash]["countItemsForPartnerScore"] =
                    (itemsTotalCount * 0.5) /
                    Math.abs(
                        offer.countItemsForPartner - itemsTotalCount * 0.5
                    );
            }
            // EOF ерунда какая-то
        }
        this._normalize(
            this.allMyOfferCombinations,
            "countItemsForPartnerScore"
        );
    }
    /**
     * Проверяем офферы на схожесть с предложенными ранее мной и партнёром
     */
    _calcRejectedMyOffers() {
        for (let hash in this.allMyOfferCombinations) {
            this.allMyOfferCombinations[hash]["rejected"] = 0;
        }
        for (let i = 0; i < this.myOffers.length; i++) {
            let oldOffer = this.myOffers[i];
            for (let hash in this.allMyOfferCombinations) {
                let newOfferBigger = 0, // новый оффер больше старого (с точки зрения партнёра)
                    newOffer = this.allMyOfferCombinations[hash]["offer"];
                for (let type = 0; type < oldOffer.length; type++) {
                    if (newOffer[type] < oldOffer[type]) {
                        newOfferBigger = 1;
                        break;
                    }
                }
                this.allMyOfferCombinations[hash]["rejected"] += newOfferBigger;
            }
        }
        for (let i = 0; i < this.partnerOffers.length; i++) {
            let oldOffer = this.partnerOffers[i];
            for (let hash in this.allMyOfferCombinations) {
                let newOfferBigger = 4, // новый оффер больше старого (с точки зрения партнёра)
                    newOffer = this.allMyOfferCombinations[hash]["offer"];
                for (let type = 0; type < oldOffer.length; type++) {
                    if (newOffer[type] > oldOffer[type]) {
                        newOfferBigger = 0;
                        break;
                    }
                }
                this.allMyOfferCombinations[hash]["rejected"] -= newOfferBigger;
            }
        }
        let min = 0;
        for (let hash in this.allMyOfferCombinations) {
            if (min > this.allMyOfferCombinations[hash]["rejected"]) {
                min = this.allMyOfferCombinations[hash]["rejected"];
            }
        }
        for (let hash in this.allMyOfferCombinations) {
            this.allMyOfferCombinations[hash]["rejected"] += min;
        }
        this._normalize(this.allMyOfferCombinations, "rejected");
    }
    /**
     * Оценка вероятности соглашения партнёра с оффером
     */
    _calcAgreementEvaluation() {
        let totlaP = 0;
        for (let priceHash in this.allPriceCombinations) {
            totlaP += this.allPriceCombinations[priceHash]["p"];
        }
        if (totlaP === 0) {
            totlaP = 1;
        }
        let thresholdValue;
        if (this.myStepFirst) {
            thresholdValue = 9 - this.roundNum;
        } else {
            thresholdValue = 10 - this.roundNum;
        }
        for (let hash in this.allMyOfferCombinations) {
            let inversedOffer = this._offerInverse(
                this.allMyOfferCombinations[hash]["offer"]
            );
            this.allMyOfferCombinations[hash]["agreementEval"] =
                this._sumP(inversedOffer, thresholdValue) / totlaP;
        }
        this._normalize(this.allMyOfferCombinations, "agreementEval");
    }
    _sumP(offer, thresholdValue) {
        let result = 0;
        let offerValue;
        for (let priceHash in this.allPriceCombinations) {
            offerValue = this._offerValue(
                offer,
                this.allPriceCombinations[priceHash]["prices"]
            );
            if (offerValue >= thresholdValue) {
                result += this.allPriceCombinations[priceHash]["p"];
            }
        }
        return result;
    }
    /**
     * Оценка ортогональности (минимальной) к предыдущим моим офферам
     */
    _calcOrthogonalityToMyPrevOffers() {
        let scalar,
            minScalar,
            totalItems = this.itemsTotalCounts.reduce(function(acc, val) {
                return acc + val;
            }, 0);
        for (let hash in this.allMyOfferCombinations) {
            minScalar = totalItems * totalItems;
            for (let i = 0; i < this.myOffers.length; i++) {
                scalar = this._scalarMultiplication(
                    this.allMyOfferCombinations[hash]["offer"],
                    this.myOffers[i]
                );
                if (scalar < minScalar) {
                    minScalar = scalar;
                }
            }
            this.allMyOfferCombinations[hash][
                "minScalarToMyPrevOffers"
            ] = minScalar;
        }

        let max = 0;
        for (let hash in this.allMyOfferCombinations) {
            if (
                max <
                this.allMyOfferCombinations[hash]["minScalarToMyPrevOffers"]
            ) {
                max = this.allMyOfferCombinations[hash][
                    "minScalarToMyPrevOffers"
                ];
            }
        }
        for (let hash in this.allMyOfferCombinations) {
            if (max > 0) {
                this.allMyOfferCombinations[hash]["orthogonalityNorm"] =
                    (max -
                        this.allMyOfferCombinations[hash][
                            "minScalarToMyPrevOffers"
                        ]) /
                    max;
            } else {
                this.allMyOfferCombinations[hash]["orthogonalityNorm"] = 0;
            }
        }
    }
    /**
     * Максимальная сонаправленность с пред. офферами партнёра
     */
    _calcCoorientationToPartnerPrevOffers() {
        let scalar, maxScalar;
        for (let hash in this.allMyOfferCombinations) {
            maxScalar = 0;
            for (let i = 0; i < this.partnerOffers.length; i++) {
                scalar = this._scalarMultiplication(
                    this.allMyOfferCombinations[hash]["offer"],
                    this.partnerOffers[i]
                );
                if (scalar > maxScalar) {
                    maxScalar = scalar;
                }
            }
            this.allMyOfferCombinations[hash][
                "maxScalarToPartnerPrevOffers"
            ] = maxScalar;
        }

        let max = 0;
        for (let hash in this.allMyOfferCombinations) {
            if (
                max <
                this.allMyOfferCombinations[hash][
                    "maxScalarToPartnerPrevOffers"
                ]
            ) {
                max = this.allMyOfferCombinations[hash][
                    "maxScalarToPartnerPrevOffers"
                ];
            }
        }
        for (let hash in this.allMyOfferCombinations) {
            if (max > 0) {
                this.allMyOfferCombinations[hash]["coorientationNorm"] =
                    this.allMyOfferCombinations[hash][
                        "maxScalarToPartnerPrevOffers"
                    ] / max;
            } else {
                this.allMyOfferCombinations[hash]["coorientationNorm"] = 0;
            }
        }
    }
    /**
     * Скалярное произведение к суммарному вектору предыдущих офферов партнёра
     */
    _calcScalarToPartnerPrevOffers() {
        let sumVectorPrevOffer = [];
        for (let type = 0; type < this.itemsTotalCounts.length; type++) {
            sumVectorPrevOffer[type] = 0;
        }
        for (let type = 0; type < this.itemsTotalCounts.length; type++) {
            for (let i in this.partnerOffers) {
                sumVectorPrevOffer[type] += this.partnerOffers[i][type];
            }
        }
        for (let hash in this.allMyOfferCombinations) {
            this.allMyOfferCombinations[
                hash
            ].scalarToPartnerPrevOffers = this._scalarMultiplication(
                this.allMyOfferCombinations[hash]["offer"],
                sumVectorPrevOffer
            );
        }
    }
    /**
     * Скалярное произведение двух векторов
     */
    _scalarMultiplication(vectorA, vectorB) {
        let result = 0;
        if (vectorA.length != vectorB.length) {
            return result;
        }
        for (let i = 0; i < vectorA.length; i++) {
            result += vectorA[i] * vectorB[i];
        }
        return result;
    }
    /**
     * Оценка близости офферов к справедливому разделению
     */
    _calcThreshodDistance() {
        let minThresholdValue = this._minThresholdValue(); // справедливое предложение
        for (let hash in this.allMyOfferCombinations) {
            this.allMyOfferCombinations[hash].thDistance = Math.pow(
                this.allMyOfferCombinations[hash].value - minThresholdValue,
                2
            );
        }
        this.allMyOfferCombinations = this._normalize(
            this.allMyOfferCombinations,
            "thDistance",
            true
        );
    }

    /**
     * Все возможные комбинации офферов, которые мы можем предложить.
     */
    _generateMyOfferCombinations() {
        let result = {};
        let itemCombinations = this._generateItemValues(); // все возможные предложения товаров каждого по-отдельности
        let offers = this._getCombinations(
            itemCombinations,
            itemCombinations.length
        );
        let offerObject;
        for (let i = 0; i < offers.length; i++) {
            offerObject = this._offerToObject(offers[i]);
            result[offerObject.hash] = offerObject;
        }
        result = this._firstFilterCombinations(result);
        return result;
    }
    /**
     * Combinations of two dimensional array
     * Thanks to https://stackoverflow.com/questions/18233874/get-all-the-combinations-of-n-elements-of-multidimensional-array
     */
    _getCombinations(arr, n) {
        var i,
            j,
            k,
            elem,
            l = arr.length,
            childperm,
            ret = [];
        if (n == 1) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    ret.push([arr[i][j]]);
                }
            }
            return ret;
        } else {
            for (i = 0; i < l; i++) {
                elem = arr.shift();
                for (j = 0; j < elem.length; j++) {
                    childperm = this._getCombinations(arr.slice(), n - 1);
                    for (k = 0; k < childperm.length; k++) {
                        ret.push([elem[j]].concat(childperm[k]));
                    }
                }
            }
            return ret;
        }
        i = j = k = elem = l = childperm = ret = [] = null;
    }

    /**
     * Все возможные предложения товаров каждого по-отдельности.
     */
    _generateItemValues() {
        let result = [];
        for (
            let typeIndex = 0;
            typeIndex < this.itemsTotalCounts.length;
            typeIndex++
        ) {
            result[typeIndex] = [];
            for (
                let count = this.itemsTotalCounts[typeIndex];
                count >= 0;
                count--
            ) {
                result[typeIndex].push(count);
            }
        }
        return result;
    }
    _offerHash(offer) {
        return offer.join("-");
    }
    _priceHash(offer) {
        return offer.join("~");
    }
    /**
     * Ценность предложения в $
     */
    _offerValue(offer, prices) {
        let result = 0;
        prices = typeof prices !== "undefined" ? prices : this.itemsValues;
        for (let i = 0; i < offer.length; i++) {
            result += offer[i] * prices[i];
        }
        return result;
    }
    /**
     * Инверсия оффера (мне -> партнёру и наоборот)
     */
    _offerInverse(offer) {
        let result = [];
        for (let i = 0; i < offer.length; i++) {
            result[i] = this.itemsTotalCounts[i] - offer[i];
        }
        return result;
    }
    _countItemsForPartner(myOffer) {
        let result = this.itemsTotalCounts.reduce(function(acc, val) {
            return acc + val;
        }, 0);
        result -= myOffer.reduce(function(acc, val) {
            return acc + val;
        }, 0);
        return result;
    }
    _generateAllPricesVariants() {
        let result = {};
        let variants = this._allPricesVariants(
            this.itemsTotalCounts,
            0,
            this.partnerTotal
        );
        let hash;
        for (let i = 0; i < variants.length; i++) {
            hash = this._priceHash(variants[i]);
            result[hash] = {
                hash: hash,
                prices: variants[i],
                p: 0
            };
        }
        return result;
    }
    /**
     * Обновляет вероятности цен для партнёра
     */
    _recalcPricesProbability() {
        for (let priceHash in this.allPriceCombinations) {
            this.allPriceCombinations[priceHash]["p"] =
                1 / Object.keys(this.allPriceCombinations).length;
        }
        let inversedOffer;
        // уменьшаем вероятность наборов цен, с нулевой ценностью товара для партнёра
        for (let priceHash in this.allPriceCombinations) {
            for (let i = 0; i < this.partnerOffers.length; i++) {
                inversedOffer = this._offerInverse(this.partnerOffers[i]);
                if (
                    this._offerHasEmptyPriceItem(
                        inversedOffer,
                        this.allPriceCombinations[priceHash]["prices"]
                    )
                ) {
                    this.allPriceCombinations[priceHash]["p"] *= 0.01;
                }
            }
        }
        let thresholdValue;
        if (this.myStepFirst) {
            // если последний оффер мой
            // уменьшаем вероятность наборов цен, с ценность партнёрских офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.partnerOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.partnerOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 9 - i;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.3;
                    }
                }
            }
            // уменьшаем вероятность наборов цен, с ценность моих офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.myOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.myOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 9 - i;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.3;
                    }
                }
            }


            // уменьшаем вероятность наборов цен, с ценность партнёрских офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.partnerOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.partnerOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 7 - i;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.1;
                    }
                }
            }
            // уменьшаем вероятность наборов цен, с ценность моих офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.myOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.myOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 7 - i;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.1;
                    }
                }
            }
        } else {
            // если последний оффер партнёра
            // уменьшаем вероятность наборов цен, с ценность партнёрских офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.partnerOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.partnerOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 9 - i / 2;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.5;
                    }
                }
            }
            // уменьшаем вероятность наборов цен, с ценность моих офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.myOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.myOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 9 - i / 2;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.5;
                    }
                }
            }


            // если последний оффер партнёра
            // уменьшаем вероятность наборов цен, с ценность партнёрских офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.partnerOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.partnerOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 7 - i / 2;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.1;
                    }
                }
            }
            // уменьшаем вероятность наборов цен, с ценность моих офферов меньше `thresholdValue`
            for (let priceHash in this.allPriceCombinations) {
                for (let i = 0; i < this.myOffers.length; i++) {
                    inversedOffer = this._offerInverse(this.myOffers[i]);
                    // `thresholdValue` уменьшается с каждым раундом: 7, 6, 5, 4, 3
                    thresholdValue = 7 - i / 2;
                    if (
                        this._offerValueSmallerThen(
                            inversedOffer,
                            this.allPriceCombinations[priceHash]["prices"],
                            thresholdValue
                        )
                    ) {
                        this.allPriceCombinations[priceHash]["p"] *= 0.1;
                    }
                }
            }
        }
    }
    _offerHasEmptyPriceItem(offer, prices) {
        let result = false;
        for (let i = 0; i < offer.length; i++) {
            if (offer[i] > 0 && prices[i] == 0) {
                result = true;
                break;
            }
        }
        return result;
    }
    _offerValueSmallerThen(offer, prices, value) {
        let offerValue = this._offerValue(offer, prices);
        return offerValue < value;
    }
    /**
     * Все варианты цен для заданного кол-ва товаров
     */
    _allPricesVariants(
        countVariant,
        itemMinPrice,
        itemsTotalPrice,
        curType,
        partialVariant
    ) {
        let allVariants = [];
        let itemTypesCount = countVariant.length;
        curType = typeof curType !== "undefined" ? curType : 0;
        partialVariant =
            typeof partialVariant !== "undefined" ? partialVariant : [];
        partialVariant = partialVariant.slice(0, curType);

        let partialVariantSum = this._variantTotalPrice(
            countVariant,
            partialVariant
        );

        if (curType === itemTypesCount - 1) {
            partialVariant[curType] =
                (itemsTotalPrice - partialVariantSum) / countVariant[curType];
            if (
                Number.isInteger(partialVariant[curType]) &&
                partialVariant[curType] >= itemMinPrice
            ) {
                allVariants.push(partialVariant);
            }
        } else {
            let maxItemPrice =
                itemsTotalPrice -
                partialVariantSum -
                (itemTypesCount - curType - 1) * itemMinPrice;
            for (let i = itemMinPrice; i <= maxItemPrice; i++) {
                partialVariant[curType] = i;
                allVariants = allVariants.concat(
                    this._allPricesVariants(
                        countVariant,
                        itemMinPrice,
                        itemsTotalPrice,
                        curType + 1,
                        partialVariant
                    )
                );
            }
        }
        return allVariants;
    }
    /**
     * Стоимость оффера
     * Может быть не полной, например для [1,2,3] * [5,1] = 1*5 + 2*1 = 7
     */
    _variantTotalPrice(countVariant, pricesVariant) {
        let result = 0;
        for (let i = 0; i < pricesVariant.length; i++) {
            result += countVariant[i] * pricesVariant[i];
        }
        return result;
    }
    _offerToObject(offer) {
        return {
            offer: offer,
            hash: this._offerHash(offer),
            value: this._offerValue(offer),
            countItemsForPartner: this._countItemsForPartner(offer),
            randomNorm: Math.random()
        };
    }
    /**
     * Начальная фильтрация заведомо плохих офферов
     */
    _firstFilterCombinations(offersObjects) {
        let minValue = 3;
        for (let hash in offersObjects) {
            // если осталось только одно предложение - ничего не фильтруем
            if (Object.keys(offersObjects).length < 2) {
                break;
            }
            let offer = offersObjects[hash];
            // нулевая ценность всего оффера или одного из товаров в оффере
            // нулевое предложение партнёру
            if (offer.value < minValue || offer.countItemsForPartner < 1) {
                delete offersObjects[hash];
                continue;
            }
            for (let type = 0; type < this.itemsValues.length; type++) {
                if (offer["offer"][type] > 0 && this.itemsValues[type] <= 0) {
                    delete offersObjects[hash];
                    continue;
                }
            }
        }
        return offersObjects;
    }
    /**
     * Нормализация параметра
     */
    _normalize(objs, propertyName, reverse) {
        reverse = typeof reverse !== "undefined" ? reverse : false;
        let max = 0,
            newPropertName = propertyName + "Norm";
        for (let key in objs) {
            if (objs[key][propertyName] > max) {
                max = objs[key][propertyName];
            }
        }
        for (let key in objs) {
            if (reverse) {
                if (max > 0) {
                    objs[key][newPropertName] =
                        (max - objs[key][propertyName]) / max;
                } else {
                    objs[key][newPropertName] = 0;
                }
            } else {
                if (max > 0) {
                    objs[key][newPropertName] = objs[key][propertyName] / max;
                } else {
                    objs[key][newPropertName] = 0;
                }
            }
        }
        return objs;
    }
};
