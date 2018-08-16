'use strict';

/**
 * Helpers
 */
class Helpers {
	/**
	 * Calculate current Offer
	 * @param offers
	 * @returns {number}
	 */
	getOfferedValue(offers) {
		return offers
			? offers.reduce((acc, item, index) => acc + item * this.values[index], 0)
			: 0;
	}

	/**
	 * Checkes whether 2 arrays are equal
	 * @param {number[]} arr1 first array
	 * @param {number[]} arr2 second array
	 * @returns {boolean}
	 */
	areTwoArraysEqual(arr1, arr2) {
		const [a,b,c] = arr1;
		const [x,y,z] = arr2;

		return a === x && b === y && c === z;
	}
}

/**
 * Calculates all possible offerings in the form of matrix
 */
class MatrixFactory extends Helpers{
	/**
	 * Creates matrix of oll posible solutions
	 * @returns {MatrixFactory}
	 */
	createMatrix() {
		const [firstVal, secondVal, thirdVal] = [...this.counts].map((count, index) => this.values[index] === 0 ? 0 : count);

		for(let i = 0; i <= firstVal; i++) {
			for(let j = 0; j <= secondVal; j++) {
				for(let k = 0; k <= thirdVal; k++) {
					this.matrix.push([i,j,k])
				}
			}
		}
		return this;
	}

	/**
	 * Randes matrix and deletes bad offerings
	 * @returns {MatrixFactory}
	 */
	rangeMatrix() {
		// удаляем я хочу все
		const currentMatrix = this.deleteIWantAll();
		// ранжируем по возрастанию
		const rangedMatrix = currentMatrix.sort((a,b) => this.getOfferedValue(b) -  this.getOfferedValue(a));
		//
		const tooLowValueIndex = rangedMatrix.findIndex(offer => this.getOfferedValue(offer) < this.lowestLevel);

		const optimalMatrix = rangedMatrix.slice(0, tooLowValueIndex || 1);
		this.rangedMatrix  = this.fillMatrixIfEmpty(optimalMatrix);

		return this;
	}

	/**
	 * Deletes from the matrix: 'I want all - you get nothing'
	 */
	deleteIWantAll() {
		return this.matrix.filter((combination) => !this.areTwoArraysEqual(this.counts, combination))
	}

	/**
	 * If matrix is too small -
	 * fill it up with the same answers in reversed order
	 * @param {array[]} optimalMatrix optimal matrix
	 * @returns {array[]}
	 */
	fillMatrixIfEmpty(optimalMatrix) {
		const copy = [...optimalMatrix];
		while(copy.length < this.rounds) {
			const reversed = [...copy].reverse();
			copy.push(...reversed);
		}

		return copy;
	}
}


/**
 * Agent accepts offer, analyzes it and return answer
 * @type {module.Agent}
 */
module.exports = class Agent extends MatrixFactory{
	constructor(me, counts, values, max_rounds, log) {

		super();

		this.me = me;
		this.counts = counts;
		this.values = values;
		this.totalRounds = max_rounds;
		this.rounds = max_rounds;
		this.log = log;
		this.total = this.getOfferedValue(counts);
		// сделанные нам предложения
		this.allOffers = [];
		// ценность предложений
		this.allOffersValues = [];
		// текущий раунд
		this.currentRound = 0;
		this.lowestLevel = Math.max(...this.values);

		this.myOffers = [];
		this.myOffersValues = [];

		this.matrix = [];
		this
			.createMatrix()
			.rangeMatrix();

		this.iAgree = false;
		this.iAgreeOnThisOffer = false;
	}


	offer(o) {
		return this
			.receive(o)
			.prepareMyOffer()
			.analyze()
			.reply();
	}

	receive(offer) {
		if (offer) {
			const currentValue = this.getOfferedValue(offer);
			this.allOffers.push(offer);
			this.allOffersValues.push(currentValue);
		}

		return this;
	}

	prepareMyOffer(o) {
		const nextMatrixOffer = this.rangedMatrix[this.currentRound];
		const nextValue = this.getOfferedValue(nextMatrixOffer);

		this.myOffers.push(this.rangedMatrix[this.currentRound++]);
		this.myOffersValues.push(nextValue);

		return this;
	}

	analyze() {
		const currentOponentOfferVal = this.allOffersValues.slice(-1)[0] || 0;
		const myCurrentVal = this.myOffersValues.slice(-1)[0];
		const maxOppOffer = Math.max(...this.allOffersValues);
		const isCurrentMaxOppOffer = currentOponentOfferVal >= maxOppOffer;
		const myMinOfferValue = Math.min(...this.myOffersValues);

		if (isCurrentMaxOppOffer && currentOponentOfferVal >= myMinOfferValue) {
			this.iAgree = true;
		}

		if (currentOponentOfferVal >= myCurrentVal && isCurrentMaxOppOffer) {
			this.iAgree = true;
		}

		const isMyCurrentLessHisMax = myCurrentVal <= maxOppOffer;
		if (isMyCurrentLessHisMax) {
			const hisBestOfferIndex = this.allOffersValues.findIndex((val) => val === maxOppOffer);
			this.iAgreeOnThisOffer = this.allOffers[hisBestOfferIndex];
		}

		return this;
	}

	reply() {
		if (this.iAgree) {
			return;
		}

		if (this.iAgreeOnThisOffer) {
			return this.iAgreeOnThisOffer;
		}
		return this.myOffers.slice(-1)[0];
	}
};