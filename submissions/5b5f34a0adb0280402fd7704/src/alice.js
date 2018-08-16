const possibleOffers = {
  273: [1, 16, 17, 256, 257, 272],
  274: [1, 2, 16, 17, 18, 256, 257, 258, 272, 273],
  275: [1, 2, 3, 16, 17, 18, 19, 256, 257, 258, 259, 272, 273, 274],
  276: [
    1,
    2,
    3,
    4,
    16,
    17,
    18,
    19,
    20,
    256,
    257,
    258,
    259,
    260,
    272,
    273,
    274,
    275,
  ],
  289: [1, 16, 17, 32, 33, 256, 257, 272, 273, 288],
  290: [1, 2, 16, 17, 18, 32, 33, 34, 256, 257, 258, 272, 273, 274, 288, 289],
  291: [
    1,
    2,
    3,
    16,
    17,
    18,
    19,
    32,
    33,
    34,
    35,
    256,
    257,
    258,
    259,
    272,
    273,
    274,
    275,
    288,
    289,
    290,
  ],
  305: [1, 16, 17, 32, 33, 48, 49, 256, 257, 272, 273, 288, 289, 304],
  306: [
    1,
    2,
    16,
    17,
    18,
    32,
    33,
    34,
    48,
    49,
    50,
    256,
    257,
    258,
    272,
    273,
    274,
    288,
    289,
    290,
    304,
    305,
  ],
  321: [
    1,
    16,
    17,
    32,
    33,
    48,
    49,
    64,
    65,
    256,
    257,
    272,
    273,
    288,
    289,
    304,
    305,
    320,
  ],
  529: [1, 16, 17, 256, 257, 272, 273, 512, 513, 528],
  530: [
    1,
    2,
    16,
    17,
    18,
    256,
    257,
    258,
    272,
    273,
    274,
    512,
    513,
    514,
    528,
    529,
  ],
  531: [
    1,
    2,
    3,
    16,
    17,
    18,
    19,
    256,
    257,
    258,
    259,
    272,
    273,
    274,
    275,
    512,
    513,
    514,
    515,
    528,
    529,
    530,
  ],
  545: [
    1,
    16,
    17,
    32,
    33,
    256,
    257,
    272,
    273,
    288,
    289,
    512,
    513,
    528,
    529,
    544,
  ],
  546: [
    1,
    2,
    16,
    17,
    18,
    32,
    33,
    34,
    256,
    257,
    258,
    272,
    273,
    274,
    288,
    289,
    290,
    512,
    513,
    514,
    528,
    529,
    530,
    544,
    545,
  ],
  561: [
    1,
    16,
    17,
    32,
    33,
    48,
    49,
    256,
    257,
    272,
    273,
    288,
    289,
    304,
    305,
    512,
    513,
    528,
    529,
    544,
    545,
    560,
  ],
  785: [1, 16, 17, 256, 257, 272, 273, 512, 513, 528, 529, 768, 769, 784],
  786: [
    1,
    2,
    16,
    17,
    18,
    256,
    257,
    258,
    272,
    273,
    274,
    512,
    513,
    514,
    528,
    529,
    530,
    768,
    769,
    770,
    784,
    785,
  ],
  801: [
    1,
    16,
    17,
    32,
    33,
    256,
    257,
    272,
    273,
    288,
    289,
    512,
    513,
    528,
    529,
    544,
    545,
    768,
    769,
    784,
    785,
    800,
  ],
  1041: [
    1,
    16,
    17,
    256,
    257,
    272,
    273,
    512,
    513,
    528,
    529,
    768,
    769,
    784,
    785,
    1024,
    1025,
    1040,
  ],
};

const possibleValuations = {
  273: [
    10,
    25,
    40,
    55,
    70,
    85,
    100,
    115,
    130,
    145,
    160,
    265,
    280,
    295,
    310,
    325,
    340,
    355,
    370,
    385,
    400,
    520,
    535,
    550,
    565,
    580,
    595,
    610,
    625,
    640,
    775,
    790,
    805,
    820,
    835,
    850,
    865,
    880,
    1030,
    1045,
    1060,
    1075,
    1090,
    1105,
    1120,
    1285,
    1300,
    1315,
    1330,
    1345,
    1360,
    1540,
    1555,
    1570,
    1585,
    1600,
    1795,
    1810,
    1825,
    1840,
    2050,
    2065,
    2080,
    2305,
    2320,
    2560,
  ],
  274: [
    5,
    36,
    67,
    98,
    129,
    160,
    276,
    307,
    338,
    369,
    400,
    516,
    547,
    578,
    609,
    640,
    787,
    818,
    849,
    880,
    1027,
    1058,
    1089,
    1120,
    1298,
    1329,
    1360,
    1538,
    1569,
    1600,
    1809,
    1840,
    2049,
    2080,
    2320,
    2560,
  ],
  275: [
    19,
    66,
    113,
    160,
    259,
    306,
    353,
    400,
    546,
    593,
    640,
    786,
    833,
    880,
    1026,
    1073,
    1120,
    1313,
    1360,
    1553,
    1600,
    1793,
    1840,
    2080,
    2320,
    2560,
  ],
  276: [
    34,
    97,
    160,
    274,
    337,
    400,
    514,
    577,
    640,
    817,
    880,
    1057,
    1120,
    1297,
    1360,
    1537,
    1600,
    1840,
    2080,
    2320,
    2560,
  ],
  289: [
    10,
    24,
    38,
    52,
    66,
    80,
    265,
    279,
    293,
    307,
    321,
    520,
    534,
    548,
    562,
    576,
    775,
    789,
    803,
    817,
    1030,
    1044,
    1058,
    1072,
    1285,
    1299,
    1313,
    1540,
    1554,
    1568,
    1795,
    1809,
    2050,
    2064,
    2305,
    2560,
  ],
  290: [
    5,
    20,
    35,
    50,
    65,
    80,
    516,
    531,
    546,
    561,
    576,
    1027,
    1042,
    1057,
    1072,
    1538,
    1553,
    1568,
    2049,
    2064,
    2560,
  ],
  291: [
    34,
    80,
    259,
    305,
    530,
    576,
    801,
    1026,
    1072,
    1297,
    1568,
    1793,
    2064,
    2560,
  ],
  305: [
    10,
    23,
    36,
    49,
    265,
    278,
    291,
    304,
    520,
    533,
    546,
    775,
    788,
    801,
    1030,
    1043,
    1056,
    1285,
    1298,
    1540,
    1553,
    1795,
    1808,
    2050,
    2305,
    2560,
  ],
  306: [
    5,
    34,
    275,
    304,
    516,
    545,
    786,
    1027,
    1056,
    1297,
    1538,
    1808,
    2049,
    2560,
  ],
  321: [
    10,
    22,
    34,
    265,
    277,
    289,
    520,
    532,
    544,
    775,
    787,
    1030,
    1042,
    1285,
    1297,
    1540,
    1552,
    1795,
    2050,
    2305,
    2560,
  ],
  529: [
    10,
    25,
    40,
    55,
    70,
    85,
    100,
    115,
    130,
    145,
    160,
    264,
    279,
    294,
    309,
    324,
    339,
    354,
    369,
    384,
    518,
    533,
    548,
    563,
    578,
    593,
    608,
    772,
    787,
    802,
    817,
    832,
    1026,
    1041,
    1056,
    1280,
  ],
  530: [
    5,
    36,
    67,
    98,
    129,
    160,
    260,
    291,
    322,
    353,
    384,
    515,
    546,
    577,
    608,
    770,
    801,
    832,
    1025,
    1056,
    1280,
  ],
  531: [19, 66, 113, 160, 290, 337, 384, 514, 561, 608, 785, 832, 1056, 1280],
  545: [
    10,
    24,
    38,
    52,
    66,
    80,
    264,
    278,
    292,
    306,
    320,
    518,
    532,
    546,
    560,
    772,
    786,
    800,
    1026,
    1040,
    1280,
  ],
  546: [
    5,
    20,
    35,
    50,
    65,
    80,
    260,
    275,
    290,
    305,
    320,
    515,
    530,
    545,
    560,
    770,
    785,
    800,
    1025,
    1040,
    1280,
  ],
  561: [10, 23, 36, 49, 264, 277, 290, 518, 531, 544, 772, 785, 1026, 1280],
  785: [
    10,
    25,
    40,
    55,
    70,
    85,
    100,
    115,
    130,
    145,
    160,
    263,
    278,
    293,
    308,
    323,
    338,
    353,
    368,
    516,
    531,
    546,
    561,
    576,
    769,
    784,
  ],
  786: [5, 36, 67, 98, 129, 160, 275, 306, 337, 368, 514, 545, 576, 784],
  801: [10, 24, 38, 52, 66, 80, 263, 277, 291, 305, 516, 530, 544, 769],
  1041: [
    10,
    25,
    40,
    55,
    70,
    85,
    100,
    115,
    130,
    145,
    160,
    262,
    277,
    292,
    307,
    322,
    337,
    352,
    514,
    529,
    544,
  ],
};

const toInt = a => (a[0] << 8) + (a[1] << 4) + a[2];
const fromInt = i => [i >> 8, (i >> 4) & 15, i & 15];
const at0 = i => i >> 8;
const at1 = i => (i >> 4) & 15;
const at2 = i => i & 15;
const cnt = i => at0(i) + at1(i) + at2(i);
const differentItems = i =>
  (at0(i) ? 1 : 0) + (at1(i) ? 1 : 0) + (at2(i) ? 1 : 0);
const allEq = (a, c) => {
  for (const v of a) {
    if (v !== c) {
      return false;
    }
  }
  return true;
};
const subset = (a, b) => {
  if (at0(a) > at0(b) || at1(a) > at1(b) || at2(a) > at2(b)) {
    return false;
  }
  if (at0(a) < at0(b) || at1(a) < at1(b) || at2(a) < at2(b)) {
    return true;
  }
  return false;
};

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.rounds = maxRounds;
    this.log = log;

    this.sentOffers = [];
    this.receivedOffers = [];
    this.maxOffered = 0;

    this.offerSortFn = this.offerSortFn.bind(this);

    const myValue = toInt(this.values);
    this.possibleValuations = possibleValuations[`${toInt(counts)}`].filter(
      v => v !== myValue
    );
    this.allPossibleValuations = this.possibleValuations.slice();

    this.possibleOffers = possibleOffers[`${toInt(counts)}`]
      .filter(o => this.value(o) > 0)
      .sort(this.offerSortFn);
    this.maxFairVal = this.value(this.possibleOffers[0]);

    this.possibleOffers = this.possibleOffers.filter(
      o => this.value(o) > this.maxFairVal - 3
    );

    if (me === 1) {
      if (values[0] === 0 && values[1] === 0) {
        this.possibleOffers = this.possibleOffers.filter(
          o => at0(o) === 0 && at1(o) === 0
        );
      } else if (values[0] === 0 && values[2] === 0) {
        this.possibleOffers = this.possibleOffers.filter(
          o => at0(o) === 0 && at2(o) === 0
        );
      } else if (values[1] === 0 && values[2] === 0) {
        this.possibleOffers = this.possibleOffers.filter(
          o => at1(o) === 0 && at2(o) === 0
        );
      } else if (values[0] === 0) {
        this.possibleOffers = this.possibleOffers.filter(o => at0(o) === 0);
      } else if (values[1] === 0) {
        this.possibleOffers = this.possibleOffers.filter(o => at1(o) === 0);
      } else if (values[2] === 0) {
        this.possibleOffers = this.possibleOffers.filter(o => at2(o) === 0);
      }
    }
  }
  offerSortFn(a, b) {
    const c1 = this.value(b) - this.value(a);
    if (c1 !== 0) {
      return c1;
    }

    const vs = this.possibleValuations.length
      ? this.possibleValuations
      : this.allPossibleValuations;
    let sum1 = 0;
    let sum2 = 0;
    for (const v of vs) {
      sum1 += this.hisValue(a, v);
      sum2 += this.hisValue(b, v);
    }
    const c2 = sum1 - sum2;
    if (c2 !== 0) {
      return c2;
    }

    const c3 = cnt(b) - cnt(a);
    if (c3 !== 0) {
      return c3;
    }

    return a - b;
  }
  value(o) {
    return (
      at0(o) * this.values[0] +
      at1(o) * this.values[1] +
      at2(o) * this.values[2]
    );
  }
  hisValue(o, v) {
    return (
      (this.counts[0] - at0(o)) * at0(v) +
      (this.counts[1] - at1(o)) * at1(v) +
      (this.counts[2] - at2(o)) * at2(v)
    );
  }
  zeroProbability(o) {
    const vs = this.possibleValuations.length
      ? this.possibleValuations
      : this.allPossibleValuations;
    let zeroes = 0;
    for (const v of vs) {
      if (this.hisValue(o, v) < 1) {
        zeroes++;
      }
    }
    return (100 * zeroes) / vs.length;
  }
  offer(offerArr) {
    this.rounds--;

    if (!offerArr) {
      const o = this.possibleOffers.shift();
      this.sentOffers.push(o);
      return fromInt(o);
    }

    const o = toInt(offerArr);
    const oVal = this.value(o);

    if (oVal === 10) {
      return undefined;
    }

    if (oVal >= this.maxFairVal) {
      return undefined;
    }

    const discount = 4;
    if (this.me === 1 && this.rounds === 1) {
      let best = 0;
      const received = this.receivedOffers.slice();
      received.unshift(o);
      for (const ro of received) {
        const v = this.value(ro);
        const vbest = this.value(best);
        if (
          v >= this.maxFairVal - discount &&
          (v > vbest || (v === vbest && ro === o))
        ) {
          best = ro;
        }
      }
      if (best !== 0) {
        if (best === o) {
          return undefined;
        }
        return fromInt(best);
      }
    }

    if (this.sentOffers.includes(o)) {
      return undefined;
    }

    if (this.rounds === 0 && this.me === 1) {
      if (oVal > 0) {
        return undefined;
      }
      return this.counts.slice();
    }

    if (this.possibleValuations.length && !this.receivedOffers.includes(o)) {
      if (this.receivedOffers.length) {
        let filter = true;
        if (this.rounds >= 1) {
          for (const ro of this.receivedOffers) {
            if (subset(o, ro)) {
              filter = false;
              break;
            }
          }
        }
        if (filter) {
          this.possibleValuations = this.possibleValuations.filter(v => {
            const val = this.hisValue(o, v);
            if (val === 0) return false;
            for (const ro of this.receivedOffers) {
              if (val > this.hisValue(ro, v)) return false;
            }
            return true;
          });
        }
      }
    }

    if (this.possibleValuations.length) {
      if (this.receivedOffers.length === 0 || allEq(this.receivedOffers, 0)) {
        const diff = differentItems(o);
        if (diff === 1) {
          if (at0(o) > 0) {
            this.possibleValuations = this.possibleValuations.filter(
              v => at0(v) <= at1(v) && at0(v) <= at2(v)
            );
            if (this.counts[0] > 1 && at0(o) === this.counts[0]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at0(v) === 0
              );
            }
          } else if (at1(o) > 0) {
            this.possibleValuations = this.possibleValuations.filter(
              v => at1(v) <= at0(v) && at1(v) <= at2(v)
            );
            if (this.counts[1] > 1 && at1(o) === this.counts[1]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at1(v) === 0
              );
            }
          } else {
            this.possibleValuations = this.possibleValuations.filter(
              v => at2(v) <= at0(v) && at2(v) <= at1(v)
            );
            if (this.counts[2] > 1 && at2(o) === this.counts[2]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at2(v) === 0
              );
            }
          }
        } else if (diff === 2) {
          if (at0(o) === 0) {
            if (at1(o) === this.counts[1] && at2(o) === this.counts[2]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at1(v) === 0 && at2(v) === 0
              );
            }
          } else if (at1(o) === 0) {
            if (at0(o) === this.counts[0] && at2(o) === this.counts[2]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at0(v) === 0 && at2(v) === 0
              );
            }
          } else if (at2(o) === 0) {
            if (at0(o) === this.counts[0] && at1(o) === this.counts[1]) {
              this.possibleValuations = this.possibleValuations.filter(
                v => at0(v) === 0 && at1(v) === 0
              );
            }
          }
        }
      }
    }

    if (this.sentOffers.length && this.possibleValuations) {
      const lastOurOffer = this.sentOffers[this.sentOffers.length - 1];
      this.possibleValuations = this.possibleValuations.filter(
        v => this.hisValue(lastOurOffer, v) < 10
      );
    }

    this.receivedOffers.push(o);
    if (oVal > this.maxOffered) {
      this.maxOffered = oVal;
    }
    this.possibleOffers = this.possibleOffers.filter(
      po =>
        this.value(po) >= this.maxOffered &&
        this.zeroProbability(po) < 99 &&
        po !== o &&
        !subset(po, o)
    );

    this.possibleOffers.sort(this.offerSortFn);

    if (this.rounds === 0) {
      let offers = this.receivedOffers.slice();
      offers.sort(this.offerSortFn);
      let bestHis = offers.shift();
      for (const x of offers) {
        const v = this.value(x);
        if (v < this.value(bestHis)) {
          break;
        }
        if (v === this.value(bestHis) && x === o) {
          bestHis = x;
          break;
        }
      }

      const vs = this.possibleValuations.length
        ? this.possibleValuations
        : this.allPossibleValuations;
      const freqs = new Array(vs.length);
      let total = 0;
      for (let i = 0; i < freqs.length; i++) {
        freqs[i] = { pv: vs[i], p: 0 };
        for (const ro of this.receivedOffers) {
          freqs[i].p += this.hisValue(ro, vs[i]);
        }
        total += freqs[i].p;
      }
      freqs.sort((a, b) => {
        if (a.p !== b.p) {
          return b.p - a.p;
        }
        return a.pv - b.pv;
      });
      for (let i = 0; i < freqs.length; i++) {
        freqs[i].p /= total;
      }

      const median = this.value(bestHis);
      let bestOurs = 0;
      offers = possibleOffers[`${toInt(this.counts)}`].slice();
      offers = offers.filter(x => !this.receivedOffers.includes(x));
      let bestSum = 0;

      for (const x of offers) {
        if (this.value(x) > 0) {
          let sum = 0;
          for (const f of freqs) {
            const v = this.hisValue(x, f.pv);
            if (v === 0) {
              sum -= median * f.p;
            } else {
              sum += (this.value(x) - median) * f.p;
            }
          }
          if (
            sum > bestSum ||
            (sum === bestSum && this.value(x) > this.value(bestOurs))
          ) {
            bestSum = sum;
            bestOurs = x;
          }
        }
      }

      if (this.value(bestHis) > 0) {
        if (this.value(bestHis) >= this.value(bestOurs)) {
          if (bestHis === o) {
            return undefined;
          }
          return fromInt(bestHis);
        }
      }

      if (this.value(bestOurs) > 0) {
        return fromInt(bestOurs);
      }

      return fromInt(this.sentOffers[0]);
    }

    let nextOffer = 0;
    if (this.possibleOffers.length > 0) {
      nextOffer = this.possibleOffers.shift();
    } else if (this.sentOffers.length > 0) {
      [nextOffer] = this.sentOffers;
    } else {
      let zeroed = false;
      const counts = this.counts.slice();
      for (let i = 0; i < counts.length; i++) {
        if (this.values[i] === 0) {
          counts[i] = 0;
          zeroed = true;
        }
      }
      if (!zeroed) {
        if (
          this.values[0] <= this.values[1] &&
          this.values[0] <= this.values[2]
        ) {
          counts[0]--;
        } else if (
          this.values[1] <= this.values[0] &&
          this.values[1] <= this.values[2]
        ) {
          counts[1]--;
        } else if (
          this.values[2] <= this.values[0] &&
          this.values[2] <= this.values[1]
        ) {
          counts[2]--;
        }
      }
      nextOffer = toInt(counts);
      const offers = this.receivedOffers.slice();
      offers.sort(this.offerSortFn);
      if (offers.length > 0 && this.value(offers[0]) >= this.value(nextOffer)) {
        [nextOffer] = offers;
      }
    }

    if (nextOffer === o) {
      return undefined;
    }
    this.sentOffers.push(nextOffer);
    return fromInt(nextOffer);
  }
};
