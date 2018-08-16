let assert = require("assert");
let appCls = require("../src/challenge_haggling");

describe("Common scenarios", function () {
	it("should not accept against very greedy opponent", function () {
		const rounds = [
			// opponent"s offer, my offer
			[undefined, [0, 2, 3]],
			[[0, 0, 0], [1, 1, 3]],
			[[0, 0, 0], [1, 2, 2]],
			[[0, 0, 0], [0, 1, 3]],
			[[0, 0, 0], [1, 0, 3]],
		];
		const app = new appCls(0, [1, 2, 3], [1, 2, 3], 5, console.log);

		for (const round of rounds) {
			assert.deepStrictEqual(app.offer(round[0]), round[1]);
		}
	});

	it("should accept on maximum proposed value", function () {
		const rounds = [
			// opponent"s offer, my offer
			[undefined, [2, 2, 1]],
			// opponent proposed maximum value of 8
			[[2, 2, 0], undefined],
		];
		const app = new appCls(0, [2, 2, 2], [2, 2, 0], 5, console.log);

		for (const round of rounds) {
			assert.deepStrictEqual(app.offer(round[0]), round[1], round);
		}
	});

	it("should accept on current round's value", function () {
		const rounds = [
			// opponent"s offer, my offer
			[undefined, [2, 2, 1]],
			[[0, 0, 0], [2, 2, 0]],
			[[0, 0, 0], [2, 1, 2]],
			// this is 4 round with max value of 6
			// opponent proposed 2 * 1 + 2 * 2 + 1 * 0 = 6, must accept
			[[1, 2, 0], undefined],
		];
		const app = new appCls(0, [2, 2, 2], [2, 2, 0], 5, console.log);

		for (const round of rounds) {
			assert.deepStrictEqual(app.offer(round[0]), round[1], round);
		}
	});

	it("should accept if proposed value is above the current round's one", function () {
		const rounds = [
			// opponent"s offer, my offer
			[undefined, [2, 2, 1]],
			[[0, 0, 0], [2, 2, 0]],
			[[0, 0, 0], [2, 1, 2]],
			// this is 4 round with max value of 6
			// but opponent proposed 2 * 2 + 2 * 2 + 1 * 0 = 8, must accept
			[[2, 2, 1], undefined],
		];
		const app = new appCls(0, [2, 2, 2], [2, 2, 0], 5, console.log);

		for (const round of rounds) {
			assert.deepStrictEqual(app.offer(round[0]), round[1], round);
		}
	});
});

describe("The last round scenario", function () {
	describe("If I make the first turn", function () {
		it("should offer maximum opponent's value that is greater than a half", function () {
			const rounds = [
				// opponent"s offer, my offer
				[undefined, [0, 2, 3]],
				[[1, 0, 0], [1, 1, 3]],
				[[1, 2, 1], [1, 2, 2]],
				[[0, 1, 2], [0, 1, 3]],
				// try to end the game with opponent's offer
				// that is the most profitable for me
				// and greater than a half with maximum amount of objects
				[[0, 0, 0], [1, 2, 1]],
			];
			const app = new appCls(0, [1, 2, 3], [1, 2, 3], 5, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1], round);
			}
		});
	});

	describe("If an opponent makes the first turn", function () {
		it("should offer on the last turn maximum opponent's value that is greater than a half", function () {
			const rounds = [
				// opponent"s offer, my offer
				[[1, 0, 1], [0, 2, 3]],
				[[1, 0, 0], [1, 1, 3]],
				[[0, 1, 0], [1, 2, 2]],
				[[1, 2, 1], [0, 1, 3]],
				// try to end the game with opponent's offer
				// that is the most profitable for me
				// and greater than a half and with minimum objects
				[[1, 0, 2], undefined],
			];
			const app = new appCls(1, [1, 2, 3], [1, 2, 3], 5, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1], round);
			}
		});
	});
});


describe("Incorrect scenarios", function () {
	it("should not offer if it is my turn", function () {
		const app = new appCls(0, [1, 2, 3], [1, 2, 3], 5, console.log);

		assert.throws(() => {
			app.offer([1, 2, 3])
		}, new Error("Incorrect game sequence. I must make first turn"));
	});

	it("should offer if it is opponent's turn", function () {
		const app = new appCls(1, [1, 2, 3], [1, 2, 3], 5, console.log);

		assert.throws(() => {
			app.offer()
		}, new Error("Incorrect game sequence. Opponent must make first turn"));
	});

	it("should not accept undefined on offer if it is not the first round", function () {
		const app = new appCls(0, [1, 2, 3], [1, 2, 3], 5, console.log);

		app.offer();

		assert.throws(() => {
			app.offer();
		}, new Error("Opponent's offer is undefined but round number is 2"));
	});
});


describe("2 rounds scenarios", function () {
	describe("If I make the first turn", function () {
		it("should offer a half or greater opponent's set", function () {
			const rounds = [
				// opponent"s offer, my offer
				[undefined, [0, 2, 3]],
				[[0, 1, 2], [0, 1, 2]],
			];
			const app = new appCls(0, [1, 2, 3], [1, 2, 3], 2, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1]);
			}
		});

		it("should offer as usual if an oppinent did not offer equal or greater than a half", function () {
			const rounds = [
				// opponent"s offer, my offer
				[[0, 0, 1], [0, 2, 3]],
				[[0, 1, 1], [1, 1, 3]],
			];
			const app = new appCls(1, [1, 2, 3], [1, 2, 3], 2, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1]);
			}
		});
	});

	describe("Opponent makes the first turn", function () {
		it("should accept a half or greater set", function () {
			const rounds = [
				// opponent"s offer, my offer
				[[0, 0, 1], [0, 2, 3]],
				[[0, 1, 2], undefined], // I should accept the final offer
			];
			const app = new appCls(1, [1, 2, 3], [1, 2, 3], 2, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1]);
			}
		});

		it("should not accept if not equal or lower than a half", function () {
			const rounds = [
				// opponent"s offer, my offer
				[[0, 0, 1], [0, 2, 3]],
				[[0, 1, 1], [1, 1, 3]],
			];
			const app = new appCls(1, [1, 2, 3], [1, 2, 3], 2, console.log);

			for (const round of rounds) {
				assert.deepStrictEqual(app.offer(round[0]), round[1]);
			}
		});
	});
});
