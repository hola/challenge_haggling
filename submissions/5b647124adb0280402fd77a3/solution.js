module.exports = class BestTrader {
  constructor(myTurnIsFirst, goodsCount, goodsValue, roundsCount, log){
    this.myTurnIsFirst = myTurnIsFirst;
    this.goodsCount = goodsCount;
    this.goodsValue = goodsValue;
    this.roundsCount = roundsCount;
    this.log = log;

    this.currentRound = -1;
    this.opponentGoodsDemandRateByRounds = this.getDefaultOpponentGoodsDemandRate(roundsCount, goodsCount.length);
    this.myGoodsDemandRate = this.getMyGoodsDemandRate(goodsValue);
  }

  getDefaultOpponentGoodsDemandRate(roundsLength, goodsLength) {
    return new Array(roundsLength).fill(new Array(goodsLength).fill(0));
  }

  getMyGoodsDemandRate(goodsValue) {
    const mostDemandGoodValue = Math.max(...goodsValue);
    const myGoodsDemandRate = goodsValue.map((value) => value / mostDemandGoodValue);
    
    return myGoodsDemandRate;
  }

  saveOpponentGoodsDemandRate(offeredGoodsCount) {
    this.opponentGoodsDemandRateByRounds[this.currentRound] = this.opponentGoodsDemandRateByRounds[this.currentRound]
      .map((_, index) => offeredGoodsCount[index] / this.goodsCount[index]);
  }

  getMinAcceptanceThreshold() {
    // mystic golden ratio ;)
    this.goldenRatio = 0.618;

    const bestPurpose = this.goodsCount.reduce((sum, goodCount, index) => sum + goodCount * this.goodsValue[index], 0);
    
    // Linear function, go throw points (maxX, maxY) and (0.618 * maxX, 0)
    const firstPartFunction = (roundNumber) => bestPurpose / this.roundsCount * (2 - goldenRatio) * (this.roundsCount - roundNumber) - (bestPurpose * (1 - goldenRatio));
    // Linear function, go throw points (0.618 * maxX, 0) and (0, minY)
    const secondPartFunction = (roundNumber) => (this.roundsCount * (1 - goldenRatio)) * roundNumber - bestPurpose;

    const calculateAcceptanceThreshold = (roundNumber) => (roundNumber / this.roundsCount) < this.goldenRatio
      ? firstPartFunction(roundNumber)
      : secondPartFunction(roundNumber);
    
    const tooLowPurpose = (calculateAcceptanceThreshold / bestPurpose) < 1 - goldenRatio;

    return tooLowPurpose ? bestPurpose * (1 - goldenRatio) : calculateAcceptanceThreshold;
  }

  getProfitAmount(offeredGoodsCount) {
    const goodsCountRemainingAfterOffer = this.goodsCount.map((count, index) => count - offeredGoodsCount[index]);
    const profitAmount = goodsCountRemainingAfterOffer.reduce((sum, goodCount, index) => sum + goodCount * this.goodsValue[index], 0);

    return profitAmount;
  }

  getDummyBestPurpose() {
    const mostCheepGood = Math.min(...this.goodsValue);
    const mostCheepGoodIndex = this.goodsValue.findIndex(goodValue => goodValue === mostCheepGood);
    const getDummyBestPurpose = this.goodsCount.map((value, index) => index === mostCheepGoodIndex ? value - 1 : value);

    return getDummyBestPurpose;
  }

  getInverseOffer() {
    const actualOpponentGoodsDemandRate = this.getActualOpponentGoodsDemandRate();

    // 2 - best for me and worth for opponent, 0 best for opponent and worthless for me
    const RANGE = 2;
    const resultGoodsRate = actualOpponentGoodsDemandRate.map((value, index) => this.myGoodsDemandRate[index] - value + 1);
    
    const inverseOffer = resultGoodsRate.map((rate, index) => {
      const roughAmountOfGoods = this.goodsCount[index] * rate / RANGE;

      return Math.round(roughAmountOfGoods);
    });

    return inverseOffer;
  }

  getActualOpponentGoodsDemandRate() {
    const actualOpponentGoodsDemandRate = [];

    for (let goodIndex = 0; goodIndex <= this.goodsCount.length; goodIndex++) {
      let totalGoodValue = 0;

      for (let roundIndex = 0; roundIndex <= this.currentRound; roundIndex++) {
        totalGoodValue += opponentGoodsDemandRateByRounds[round][goodIndex];
      }

      actualOpponentGoodsDemandRate.push(totalGoodValue / this.currentRound);
    }

    return actualOpponentGoodsDemandRate;
  }

  offer(offeredGoodsCount) {
    this.currentRound += 1;

    const isOpenOffer = this.myTurnIsFirst && this.currentRound === 0;
    const isFinalOffer = !this.myTurnIsFirst && this.roundsCount === this.currentRound;

    if (isOpenOffer || isFinalOffer) {
      return this.getDummyBestPurpose();
    } else {
      this.saveOpponentGoodsDemandRate(offeredGoodsCount);

      const minAcceptanceThreshold = this.getMinAcceptanceThreshold();
      const profitAmount = this.getProfitAmount(offeredGoodsCount);

      if (profitAmount > minAcceptanceThreshold) {
        return undefined;
      } else {
        return this.getInverseOffer();
      }
    }
  }
}
