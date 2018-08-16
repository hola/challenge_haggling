//   Общая стратегия работы скрипта заключается в идее, что максимальную прибыль
// получат те, кто пытается обогатить не только себя, но и соперника (в текущей игре).
// Тем самым, повысив шансы не его согласие с оффером. Но как обогатить соперника
// не зная его цен?
//   Нужно, чтобы он их подсказал. Тоже касается и нашей стороны. Ходим,
// понижая общую стоимость (или сохраняя предыдущую), и ожидаем от него того же.
// За счет этого, количество вариантов его цен сокращается и мы можем попытаться угадать
// наиболее выгодный для обоих оффер.
//   Также, учитываем за кем последнее слово. Если за нами, то предлагаем наиболее
// выгодный для обоих оффер с перевесом в нашу сторону (или равный). Ну и наоборот,
// если за ним последний ход, ожидаем, что он предложит оффер, который можно
// считать для нас выгодным, учитывая все варианты его цен, вычисленные из сделанных
// им ходов.
//
// Это - общая идея. Остальное - детали.

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.items = counts;
    this.prices = values;
    this.roundsLeft = max_rounds;
    this.maxRounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++)
      this.total += counts[i] * values[i];

    this.myOffers = [];
    this.hisOffers = []; // с его точки зрения
    this.offerCombinations = this.calcOfferCombinations();
    this.hisPriceCombinations = this.calcHisPriceCombinations();
  }

  calcOfferCombinations() {
    function generate(items, idx) {
      let result = [];

      for (let i = 0; i <= items[idx]; i++) {
        const newItems = Array.from(items);
        newItems[idx] = i;

        if (idx !== items.length - 1) {
          result.push(...generate(newItems, idx + 1));
        } else {
          result.push(newItems);
        }
      }

      return result;
    }

    // вычисляем все возможные комбинации предложений
    return generate(this.items, 0);
  }

  calcHisPriceCombinations() {
    function generate(prices, items, total, idx) {
      let result = [];

      for (let i = 0; i <= prices[prices.length - 1]; i++) {
        const newPrices = Array.from(prices);
        newPrices[idx] = i;

        if (idx !== prices.length - 1) {
          result.push(...generate(newPrices, items, total, idx + 1));
        } else {
          const sum = newPrices.reduce((accum, price, index) => {
            return accum + price * items[index];
          }, 0);

          if (sum === total) {
            result.push(newPrices);
          }
        }
      }

      return result;
    }

    return generate((new Array(this.items.length)).fill(this.total), this.items, this.total, 0);
  }

  calcHisPriceCombination(cutHisLastOffer) {
    let total = this.total;
    let collector = [];

    if (cutHisLastOffer) {
      this.hisOffers.pop();
    }

    while (total) {
      collector[total] = [];

      this.hisPriceCombinations.forEach(combination => {
        // складываем сюда суммы всех предложений, если они равны или меньше предыдущего
        let offersPrice = [];

        this.hisOffers.forEach((hisOffer, i) => {
          const sum = hisOffer.reduce((accum, items, i) => {
            return accum + (items * combination[i]);
          }, 0);

          if (sum >= total) {
            if (i > 0 && offersPrice[i - 1] >= sum) {
              offersPrice.push(sum);
            }
            if (i === 0) {
              offersPrice.push(sum);
            }
          }
        });

        if (offersPrice.length === this.hisOffers.length) {
          let discard = false;

          // в первом предложении не должно быть товаров с нулевой стоимостью,
          // с учетом этого отметаем лишние
          combination.forEach((price, i) => {
            if ((this.hisOffers[0][i] === 0 && price !== 0) || (this.hisOffers[0][i] !== 0 && price === 0)) {
              discard = true;
            }
          });

          if (!discard) collector[total].push(combination);
        }
      });

      total--;
    }

    let possibleCombination = {
      combinations: null,
      downgradePrice: null,
    };

    for (let i = collector.length - 1; i > 0; i--) {
      if (collector[i] && collector[i].length === 2) {
        possibleCombination.combinations = collector[i].slice();
        possibleCombination.downgradePrice = i;
        break;
      }
    }

    if (!possibleCombination.combinations) {
      for (let i = collector.length - 1; i > 0; i--) {
        if (collector[i] && collector[i].length === 1) {
          possibleCombination.combinations = collector[i].slice();
          possibleCombination.downgradePrice = i;
          break;
        }
      }
    }

    return possibleCombination;
  }

  calcMaxOffer() {
    const offer = this.items.slice();

    for (let i = 0; i < offer.length; i++) {
      if (!this.prices[i])
        offer[i] = 0;
    }

    return offer;
  }

  // so verbose, but clear
  calcOfferEqualToOrLessThanPreviousOne() {
    // отфильтруем те комбинации, в которых предлагается предмет,
    // имеющий для нас нулевую стоимость
    let offerCombinations = this.offerCombinations.filter(offer => {
      let keep = true;

      offer.forEach((item, i) => {
        if (item > 0 && this.prices[i] === 0)
          keep = false;
      });

      return keep;
    });

    // создадим массив объектов, который содержит и комбинацию, и общую стоимость
    const offerCombinationsWithPrices = offerCombinations.map((offer) => {
      return {
        offer,
        total: offer.reduce((accum, item, i) => {
          return accum + item * this.prices[i];
        }, 0)
      };
    });

    // сортируем offerCombinationsWithPrices в порядке уменьшения
    // стоимости предложения
    offerCombinationsWithPrices.sort((a, b) => {
      return b.total - a.total;
    });

    // делаем предложение в зависимости от номера хода
    const myOfferObj = offerCombinationsWithPrices[this.myOffers.length];

    if (!myOfferObj || (myOfferObj.total < (this.total / 2))) { // такого элемента может уже не быть
      const myOffer = this.myOffers[this.myOffers.length - 1];

      return myOffer;
    } else {
      return myOfferObj.offer;
    }
  }

  calcLastOffer() {
    // отфильтруем те комбинации, в которых предлагается предмет,
    // имеющий для нас нулевую стоимость
    let offerCombinations = this.offerCombinations.filter(offer => {
      let keep = true;

      offer.forEach((item, i) => {
        if (item > 0 && this.prices[i] === 0)
          keep = false;
      });

      return keep;
    });

    // отфильтровываем те предложения, в которых элементы для него равные нулю,
    // имеют не максимальное количество для нас
    const hisZeroPriceItems = [];
    this.hisOffers[0].forEach((item, i) => {
      if (item === 0) hisZeroPriceItems.push(i);
    });

    offerCombinations = offerCombinations.filter(offer => {
      let keep = true;

      offer.forEach((item, i) => {
        if (hisZeroPriceItems.includes(i)) {
          if (item !== this.items[i])
            keep = false;
        }
      });

      return keep;
    });

    // создадим массив объектов, который содержит и комбинацию, и общую стоимость
    const offerCombinationsWithPrices = offerCombinations.map((offer) => {
      return {
        offer,
        total: offer.reduce((accum, item, i) => {
          return accum + item * this.prices[i];
        }, 0)
      };
    });

    // сортируем offerCombinationsWithPrices в порядке уменьшения
    // стоимости предложения
    offerCombinationsWithPrices.sort((a, b) => {
      return b.total - a.total;
    });

    let myOfferObj = null

    for (let i = offerCombinationsWithPrices.length - 1; i >= 0; i--) {
      if (offerCombinationsWithPrices[i].total > this.total / 2) {
        myOfferObj = offerCombinationsWithPrices[i];
        break;
      }
    }

    if (!myOfferObj) {
      return this.calcMaxOffer();
    }

    return myOfferObj.offer;
  }

  calcBestPriceOffer(hisPrices) {
    // оставляем предлолжения, при которых наша прибыль будет больше или равной
    // его прибыли. из этих предложений составляем массив объектов, где будет храниться
    // само предложение, а также наша и его прибыль
    const diffPrices = [];
    let hisMaxTotal = 0;
    this.offerCombinations.forEach((combination) => {
      const myTotal = combination.reduce((accum, item, i) => {
        return accum + item * this.prices[i];
      }, 0);

      const hisTotal = combination.reduce((accum, item, i) => {
        return accum + (this.items[i] - item) * hisPrices[i];
      }, 0);

      if (myTotal - hisTotal >= 0) {
        if (hisTotal > hisMaxTotal) hisMaxTotal = hisTotal;

        diffPrices.push({ combination, totals: [myTotal, hisTotal] });
      }
    });

    // определяем наиболее выгодное для нас предложение, из наиболее выгодных для него
    let bestOffer = {
      combination: [],
      totals: [0, hisMaxTotal]
    };
    diffPrices.forEach((item) => {
      if (item.totals[1] === hisMaxTotal && item.totals[0] > bestOffer.totals[0]) {
        bestOffer = item;
      }
    });

    return bestOffer.combination;
  }

  calcBestPriceOfferForHim(hisPrices) {
    const diffPrices = [];
    let myMaxTotal = 0;
    this.offerCombinations.forEach((combination) => {
      const myTotal = combination.reduce((accum, item, i) => {
        return accum + item * this.prices[i];
      }, 0);

      const hisTotal = combination.reduce((accum, item, i) => {
        return accum + (this.items[i] - item) * hisPrices[i];
      }, 0);

      if (hisTotal - myTotal >= 0) {
        if (myTotal > myMaxTotal) myMaxTotal = myTotal;

        diffPrices.push({ combination, totals: [hisTotal, myTotal] });
      }
    });

    let bestOffer = {
      combination: [],
      totals: [0, myMaxTotal]
    };
    diffPrices.forEach((item) => {
      if (item.totals[1] === myMaxTotal && item.totals[0] > bestOffer.totals[0]) {
        bestOffer = item;
      }
    });

    return bestOffer.combination;
  }

  isGoodOffer(offer) {
    if (offer) {
      let sum = 0;
      offer.forEach((item, i) => sum += this.prices[i] * item);
      return sum === this.total || sum === this.total - 1;
    }

    return false;
  }

  addHisOffer(offer) {
    // переворачивает предложение в предложение с его стороны
    const hisOffer = this.items.map((item, i) => item - offer[i]);

    this.hisOffers.push(hisOffer);
  }

  offer(o) {
    this.roundsLeft--;

    if (o) {
      this.addHisOffer(o);

      if ((this.roundsLeft === (this.maxRounds - 1)) || (this.roundsLeft === (this.maxRounds - 2))) {
        if (this.isGoodOffer(o)) return;

        if (this.myOffers.length) {
          const offer = this.calcOfferEqualToOrLessThanPreviousOne();
          this.myOffers.push(offer);

          return offer;
        } else {
          const offer = this.calcMaxOffer(); this.myOffers.push(offer);

          return offer;
        }
      } else if (this.roundsLeft === 0) {
        if (this.me === 0) {
          const { combinations } = this.calcHisPriceCombination();

          if (combinations) {
            if (combinations.length === 2) {
              const offers = [];

              combinations.forEach((combination) => {
                const offer = this.calcBestPriceOffer(combination);

                offers.push(offer);
              });

              this.myOffers.forEach((myOffer) => {
                offers.forEach((offer, i) => {
                  if (myOffer.join('') === offer.join('')) {
                    offers.splice(i, 1);
                  }
                });
              });

              switch (offers.length) {
                case 2: return offers[1];
                case 1: return offers[0];
                case 0: return this.calcLastOffer();
              }
            }

            if (combinations.length === 1) {
              const offer = this.calcBestPriceOffer(combinations[0]);

              return offer;
            }
          } else {
            return this.calcLastOffer();
          }
        }

        if (this.me === 1) {
          const { combinations } = this.calcHisPriceCombination(true);

          if (combinations) {
            if (combinations.length === 2) {
              const offers = [];

              combinations.forEach((combination) => {
                const offer = this.calcBestPriceOfferForHim(combination);

                offers.push(offer);
              });

              let myBestTotal = Infinity; // хехе

              offers.forEach(offer => {
                const total = offer.reduce((accum, item, i) => {
                  return accum + item * this.prices[i];
                }, 0);

                if (total < myBestTotal) myBestTotal = total;
              });

              const myProposalTotal = o.reduce((accum, item, i) => {
                return accum + item * this.prices[i];
              }, 0);

              if (myProposalTotal >= myBestTotal && myProposalTotal > 1) return;
              return this.myOffers.pop();
            }

            if (combinations.length === 1) {
              const offer = this.calcBestPriceOfferForHim(combinations[0]);

              const myBestTotal = offer.reduce((accum, item, i) => {
                return accum + item * this.prices[i];
              }, 0);

              const myProposalTotal = o.reduce((accum, item, i) => {
                return accum + item * this.prices[i];
              }, 0);

              if (myProposalTotal >= myBestTotal && myProposalTotal > 1) return;
              return this.myOffers.pop();
            }
          } else {
            let sum = 0;
            o.forEach((item, i) => sum += this.prices[i] * item);

            // принимаем, если для нас оффер не меньше половины
            if (sum > this.total / 2) return;
            return this.myOffers.pop();
          }
        }
      } else {
        if (this.isGoodOffer(o)) return;

        const offer = this.calcOfferEqualToOrLessThanPreviousOne();

        const offerTotal = offer.reduce((accum, item, i) => {
          return accum + item * this.prices[i];
        }, 0);

        const oTotal = o.reduce((accum, item, i) => {
          return accum + item * this.prices[i];
        }, 0);

        if (this.me === 0) {
          if (oTotal >= offerTotal) return;
          return offer;
        }

        if (this.me === 1) {
          if (oTotal >= offerTotal) return;
          return offer;
        }
      }
    } else {
      // если мы здесь, то наша очередь первая и мы предлагаем предметы с
      // максимальной для нас стоимостью, но только те, что имеют ценность
      const offer = this.calcMaxOffer(); this.myOffers.push(offer);

      return offer;
    }
  }
};
