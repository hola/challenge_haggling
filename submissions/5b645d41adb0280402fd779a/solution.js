// Copyright 2018 Alexander Volkov<alx.volkov@gmail.com>

'use strict'; /*jslint node:true*/

// configuration
const version = 'Agent 1.5.0';
const epsilon = 0.05;
const minAcceptanceRate = 0.5; // [0, 1]
const preferableAcceptanceRate = 0.8; // [0, 1]

module.exports = 
class Agent 
{
  constructor(me, counts, values, max_rounds, log)
  {
    const self = this;

    this._isGoodInput = false;
    this._log = log;

    this._isGoodInput = this.checkInput(me, counts, values, max_rounds);
    this._offerStorage = new OfferStorage();
    this.state = createStateRecord((me == 0), counts, values, max_rounds, 0);
    this.log(`\n${this.state}`);

    const stars = new Stars([Math.random(), Math.random(), Math.random()]);
    
    this._adviser = new Robot(stars, this.state, this._offerStorage, (message) => self.log(message));

    this._offerStorage.setCombinations(this.createCombinations());
  }
  offer(o)
  {
    if (!this._isGoodInput)
    {
      const error = 'Exit: bad input';
      this.log(error);
      throw error;
    }
    this.state.currentRound++;
    if (this.state.currentRound > this.state.maxRounds)
    {
      const error = `Exit: round number > ${this.state.maxRounds}`;
      this.log(error);
      throw error;
    }
    this.log(`round ${this.state.currentRound}, ${this.getRoundsLeft()} round${this.getRoundsLeft() == 1 ? '' : 's'} left`);
    return this.handler(o);
  }

  // private
  handler(offer)
  {
    if (this.isOffer(offer))
    {
      const offerValue = countTotalValue(offer, this.state.interestValues);
      this._offerStorage.save(createOfferRecord(this.state, offer, offerValue, this.state.currentRound, false));
      this.log(`Incoming offer: ${offer.toString()}, value is $${offerValue}`);
      return this.makeChoise(offer);
    }
    else
    {
      if (this.state.isFirst && this.state.currentRound == 1)
      {
        this.log('I start');
      }
      else
      {
        this.log(`Incoming offer is bad: ${offer}`);
      }
      return this.makeChoise(undefined);
    }
  }
  makeChoise(offer)
  {
    this._adviser.newRound();
    const advice = this._adviser.advice();
    this.log(`Advice: ${advice}`);
    if (epsilonGreater(advice.acceptanceRate, preferableAcceptanceRate, epsilon))
    {
      return undefined;
    }
    if (offer != undefined && equalOffers(offer, advice.offer))
    {
      return undefined;
    }
    const offerValue = countTotalValue(advice.offer, this.state.interestValues);
    this._offerStorage.save(createOfferRecord(this.state, advice.offer, offerValue, this.state.currentRound, true));
    return advice.offer;
  }
  getRoundsLeft()
  {
    return this.state.maxRounds - this.state.currentRound;
  }
  isOffer(offer)
  {
    let isOffer = false;
    if (Array.isArray(offer))
    {
      this.log(`Offer ${offer.toString()}`);
      if (offer.length != this.state.numberOfInterestTypes)
      {
        this.log(`Bad offer. offer.length != ${this.state.numberOfInterestTypes}`);
      }
      else
      {
        for (let i = 0; i < offer.length; i++)
        {
          if (offer[i] < 0)
          {
            this.log(`Bad offer. offer[${i}] < 0`);
            break;
          }
          if (offer[i] > this.state.interestCounts[i])
          {
            this.log(`Bad offer. offer[${i}] has more than exist: ${this.state.interestCounts[i]}`);
            break;
          }
          isOffer = (i == offer.length - 1);
        }
      }
    }
    else
    {
      this.log('Not offer');
    }
    return isOffer;
  }
  checkInput(me, counts, values, max_rounds)
  {
    let bOk = true;
    bOk &= this.checkMe(me);
    bOk &= this.checkCountsAndValuesLength(counts, values);
    bOk &= this.checkValuesAreGood(counts, 'counts');
    bOk &= this.checkValuesAreGood(values, 'values');
    bOk &= this.checkMaxRounds(max_rounds);
    return bOk;
  }
  checkMe(me)
  {
     const self = this;
     return this.check(() => (me == 0 || me == 1)
            , () => self.log(`"me" has incorrect value: ${me}`)
            ); 
  }
  checkCountsAndValuesLength(counts, values)
  {
     const self = this;
     return this.check(() => (counts.length == values.length)
            , () => self.log(`"counts" and "values" have different length: counts.length=${counts.length}, values.length=${values.length}`)
            );
  }
  checkValuesAreGood(values, valuesLabel)
  {
     const self = this;
     return this.check(() =>
            {
              for (let i = 0; i < values.length; i++)
              {
                if (values[i] < 0)
                {
                  return false;
                }
              }
              return true;
            }
            , () => self.log(`"${valuesLabel}" contains incorrect values: ${values.toString()}`)
            );
  }
  checkMaxRounds(max_rounds)
  {
     const self = this;
     return this.check(() => (max_rounds > 0)
            , () => self.log(`"max_rounds" has to be > 0, ${max_rounds} given`)
            );
  }
  createCombinations()
  {
    const combinations = [];
    let currentOffer = createGreedOffer(this.state.interestCounts, this.state.interestValues);
    let currentTotalValue = countTotalValue(currentOffer, this.state.interestValues);
    while (currentTotalValue > 0)
    {
      combinations.push(createOfferRecord(this.state, currentOffer.slice(0), currentTotalValue, 0, true));
      substractOneWithLessValueFrom(currentOffer, this.state.interestValues);
      currentTotalValue = countTotalValue(currentOffer, this.state.interestValues);
    }
    return combinations;
  }
  log(message)
  {
    if (!this._isGoodInput)
    {
      message = `BAD INPUT / ${message}`;
    }
    this._log(`${version} / ${message}`);
  }
  check(checkFunc, onFail)
  {
    const checkResult = checkFunc();
    if (!checkResult)
    {
      onFail();
    }
    return checkResult;
  }
};

// infrastructure

// answer advisers
class Adviser
{
  constructor(strName, state, offerStorage, log)
  {
    this.name = strName;
    this.offerStorage = offerStorage;
    this._log = log;
    this.state = state;
  }
  newRound()
  {
    this.incomingOffer = this.offerStorage.getRoundIncoming(this.state.currentRound);
    this.bestIncomingOffer = this.offerStorage.getBestIncoming();
    this.bestMineOffer = this.offerStorage.getBestMine();

    this.isBestOffer = this.isBestIncommingOffer();
    if (this.isBestOffer)
    {
      this.log(`best incoming offer so far`);
    }
  }
  log(message)
  {
    this._log(`${this.name}: ${message}`);
  }
 
  advice() {}

  estimatePartnerValues()
  {
    const totalValue = this.state.totalValue;
    const interestCounts = this.state.interestCounts;
    const partnerOffers = this.offerStorage.getPartners();
    let offersTotal = createZeroOffer(this.state.numberOfInterestTypes);
    for (let i = 0; i < partnerOffers.length; i++)
    {
      const offer = partnerOffers[i];
      offersTotal = sumOffers(offersTotal, offer.complement);
    }
    const base = offersTotal.reduce((a, b) => a + b, 0);
    const estimatedValues = offersTotal.map((x, i) => (totalValue * (x / base) / interestCounts[i]));
    this.log(`Estimation: ${estimatedValues}`);
    return estimatedValues;
  }

  isBestIncommingOffer()
  {
    if (this.incomingOffer && this.bestIncomingOffer)
    {
      return (this.incomingOffer.value == this.bestIncomingOffer.value);
    }
    return false;
  }
  howIncomingOfferIsGood()
  {
    if (this.incomingOffer)
    {
      return this.howGood(this.incomingOffer.value);
    }
    return 0;
  }
  howGood(value)
  {
    return norm(value, this.state.totalValue);
  }
}

class Robot extends Adviser
{
  constructor(stars, state, offerStorage, log) 
  { 
    super('Robot', state, offerStorage, log);
    const brain = new Brain(this.state, offerStorage, log);
    this._advisers = [brain];
    stars.add(brain.name, [-0.2, 0.2])
         ;
    this._predictions = stars.predictions();
    this.log(`Predictions: ${this._predictions}`);
  }
  newRound()
  {
    super.newRound();
    for (let i = 0; i < this._advisers.length; i++)
    {
      this._advisers[i].newRound();
    }
  }
  advice()
  {
    let bestAdvice = undefined;
    for (let i = 0; i < this._advisers.length; i++)
    {
      const adviser = this._advisers[i];
      const advice = adviser.advice();
      advice.acceptanceRate += this._predictions[adviser.name];
      if (bestAdvice == undefined)
      {
        bestAdvice = advice;
      }
      else
      {
        if (advice.acceptanceRate > bestAdvice.acceptanceRate)
        {
          bestAdvice = advice;
        }
      }
    }
    return bestAdvice;
  }
}

class Brain extends Adviser
{
  constructor(state, offerStorage, log)
  { 
    super('Brain', state, offerStorage, log);
    this.myBestPossibleOfferSoFar = createGreedOffer(this.state.interestCounts, this.state.interestValues);
  }
  newRound()
  {
    super.newRound();
  }
  advice()
  {
    if (this.state.IsFirst || this.state.currentRound == 1)
    {
      this.log('ask all, lets see the response and collect some stats');
      return createAdviceRecord(0, this.myBestPossibleOfferSoFar);
    }

    const trend = this.whatIsTheTrend();
    this.log(`Trend: ${trend}`);
    
    const howGood = this.howIncomingOfferIsGood();
    const acceptanceRate = howGood;
    let offerToAdvice = undefined;

    if (epsilonGreater(howGood, minAcceptanceRate, epsilon))
    {
      this.log('offer not bad');
      if (epsilonGreater(howGood, preferableAcceptanceRate, epsilon))
      {
        this.log('offer is quite good');
        if (this.isLastRound() && this.isBestOffer)
        {
          this.log('it is the best incomming to go with');
          offerToAdvice = this.incomingOffer.source;
        }
        else
        {
          if (this.isLastRound())
          {
            this.log('its good to accept');
            offerToAdvice = this.incomingOffer.source;
          }
          else
          {
            if (epsilonGreater(howGood, 1, epsilon))
            {
              this.log('ideal!');
              offerToAdvice = this.incomingOffer.source;
            }
            else
            {
              this.log('hmm... lets ask the best already offered');
              offerToAdvice = this.bestIncomingOffer.source;
            }            
          }
        }
      }
      else
      {
        if (!this.isLastRound())
        {
          if (this.isGoodTrend(trend))
          {
            this.log('good trends... lets try to give them a small piece');
            substractOneWithLessValueFrom(this.myBestPossibleOfferSoFar, this.state.interestValues);            
            offerToAdvice = this.myBestPossibleOfferSoFar;
            const bestPartnerOfferAcceptanceRate = this.howGood(this.bestIncomingOffer.value);
            if (bestPartnerOfferAcceptanceRate > this.howGood(countTotalValue(this.myBestPossibleOfferSoFar)))
            {
              offerToAdvice = this.bestIncomingOffer.source;
            }
          }
          else
          {
            this.log('trends negative');
            // later...
          }
        }
        else
        {
          this.log('last round needs a special handling');
          // later...
        }
      }
    }
    
    if (this.isLastRound() && offerToAdvice == undefined)
    {
      const howBestIncommingGood = this.howGood(this.bestIncomingOffer.value);
      if (epsilonGreater(howBestIncommingGood, minAcceptanceRate, epsilon))
      {
        this.log('lets ask for the best already offered');
        offerToAdvice = this.bestIncomingOffer.source;
      }
      else
      {
        this.log('even best offer is not good... all or nothing... lets offer something');
        // later...
      }
    }

    if (offerToAdvice == undefined)
    {
      this.log('find best intersection...');
      offerToAdvice = this.findBestIntersection(this.estimatePartnerValues(), preferableAcceptanceRate);
    }

    return createAdviceRecord(acceptanceRate, offerToAdvice);
  }
  // private
  isGoodTrend(trend)
  {
    return trend.middleTrend > 0;
  }
  whatIsTheTrend()
  {
    const partnerOffers = this.offerStorage.getPartners();
    return createTrendRecord(partnerOffers.map((x) => x.value));
  }
  isLastRound()
  {
    return (this.roundsLeft() == 0);
  }
  roundsLeft()
  {
    return (this.state.maxRounds - this.state.currentRound);
  }
  findBestIntersection(partnerValues, acceptanceRate)
  {
    let intersectionOffer = undefined;
    const bestOffers = this.offerStorage.getBestCandidatesOrderedByValueDescending(this.state, acceptanceRate);
    this.log(bestOffers);
    for (let i = 0 ; i < bestOffers.length; i++)
    {
      intersectionOffer = bestOffers[i];
      if (this.offerStorage.isAlreadyOfferedByMe(intersectionOffer))
      {
        continue;
      }
      const partnerCounts = intersectionOffer.complement;
      const partnerTotalValue = countTotalValue(partnerCounts, partnerValues);
      if (epsilonGreater(partnerTotalValue, minAcceptanceRate, epsilon))
      {
        break;
      }
    }
    return intersectionOffer.source;
  }
}

// astrology
class Stars
{
  constructor(auspices)
  {
    this._data = {};
    this.acceptAuspices(auspices);
  }
  acceptAuspices(auspices)
  {
    this._auspices = auspices;
  }
  getAuspice()
  {
    return this._auspices[getRandomInt(0, this._auspices.length)];
  }
  add( strKey, range)
  {
    this._data[strKey] = range;
    return this;
  }
  predictions()
  {
    const response = {};
    for (let property in this._data)
    {
      if (this._data.hasOwnProperty(property))
      {
        const range = this._data[property];
        const min = range[0];
        const max = range[1];
        response[property] = getRandom(min, max, this.getAuspice()); 
      }
    }
    return response;
  }
}

// offer record storage
class OfferStorage
{
  constructor()
  {
    this._data = [];
    this.setCombinations([]);
  }

  setCombinations(combinations)
  {
    this._combinations = combinations;
  }
  getBestCandidatesOrderedByValueDescending(state, acceptanceRate)
  {
    return this.getCombinations((x) => epsilonGreater(norm(x.value, state.totalValue)
                                                      , acceptanceRate
                                                      , epsilon
                                                      )
                                , this.sortValueDesc
                                );
  }
  getCombinations(whereFunc, sortFunc)
  {
    return this.get(this._combinations, whereFunc, sortFunc);
  }

  save(record)
  {
    this._data.push(record);
  }

  getRoundIncoming(nRound)
  {
    return this.getPartners().find((x) => (x.round == nRound));
  }
  getBestIncoming()
  {
    return this.getPartners(this.sortValueDesc).find((x) => true);
  }
  getBestMine()
  {
    return this.getMine(this.sortValueDesc).find((x) => true);
  }
  getMine(sortFunc)
  {
    return this.getSome((x) => x.isMine, sortFunc);
  }
  getPartners(sortFunc)
  {
    return this.getSome((x) => !x.isMine, sortFunc);
  }

  isAlreadyOfferedByMe(offer)
  {
    return (this.getSome((x) => x.isMine && equalOffers(x.source, offer.source)).length > 0);
  }

  getSome(whereFunc, sortFunc)
  {
    return this.get(this._data, whereFunc, sortFunc);
  }
  get(data, whereFunc, sortFunc)
  {
    let result = data;
    if (whereFunc != undefined)
    {
      result = result.filter(whereFunc);
    }
    if (sortFunc != undefined)
    {
      result = result.sort(sortFunc);
    }
    return result.slice(0);
  }
  sortValueDesc(x, y)
  {
    return (y.value - x.value);
  }
}

// record factories
function createStateRecord(isFirst, interestCounts, interestValues, nMaxRounds, nCurrentRound)
{
  return {
    isFirst: isFirst
    , numberOfInterestTypes: interestCounts.length
    , interestCounts: interestCounts
    , interestValues: interestValues
    , totalValue: countTotalValue(interestCounts, interestValues)
    , maxRounds: nMaxRounds
    , currentRound: nCurrentRound
  };
}
function createOfferRecord(state, source, nValue, nRound, isMine)
{
    return {
      source: source
      , complement: getOfferComplement(source, state.interestCounts)
      , value: nValue
      , round: nRound
      , isMine: isMine
    };
}
function createTrendRecord(values)
{
  let ups = 0;
  let downs = 0;
  let longTerm = 0;
  let middleTerm = 0;
  let shortTerm = 0;
  if (values.length > 0)
  {
    const lastIndex = values.length - 1;
    const middleIndex = Math.floor(values.length / 2);
    const lastValue = values[lastIndex];
    longTerm = lastValue - ((lastIndex > 1) ? values[0] : 0);
    middleTerm = lastValue - ((middleIndex == lastIndex) ? 0 : values[middleIndex]);
    shortTerm = lastValue - ((lastIndex > 1) ? values[lastIndex - 1] : 0);
    for (let i = 0; i < values.length; i++)
    {
      if (i == 0)
      {
        continue;
      }
      if (values[i] > values[i - 1])
      {
        ups++;
      }
      else
      if (values[i] < values[i - 1])
      {
        downs++
      }
    }
  }
  return {
      ups: ups
      , downs: downs
      , longTerm: longTerm
      , middleTerm: middleTerm
      , shortTerm: shortTerm
    };
}
function createAdviceRecord(nAcceptanceRate, offer)
{
  return {
      acceptanceRate: nAcceptanceRate
      , offer: offer
    };
}

// input utils
function countTotalValue(counts, values)
{
  let nTotalValue = 0;
  for (let i = 0; i < counts.length; i++)
  {
    nTotalValue += counts[i] * values[i];
  }
  return nTotalValue;
}
function createZeroOffer(numberOfInterestTypes)
{
  return new Array(numberOfInterestTypes).fill(0);
}
function createGreedOffer(counts, values)
{
  const source = [];
  for (let i = 0; i < values.length; i++)
  {
    source[i] = (values[i] > 0) ? counts[i] : 0;
  }
  return source;
}
function equalOffers(offerA, offerB)
{
  for (let i = 0; i < offerA.length; i++)
  {
    if (offerA[i] != offerB[i])
    {
      return false;
    }
  }
  return true;
}
function getOfferComplement(offer, interestCounts)
{
  const resultOffer = [];
  for (let i = 0; i < offer.length; i++)
  {
    resultOffer[i] = interestCounts[i] - offer[i];
  }
  return resultOffer; 
}
function sumOffers(offerA, offerB)
{
  const resultOffer = [];
  for (let i = 0; i < offerA.length; i++)
  {
    resultOffer[i] = offerA[i] + offerB[i];
  }
  return resultOffer;
}
function substractOneWithLessValueFrom(offer, values)
{
  let nMinValue = 0;
  let nMinIndex = NaN;
  for (let i = 0; i < offer.length; i++)
  {
    if (offer[i] < 1)
    {
      continue;
    }
    if (values[i] > nMinValue)
    {
      nMinValue = values[i];
      nMinIndex = i;
    }
  }
  if (nMinIndex != NaN)
  {
    offer[nMinIndex]--;
    return true;
  }
  return false;
}

// math utils
function norm(value, standard)
{
  return value / (standard == 0 ? 1 : standard);
}
function getRandomInt(min, max, random)
{
  return Math.floor(getRandom(Math.floor(min), Math.floor(max), random));
}
function getRandom(min, max, random)
{
  if (random == undefined)
  {
    random = Math.random();
  }
  return (min + random * (max - min));
}

// epsilon comparisions
function epsilonEquals(value, standard, epsilon)
{
  const minGood = standard - epsilon;
  const maxGood = standard + epsilon;
  return (epsilonGreater(value, standard, epsilon) && epsilonLower(value, standard, epsilon));
}
function epsilonGreater(value, standard, epsilon)
{
  const minGood = standard - epsilon;
  return (value >= minGood);
}
function epsilonLower(value, standard, epsilon)
{
  const maxGood = standard + epsilon;
  return (value <= maxGood);
}

// log simplify
Array.prototype.toString = function()
{
  return `[${this.join(', ')}]`;
}
Object.prototype.toString = function()
{
  let result = '';
  let index = 0;
  for (let property in this)
  {
    if (this.hasOwnProperty(property))
    {
      result = `${result}${index == 0 ? '' : ', '}${property}: ${this[property]}`;
      index++;
    }
  }
  return `{${result}}`;
}