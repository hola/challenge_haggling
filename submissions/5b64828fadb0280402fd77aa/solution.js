'use strict';

class Item
{
  constructor({ id, value, count }){
    this.id = id;
    this.value = value;
    this.count = count;
  }

  static createRootItem(){
    return new Item({ id: Item.ROOT_ID, value: -1, count: 1 });
  }
}
Item.ROOT_ID = -1;

// ======================================================================================

class Node
{
  static create(item, parent = null){
    return new Node({
      uid: ++Node.CURRENT_AVAILABLE_UID,
      item: item,
      parent: parent
    });
  }

  constructor({ uid, item, parent }){
    this.uid = uid;
    this.item = item;
    this.parent = parent;
    this.children = [];
  }

  get itemId(){ return this.item.id; }
  get itemValue(){ return this.item.value; }

  createChild(item){
    let child = Node.create(item, this);
    this.children.push(child);
    return child;
  }

  totalValue(){
    let total = this.itemValue,
        currentNode = this.parent;

    while (!currentNode.isRoot()){
      total += currentNode.itemValue;
      currentNode = currentNode.parent;
    }

    return total;
  }

  isRoot(){
    return this.parent == null;
  }

  ancestryItemIds(){
    let ancestry = [],
        currentNode = this;

    while (currentNode.itemId != -1){
      ancestry.unshift(currentNode.itemId);
      currentNode = currentNode.parent;
    }

    return ancestry;
  }

  print(){
    let depth = this.ancestryItemIds().length,
        tab = '';

    for (let i = 0; i < depth; i++) tab += '--';

    console.log(`${tab}(${this.itemId})\$${this.itemValue}`);
    this.children.forEach((child) => {
      child.print();
    });
  }
}
Node.CURRENT_AVAILABLE_UID = -1;

// ======================================================================================

class Tree
{
  constructor(root){
    this.root = root;
  }

  nodesWithTotalValue(value){
    this._targetValue = value;
    this._matchingNodes = [];

    this._findOn(this.root);
    return this._matchingNodes;
  }

  _findOn(node){
    node.children.forEach((child) => {
      let childTotalValue = child.totalValue();

      if (childTotalValue == this._targetValue)
        this._matchingNodes.push(child);
      else if (childTotalValue < this._targetValue)
        this._findOn(child);
    });
  }
}

// ======================================================================================

class TreeBuilder
{
  constructor(items){
    this.root = Node.create(Item.createRootItem());
    this.items = items;
  }

  build(){
    this._build(this.root);
    return new Tree(this.root);
  }

  _build(node){
    let childItems = this._validChildItemsFor(node);

    childItems.forEach((item) => {
      let child = node.createChild(item);
      this._build(child);
    });
  }

  _validChildItemsFor(node){
    let items = [];

    this.items.forEach((item) => {
      if (item.id == node.itemId || item.value == node.itemValue){
        let occurrence = this._getItemOccurrenceCountOnAncestry({ node, item }),
            remainingOccurrence = item.count - occurrence;

        if (remainingOccurrence > 0) items.push(item);
      }
      else if (item.value > node.itemValue){
        items.push(item);
      }
    });

    return items;
  }

  _getItemOccurrenceCountOnAncestry({ node, item }){
    let count = 0,
        currentNode = node;

    while (currentNode.parent != null){
      if ( item.id == currentNode.itemId ) count++;
      currentNode = currentNode.parent;
    }

    return count;
  }
}

// ======================================================================================

class Agent
{
  constructor(me, counts, values, maxRounds, log){
    this.isFirstPlayer = me == 0;
    this.log = log;
    this.roundsLeft = maxRounds;

    this.allCounts = counts;
    this.allValues = values;
    this.items = this._buildItems();
    this.maxValue = this._computeMaxValue();
    this.minValue = this._computeMinValue();
    this.value = this.maxValue;

    this.tree = (new TreeBuilder(this.items)).build();
  }

  offer(o){
    this.roundsLeft--;
    this.log(`Rounds Left: ${this.roundsLeft}`);

    this.hisOffer = o;
    this.value = this.maxValue;

    if (this.hisOffer){
      this.reward = this._rewardFrom(this.hisOffer);
      this.log(`Offer -> \$${this.reward} counts:[${this.hisOffer}]`);
      if (this.reward == this.value) return undefined;
    }

    if (this.roundsLeft == 0 && this.isFirstPlayer){
      this.value = this._finalValue();
      this.log(`Final counter. Set value to ${this.value}`);
    }

    let counteroffer =
      !this.lastCounteroffer ? this._maxCounteroffer() : this._counteroffer();
    this.log(`Counteroffer counts:[${counteroffer}]`);
    this.log(`Items - counts:[${this.allCounts}] values:[${this.allValues}]`);

    if (this._shouldAcceptOffer(counteroffer)) counteroffer = undefined;

    this.lastOffer = this.hisOffer;
    this.lastCounteroffer = counteroffer;
    return counteroffer;
  }

  _buildItems(){
    let items = [];

    for (let id = 0; id < this.allCounts.length; id++){
      items.push(
        new Item({
          id: id,
          value: this.allValues[id],
          count: this.allCounts[id]
        })
      );
    }

    return items;
  }

  _computeMaxValue(){
    return this.items.reduce((total, item) => (total + (item.count * item.value)), 0);
  }

  _computeMinValue(){
    return this.maxValue * Agent.MIN_VALUE;
  }

  _rewardFrom(offer){
    let total = 0;
    for (let id = 0; id < this.items.length; id++)
      total += this.items[id].value * offer[id];
    return total;
  }

  _finalValue(){
    if ( this.reward >= this.minValue )
      return this.reward + 2;
    else
      return this.minValue + 2;
  }

  _shouldAcceptOffer(counteroffer){
    // If counteroffer's reward is just the same as current reward
    if ( this._rewardFrom(counteroffer) == this.reward ) return true;

    // On last round, if it's my last chance to agree and reward is
    // acceptable
    if (
      (this.roundsLeft == 0) &&
      (this.reward >= (this.minValue - 1)) &&
      !this.isFirstPlayer
    ) return true;

    return false;
  }

  // Demand all items with non-zero value.
  _maxCounteroffer(){
    this.log('Generate Max Counteroffer');
    let counteroffer = [];

    this.items.forEach((item) => {
      let count = item.value > 0 ? item.count : 0;
      counteroffer[item.id] = count;
    });

    return counteroffer;
  }

  _counteroffer(){
    this.log('Generate Counteroffer');
    this.weights = this._computeWeights();
    this.totalWeight = this._computeTotalWeight();
    this.maxWeight = Math.round( this.totalWeight * Agent.MAX_WEIGHT );

    this.log(
      `Weights:[${this.weights}] ` +
      `Total:${this.totalWeight} ` +
      `Max:${this.maxWeight}`
    );

    let acceptedCandidate = this._generate();
    if (acceptedCandidate != null){
      this.log(
        `Accepted Candidate - w:${acceptedCandidate.weight} ` +
        `v:${acceptedCandidate.node.totalValue()}`
      );
      this.lastAcceptedCandidate = acceptedCandidate;
      return this._parse(acceptedCandidate);
    }

    this.log('No Accepted Candidate. Using last counteroffer made.');
    return this.lastCounteroffer;
  }

  _computeWeights(){
    let weights = [];

    for (let id = 0; id < this.items.length; id++){
      let item = this.items[id],
          myCount = this.hisOffer[id],
          opponentCount = item.count - myCount,
          weight = opponentCount / item.count;

      weights.push(weight);
    }

    return weights;
  }

  _computeTotalWeight(){
    let total = 0;
    for (let i = 0; i < this.items.length; i++)
      total += this.weights[i] * this.items[i].count;
    return total;
  }

  _parse(candidate){
    let myOffer = [],
        itemIds = candidate.node.ancestryItemIds();

    for (let i = 0; i < this.items.length; i++) myOffer[i] = 0;
    itemIds.forEach((id) => myOffer[id]++);

    return myOffer;
  }

  _generate(){
    this.value--;
    if (this.value < this.minValue) return this.topCandidate;

    this.log('----------------------------------------');
    this.log(`Finding Counter Offer - value:${this.value}`);

    let candidate = this._bestCandidate();

    if (candidate.node == null) return this._candidateForNextValue();

    if (!this._isBetterThanTopCandidate(candidate)) return this._generate();
    this.topCandidate = candidate;

    if (this._shouldGenerateAgain(candidate)) return this._generate();
    return this.topCandidate;
  }

  _bestCandidate(){
    let candidates = this.tree.nodesWithTotalValue(this.value),
        best = null,
        lowestWeight = this.totalWeight,
        highestNumOfItems = 0;

    candidates.forEach((node) => {
      let itemIds = node.ancestryItemIds(),
          numOfItems = itemIds.length,
          weight = itemIds.reduce((w, id) => (w + this.weights[id]), 0);

      this.log(`- items:${itemIds} weight:${weight}`);

      if (
        (weight == lowestWeight && numOfItems > highestNumOfItems) ||
        (weight < lowestWeight)
      ){
        best = node;
        lowestWeight = weight;
        highestNumOfItems = numOfItems;
      }
    });

    return { node: best, weight: lowestWeight };
  }

  _candidateForNextValue(){
    this.log('Nothing Found');
    if (this._isNextValueValid()) return this._generate();
    return this.topCandidate || null;
  }

  _isNextValueValid(){
    let nextValue = this.value - 1;
    this.log(`Value: next:${nextValue} min:${this.minValue}`);

    return nextValue >= this.minValue;
  }

  _isBetterThanTopCandidate(candidate){
    if (this.topCandidate == null) return true;

    return (
      //this.topCandidate.weight > candidate.weight &&
      !this._isRepeatTransaction(candidate)
    );
  }

  _isRepeatTransaction(candidate){
    if (!this.lastAcceptedCandidate || !this.lastOffer) return false;

    let isRepeat =
      (this.lastAcceptedCandidate.node.uid == candidate.node.uid) &&
      (this.lastOffer.join('') == this.hisOffer.join(''));

    this.log(`Is Repeat Transaction? ${isRepeat}`);
    return isRepeat;
  }

  _shouldGenerateAgain(candidate){
    let isNextValueValid = this._isNextValueValid(),
        isWeightInvalid = candidate.weight > this.maxWeight,
        again = isWeightInvalid && isNextValueValid;

    this.log(`Candidate -> w:${candidate.weight} max:${this.maxWeight}`);
    this.log(`Generate Again? ${again}`);
    return again;
  }
}

// in percent
Agent.MIN_VALUE = 50.0 / 100;
Agent.MAX_WEIGHT = 50.0 / 100;

module.exports = Agent;
