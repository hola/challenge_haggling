module.exports = class {
    constructor(me, counts, values, max_rounds, log){
        const value = getTotalValue(counts, values);
        this.game = new Game(counts, value, max_rounds);
        this.turn = me ? -1 : 0;

        this.player = new Player(me == 0, this.game, {
            values: values,
            wFeatures: [0.738,0.895,11.850,0.329,0.927,0.719,4.027,0.735,2.603,7.848,5.520,3.124,5.340,5.445],
        }) 
    }

    offer(o){
        this.turn++;
        return this.player.offer(o, this.turn).o;
    }
}

class Game {
	constructor(counts, value, duration) {
		this.counts = counts;
		this.value = value;
		this.duration = duration;
		this.totalCount = getTotalCount(this.counts);
		this.possibleValues = this.getPossibleValues();
		this.possibleOffers = this.getPossibleOffers();
	}

	getPossibleOffers(offer = [], i = 0) {
		let possibleOffers = [];
		let c = this.counts[i];
		if (i == this.counts.length) {
			return [offer];
		}
		for (let j = 0; j <= c; j++) {
			let offerCopy = [...offer];
			offerCopy[i] = j;
			possibleOffers = possibleOffers.concat(this.getPossibleOffers(offerCopy, i+1));
		}
		return possibleOffers;
	}

	getPossibleValues(totalVal = this.value, values = []) {
		const counts = this.counts;
		let possibleValues = [];
		if (values.length === counts.length - 1) {
			let v = totalVal / counts[counts.length-1];
			let valuesCopy = [...values];
			valuesCopy[counts.length - 1] = ~~v;
			return ~~v == v ? [valuesCopy] : [];
		} 
		const count = counts[values.length];
		const maxValue = ~~(totalVal/count);
		for (let i = 0; i <= maxValue; i++) {
			let valuesCopy = [...values];
			valuesCopy[values.length] = i;
			possibleValues = possibleValues.concat(this.getPossibleValues(totalVal-i*count, valuesCopy));
		}
		return possibleValues;
	}

}

const getTotalValue = (offer, values) => offer.reduce((mem,c,i) => mem + c * values[i], 0);
const getTotalCount = (counts) => counts.reduce((mem,c) => mem + c, 0);
const getOppositeOffer = (offer, counts) => counts.map((c,i) => c - (offer[i] || 0));

class Player {
	constructor(me, game, opt) {
		this.game = game;
		this.me = me;
		this.values = opt.values;

		this.p_opp = [];
		this.p_own = [];
		this.game.possibleValues.forEach((values, i) => {
			this.p_opp[i] = 1 / this.game.possibleValues.length;
			this.p_own[i] = 1 / this.game.possibleValues.length;
		});

		this.wFeatures = opt.wFeatures;
	}

	calcP_opp(o) {
		const {
			wList,
			totalWeight,
		} = this.rankValuesByOffer(o);
		let offerProbability = this.game.possibleValues.reduce((mem, values, i) => {
			return mem + this.p_opp[i] * wList[i]/totalWeight;
		}, 0);

		return this.game.possibleValues.map((values, i) => {
			return this.p_opp[i] * (wList[i]/totalWeight) / offerProbability;
		});
	}

	rankValuesByOffer(o) {
		let totalWeight = 0;
		let wList = this.game.possibleValues.map((values) => {
			const own = getOppositeOffer(o, this.game.counts);
			const ownValue = getTotalValue(own, values) / this.game.value;
			let w;
			if (!ownValue) {
				w = 0.001;
			}
			else if (ownValue < 0.4) {
				w = ownValue / this.wFeatures[2];
			}
			else if (ownValue < 0.6) {
				w = ownValue;
			}
			else if (ownValue < 0.8) {
				w = 1;
			}
			else {
				w = 1.8 - ownValue;
			}
			o.forEach((c, i) => {
				if (c == 0) {
					return;
				}
				let copyOwn = own.slice();
				copyOwn[i] = c - 1;
				const v = getTotalValue(copyOwn, values) / this.game.value;
				if (v == ownValue) {
					w = this.wFeatures[0] * w; // 0.5
				}
				else if (v + 1 == ownValue) {
					w = this.wFeatures[1] * w; // 0.8
				}
			});
			return w;
		});
		
		
		wList = wList.map(w => {
			totalWeight += w;
			return w;
		});

		return {
			wList,
			totalWeight,
		};
	}

	offer(o, turn) { // 0,1,2,3...duration
		this.turn = turn;
		const isLastTurn = turn == this.game.duration;
		const isLastWordByOp = isLastTurn && !this.me;
		const isLastWordByMe = isLastTurn && this.me;
		
		if (o !== undefined) {
			this.p_opp = this.calcP_opp(o);
			const offerAssessment = this.game.possibleValues.reduce((mem, values, i) => {
				let w = this.p_opp[i] > 0.01 ? this.acceptOffer(this.values, o, values, isLastWordByMe || isLastWordByOp, isLastWordByOp) : 0;
				return mem + w * this.p_opp[i];
			}, 0);
			
			if (isLastWordByMe || isLastWordByOp ? offerAssessment > this.wFeatures[3] : offerAssessment > this.wFeatures[4]) {
				return { o: undefined };
			}

		}
		let ownOffer = this.generateOffer(o);
		
		return { o: ownOffer };
	}

	acceptOffer(v_own, c_own, v_opp, lw, lo) { // lw - is last word, lo - is last offer. return from 1 (full accept) to 0 (totally reject)
		const c_opp = getOppositeOffer(c_own, this.game.counts);
		const ownValue = getTotalValue(c_own, v_own) / this.game.value;
		const oppValue = getTotalValue(c_opp, v_opp) / this.game.value;
		let offerWithMaxVal = {
			ownV: ownValue,
			oppV: oppValue,
		};
		this.game.possibleOffers.filter((oppC) => {
			const ownC = getOppositeOffer(oppC, this.game.counts);
			const ownV = getTotalValue(ownC, v_own) / this.game.value;
			const oppV = getTotalValue(oppC, v_opp) / this.game.value;
			if (ownV > ownValue && oppV >= oppValue && offerWithMaxVal.ownV < ownV) {
				offerWithMaxVal = { ownV, oppV, };
			}
		});

		let max = 0;
		let min = this.game.value;
		this.game.possibleValues.forEach(values => {
			const total = getTotalValue(c_opp, values);
			max = Math.max(max, total);
			min = Math.min(min, total);
		});

		if (max <= ownValue) {
			return 1;
		}

		if (ownValue >= this.wFeatures[5]) {
			return 1;
		}

		if (ownValue >= oppValue) {
			if (lw) {
				return ownValue >= 0.5 ? 1 : ownValue;
			}
			if (offerWithMaxVal.ownV > ownValue) {
				return Math.max(1 - 2 * (offerWithMaxVal.ownV - ownValue + offerWithMaxVal.oppV - oppValue), 0);
			}
			if (ownValue >= 0.5) {
				return Math.min(ownValue + (ownValue - oppValue), 1);
			}
		}
		if (ownValue >= 0.5) {
			if (lw) {
				if (oppValue - ownValue <= 0.4) {
					return Math.max(0, (this.wFeatures[6] - (oppValue - ownValue)));
				}
				else {
					return 0;
				}
			}
			else {
				return 0;
			}
		}

		if (lw) {
			if (oppValue - ownValue <= 0.4) {
				return Math.max(0, (this.wFeatures[7] - (oppValue - ownValue)));
			}
			else {
				return 0;
			}
		}
		else {
			return 0;
		}
	}

	filterPossibleOffers() {
		let possibleOffers = this.game.possibleOffers.filter((o) => {
			const ownValue = getTotalValue(o, this.values);

			return ownValue * 2 > this.game.value;
		});
		return possibleOffers;
	}

	getOfferWeight(c_own2, v_own, c_own1, v_opp, lw, lo) {
		const c_opp2 = getOppositeOffer(c_own2, this.game.counts);
		const ownValue = getTotalValue(c_own2, v_own) / this.game.value;
		const oppValue = getTotalValue(c_opp2, v_opp) / this.game.value;


		const ownOfferLWAssessment = this.acceptOffer(v_own, c_own2, v_opp, true, false);
		const ownOfferNotLWAssessment = this.acceptOffer(v_own, c_own2, v_opp, false, false);
		const ownTotalyAccept = ownOfferLWAssessment == 1;
		const ownPartAccept = ownOfferLWAssessment != 1 && ownOfferLWAssessment >= 0.5;
		const ownTotalyReject = ownOfferLWAssessment < 0.5;

		const oppOfferLWAssessment = this.acceptOffer(v_opp, c_opp2, v_own, true, false);
		const oppOfferNotLWAssessment = this.acceptOffer(v_opp, c_opp2, v_own, false, false);
		const oppTotalyAccept = oppOfferLWAssessment == 1;
		const oppPartAccept = oppOfferLWAssessment != 1 && oppOfferLWAssessment >= 0.5;
		const oppTotalyReject = oppOfferLWAssessment < 0.5;
		let w = 0;
		let k = this.wFeatures[8];

		if (ownTotalyAccept && oppTotalyAccept) {
			w = this.wFeatures[9] + ownValue + k * oppValue;
		}
		if (ownTotalyAccept && oppPartAccept) {
			w = this.wFeatures[10] + ownValue + k * oppValue;
		}
		if (ownPartAccept && oppTotalyAccept) {
			w = this.wFeatures[11] + ownValue + k * oppValue;
		}
		if (ownPartAccept && oppPartAccept) {
			w = this.wFeatures[12] + ownValue + k * oppValue;
		}
		if (ownTotalyAccept && oppTotalyReject) {
			w = this.wFeatures[13] + ownValue + k * oppValue;
		}
		if (ownTotalyReject && oppTotalyAccept) {
			w = 0 + ownValue + k * oppValue;
		}
		if (ownPartAccept && oppTotalyReject) {
			w = 1 + ownValue + k * oppValue;
		}
		if (ownTotalyReject && oppPartAccept) {
			w = 0 + ownValue + k * oppValue;
		}
		if (ownTotalyReject && oppTotalyReject) {
			w = 0;
		}

		if (ownOfferNotLWAssessment == 1) {
			//w += oppOfferNotLWAssessment == 1 ? 1 : 0.5;
		}
		else if (oppOfferNotLWAssessment == 1) {
		//	w -= 1;
		}
		return w;
	}

	generateOffer(c_own) {
		const isLastTurn = this.turn == this.game.duration;
		const isLastWordByOp = isLastTurn && !this.me;
		const isLastWordByMe = isLastTurn && this.me;

		let possibleOffers = this.filterPossibleOffers();

		let offersWithWeight = possibleOffers.map((c_own2) => {
			const w = this.game.possibleValues.reduce((mem, values, i) => {
				const offerW = this.p_opp[i] > 0.01 ? this.getOfferWeight(c_own2, this.values, c_own, values, isLastWordByMe, isLastWordByOp) : 0;
				return mem + offerW * this.p_opp[i];
			}, 0);
			return { w, o: getOppositeOffer(c_own2, this.game.counts), };
		});
		
		offersWithWeight.sort((a,b) => b.w - a.w);
		return offersWithWeight[0].o;
	}

}