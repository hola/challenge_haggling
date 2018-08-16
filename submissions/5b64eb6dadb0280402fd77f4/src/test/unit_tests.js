let assert = require("assert");
let appCls = require("../src/challenge_haggling");
let commonTestData = [0, [1, 2], [1, 2], 5, console.log];

describe("Instance creation", function () {
	it("should be created with expected properties", function () {
		const app = new appCls(0, [1, 2], [0, 2], 5, console.log);

		assert.equal(app.log, console.log);
		assert.equal(app.myTurn, true);
		assert.equal(app.rounds, 5);
		assert.equal(app.roundNumber, 1);
		assert.deepStrictEqual(app.variants.getCurrentTotalCost(), "4");
		assert.deepStrictEqual(app.variants.getCurrentObjectsSet(), [0, 2]);
	});

	it("should iterate over all object sets", function () {
		const app = new appCls(0, [1, 2, 3], [1, 2, 3], 5, console.log);

		let sets = {};
		let totalValues = [];
		let objectSets = {};
		do {
			let totalValue = app.variants.getCurrentTotalCost();

			if (!totalValues.find((value) => value === totalValue)) {
				totalValues.push(totalValue);
			}
			const currentObjects = app.variants.getCurrentObjectsSet();
			if (objectSets[currentObjects]) break;

			if (sets[totalValue] === undefined) {
				sets[totalValue] = [];
			}
			sets[totalValue].push(currentObjects);
			objectSets[currentObjects] = true;
			app.variants.setNextObjectsSet();
		} while (true);

		assert.deepStrictEqual(sets, {
			// It starts from the half of maximum values which is 14 / 2 = 7
			"7": [
				[1, 0, 2],
				[0, 2, 1]
			],
			"8": [
				[1, 2, 1],
				[0, 1, 2]
			],
			"9": [
				[1, 1, 2],
				[0, 0, 3]
			],
			"10": [
				[1, 0, 3],
				[0, 2, 2]
			],
			"11": [
				[1, 2, 2],
				[0, 1, 3]
			],
			"12": [
				[1, 1, 3]
			],
			"13": [
				[0, 2, 3]
			]
			// 14 is maximum and is not included, because it has only greedy set
		});

		assert.deepStrictEqual(totalValues, ["13", "12", "11", "10", "9", "8", "7"])
	});

	it("should sort objects amount from a half of total amount (bottom to up)", function () {
		const app = new appCls(0, [1, 9], [10, 0], 5, console.log);

		let sets = {};
		let totalValues = [];
		let objectSets = {};
		do {
			let totalValue = app.variants.getCurrentTotalCost();

			if (!totalValues.find((value) => value === totalValue)) {
				totalValues.push(totalValue);
			}
			const currentObjects = app.variants.getCurrentObjectsSet();
			if (objectSets[currentObjects]) break;

			if (sets[totalValue] === undefined) {
				sets[totalValue] = [];
			}
			sets[totalValue].push(currentObjects);
			objectSets[currentObjects] = true;
			app.variants.setNextObjectsSet();
		} while (true);

		assert.deepStrictEqual(sets, {
			"10": [
				[1, 8],
				[1, 0],
				[1, 7],
				[1, 1],
				[1, 6],
				[1, 2],
				[1, 5],
				[1, 3],
				[1, 4]
			]
		});

		assert.deepStrictEqual(totalValues, ["10"])
	});

	it("should not accept different sized array", function () {
		assert.throws(() => {
			new appCls(0, [1, 2, 3], [1, 2], 5, console.log);
		}, new Error("Length of counts and values are different"));
	});

	it("should not accept maximum rounds as not a number", function () {
		assert.throws(() => {
			new appCls(0, [1, 2, 3], [1, 2, 3], 't', console.log);
		}, new Error("Maximum rounds is not a number"));
	});

	it("should not accept maximum rounds as not a number", function () {
		assert.throws(() => {
			new appCls(0, [1, 2, 3], [1, 2, 3], 0, console.log);
		}, new Error("Maximum rounds is lower than 2"));
	});
});

describe("getTotalCostOf", function () {
	it("should return maximum value", function () {
		const app = new appCls(...commonTestData);
		assert.equal(
			app.getTotalCostOf([1, 2]),
			(1 * 1) + (2 * 2)
		);
	});
});
