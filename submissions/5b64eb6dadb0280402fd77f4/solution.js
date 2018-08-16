module.exports = class {
	/**
	 * Constructor.
	 * @param me I make the first turn.
	 * @param counts Total amount of objects participating in haggling.
	 * @param values Cost of every object.
	 * @param max_rounds Number of rounds.
	 * @param log Log function.
	 * @constructor
	 */
	constructor(me, counts, values, max_rounds, log) {
		this.log = log || function () {
		};

		if (counts.length !== values.length) {
			throw new Error("Length of counts and values are different");
		}

		this.rounds = Number.parseInt(max_rounds, 10);
		if (Number.isNaN(this.rounds)) {
			throw new Error("Maximum rounds is not a number");
		} else if (this.rounds < 2) {
			throw new Error("Maximum rounds is lower than 2");
		}

		/**
		 * Get total cost of given set of objects.
		 * @param counts Set of objects.
		 * @returns {Number} Total cost calculated based on values.
		 */
		this.getTotalCostOf = (counts) => {
			return counts.reduce((accum, count, index) => accum + (count * values[index]), 0);
		};

		/**
		 * Storage of possible variants of objects with corresponding cost of each set.
		 * @param counts Total amount of objects participating in haggling.
		 * @param values Cost of every object.
		 * @param log Log function.
		 * @param getTotalCostOf Function that provides calculation of cost for given set.
		 * Must accept a set of objects.
		 * @constructor
		 */
		function Variants(counts, values, log, getTotalCostOf) {
			/**
			 * Get mapping where a key is total cost and a value is an array of
			 * possible sets of objects with this total cost.
			 * @returns {Object}
			 */
			function getTotalCostMapping() {
				/**
				 * Get all possible variants of objects.
				 * @returns {Array}
				 */
				function getVariants() {
					const alreadyStoredSets = {};
					const result = [];

					const calcVariants = (index, array) => {
						if (index >= counts.length) return;

						const nextIndex = index + 1;
						for (let i = 0; i <= counts[index]; i++) {
							const arrayCopy = array.slice();
							arrayCopy[index] = i;
							calcVariants(nextIndex, arrayCopy);

							if (alreadyStoredSets[arrayCopy]) continue; // do not store duplicates

							alreadyStoredSets[arrayCopy] = true;
							result.push(arrayCopy);
						}
					};

					calcVariants(0, Array.from({length: counts.length}, () => 0));
					return result;
				}

				/**
				 * Sort arrays by amount of object starting from a half.
				 * @param arrays Array of arrays of objects.
				 */
				function sortByAmount(arrays) {
					let objectsAmount = counts.reduce((accum, value) => accum + value, 0);
					let half = Math.floor(objectsAmount / 2);
					for (let arr of arrays) {
						arr.sort((arr1, arr2) => {
							const arr1Amount = arr1.reduce((accum, value) => accum + value, 0);
							const arr2Amount = arr2.reduce((accum, value) => accum + value, 0);
							return Math.abs(arr1Amount - half) - Math.abs(arr2Amount - half);
						})
					}
				}

				const mapping = {};
				const variants = getVariants();
				for (let objectsSet of variants) {
					let totalCost = getTotalCostOf(objectsSet);
					if (mapping[totalCost] === undefined) {
						mapping[totalCost] = [];
					}
					mapping[totalCost].push(objectsSet);
				}

				// Remove greedy option that doesn't give an opponent any object.
				mapping[totalCost].pop();
				// If after greedy option has been removed there are no items in array
				if (mapping[totalCost].length === 0) {
					// Remove this array.
					delete mapping[totalCost];
				}

				// Sort arrays by amount of objects in them descending.
				sortByAmount(Object.values(mapping));

				return mapping;
			}

			/**
			 * Get start index of a set of the current cost.
			 * @returns {Number}
			 */
			function getObjectsSetStartIndex() {
				const totalValue = totalCosts[totalCostIndex];
				return totalCostMapping[totalValue].length - 1;
			}

			let totalCostIndex = 0;
			let totalCost = getTotalCostOf(counts);

			let totalCostMapping = getTotalCostMapping();

			let totalCosts = Object.keys(totalCostMapping);
			// Sort descending, greater cost goes first.
			totalCosts.sort((a, b) => b - a);
			// Remove values which are lower than a half.
			let halfValue = totalCost / 2;
			totalCosts.length = totalCosts.findIndex((a) => a < halfValue);

			let objectsSetIndex = getObjectsSetStartIndex();

			log("totalCosts: " + totalCosts + " objectsSetIndex: " + objectsSetIndex);
			log("totalCostMapping: ");
			for (let totalCost in totalCostMapping) {
				log("	totalCost: " + totalCost);
				log("	" + totalCostMapping[totalCost].map((obj) => JSON.stringify(obj)));
			}

			return {
				/**
				 * Get current set of objects.
				 * @returns {Array}
				 */
				getCurrentObjectsSet: function () {
					return totalCostMapping[this.getCurrentTotalCost()][objectsSetIndex];
				},
				/**
				 * Set next set of objects as the current one.
				 * If all sets are exhausted it will start from the beginning.
				 */
				setNextObjectsSet: function () {
					function setNextTotalValue() {
						let nextIndex = totalCostIndex + 1;
						if (nextIndex >= totalCosts.length) {
							nextIndex = 0;
						}
						totalCostIndex = nextIndex;
					}

					let newIndex = objectsSetIndex - 1;
					if (newIndex < 0) {
						setNextTotalValue();
						newIndex = getObjectsSetStartIndex();
					}
					objectsSetIndex = newIndex;
				},
				/**
				 * Get current total cost as string.
				 * @returns {String}
				 */
				getCurrentTotalCost: function () {
					return totalCosts[totalCostIndex];
				}
			}
		}

		this.myTurn = me === 0;

		this.roundNumber = 1;
		this.opponentOffers = [];

		const totalValue = this.getTotalCostOf(counts);
		// Minimal acceptable value is a half of total value.
		this.minAcceptableValue = totalValue / 2;

		this.log("counts: " + counts + " values: " + values +
			" rounds: " + this.rounds + " totalValue: " + totalValue + " myTurn: " + this.myTurn);

		this.variants = new Variants(counts, values, this.log, this.getTotalCostOf);
	}

	/**
	 * Get offer.
	 * @param o Offer from an opponent.
	 * @return {Array|undefined} An array of objects that the script wants for itself.
	 * If the script accepts the offer from the opponent, then undefined is returned.
	 */
	offer(o) {
		if (this.roundNumber === 1) {
			if (o === undefined && !this.myTurn) {
				throw new Error("Incorrect game sequence. Opponent must make first turn");
			} else if (o !== undefined && this.myTurn) {
				throw new Error("Incorrect game sequence. I must make first turn");
			}
		} else if (o === undefined) {
			throw new Error("Opponent's offer is undefined but round number is " + this.roundNumber);
		}

		/**
		 * Check that given total totalCost is profitable at the current round.
		 * A cost is considered profitable if it is equal or greater than current total cost of
		 * object sets that are offered to an opponent.
		 * @param totalCost Cost to be checked for profitable.
		 * @return {Boolean} It is true if cost is profitable, false - otherwise.
		 */
		let isProfitable = (totalCost) => {
			const currentTotalCost = this.variants.getCurrentTotalCost();
			this.log("isProfitable totalCost: " + totalCost + " currentTotalCost: " + currentTotalCost);
			return totalCost >= currentTotalCost;
		};

		/**
		 * Get a set of objects that will be offered to an opponent at the current round.
		 * If no objects could be offered, undefined is returned.
		 * @return {Array|undefined}
		 */
		let getOffer = () => {
			let offer;
			if (this.roundNumber === this.rounds) {
				// If the last round.
				this.log("getOffer. Last round offer. " +
					"this.myTurn: " + this.myTurn);
				if (this.myTurn) {
					// If my turn then I should offer the most profitable
					// set that was offer by the opponent.

					// Sort opponent's offers. Sorting is considered to be stable.
					let orderedByProfit = this.opponentOffers.slice().sort((a, b) => {
						// By amount of objects ascending.
						return a.reduce((a1, a2) => a1 + a2) - b.reduce((b1, b2) => b1 + b2);
					}).sort((a, b) => {
						// By total cost for me ascending.
						return this.getTotalCostOf(a) - this.getTotalCostOf(b);
					});

					this.log("getOffer orderedByProfit:");
					orderedByProfit.map((objects, index) => this.log("			orderedByProfit[" + index + "]: " +
						objects));

					// Take the most profitable last proposed values.
					// At the current turn a value is considered as profitable if
					// it is greater than or equals to minimal acceptable value.
					offer = orderedByProfit.pop();
					this.log("getOffer offer: " + offer + " this.minAcceptableValue: " + this.minAcceptableValue);
					if (offer && this.getTotalCostOf(offer) >= this.minAcceptableValue) {
						// If the opponent didn't propose any sets that are greater than
						// a half for me I better end up with the game with 0/0.
						return offer;
					}
				} else {
					// Opponent made a non profitable offer at this round.
					// If I make a counter-offer we will end up the game with 0/0 so
					// I better accept if proposed set is equal to or greater than minimal acceptable value.
					// Otherwise it is better to end the game with 0/0.
					if (o && this.getTotalCostOf(o) >= this.minAcceptableValue) {
						return undefined;
					}
				}
			}
			offer = this.variants.getCurrentObjectsSet();
			this.variants.setNextObjectsSet();
			this.log("getOffer offer: " + offer);
			return offer;
		};

		this.log("offer rounds: " + this.rounds + " round number: " + this.roundNumber + " opponent offers: " + o);

		let offer;
		let offerCost = -1;

		if (o) {
			this.opponentOffers.push(o);
			offerCost = this.getTotalCostOf(o);

			this.log("Opponents's turn! this.myTurn: " + this.myTurn + " offerCost: " + offerCost);
		} else {
			this.log("My turn! this.myTurn: " + this.myTurn);
		}

		if (!isProfitable(offerCost)) {
			offer = getOffer();
		}

		if (offer === undefined) {
			this.log("accept: " + o + " value: " + (o ? this.getTotalCostOf(o) : 0));
		} else {
			this.log("offer: " + offer);
		}

		this.roundNumber += 1;
		return offer;
	}
};
