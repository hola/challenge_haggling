/* jslint node:true */
const greedyness = 100500;
const to_str = a => a.map(x => x.toString(16)).join('');
const to_arr = s => s.split('').map(c => parseInt(c, 16));
const sum = a => a.reduce((acc, el) => acc + el, 0);
const strict_subset = (a, b) => {
  const a1 = a.split('');
  const a2 = b.split('');
  let ok = false;
  for (let i = 0; i < 3; i++) {
    if (a1[i] > a2[i]) return false;
    if (a1[i] < a2[i]) ok = true;
  }
  return ok;
};
const things = i => sum(to_arr(i));
const avail_offers = {
  '111': ['001', '010', '011', '100', '101', '110'],
  '112': ['001', '002', '010', '011', '012', '100', '101', '102', '110', '111'],
  '113': [ '001', '002', '003', '010', '011', '012', '013', '100', '101', '102', '103', '110', '111', '112' ],
  '114': [ '001', '002', '003', '004', '010', '011', '012', '013', '014', '100', '101', '102', '103', '104', '110', '111', '112', '113' ],
  '121': ['001', '010', '011', '020', '021', '100', '101', '110', '111', '120'],
  '122': [ '001', '002', '010', '011', '012', '020', '021', '022', '100', '101', '102', '110', '111', '112', '120', '121' ],
  '123': [ '001', '002', '003', '010', '011', '012', '013', '020', '021', '022', '023', '100', '101', '102', '103', '110', '111', '112', '113', '120', '121', '122' ],
  '131': [ '001', '010', '011', '020', '021', '030', '031', '100', '101', '110', '111', '120', '121', '130' ],
  '132': [ '001', '002', '010', '011', '012', '020', '021', '022', '030', '031', '032', '100', '101', '102', '110', '111', '112', '120', '121', '122', '130', '131' ],
  '141': [ '001', '010', '011', '020', '021', '030', '031', '040', '041', '100', '101', '110', '111', '120', '121', '130', '131', '140' ],
  '211': ['001', '010', '011', '100', '101', '110', '111', '200', '201', '210'],
  '212': [ '001', '002', '010', '011', '012', '100', '101', '102', '110', '111', '112', '200', '201', '202', '210', '211' ],
  '213': [ '001', '002', '003', '010', '011', '012', '013', '100', '101', '102', '103', '110', '111', '112', '113', '200', '201', '202', '203', '210', '211', '212' ],
  '221': [ '001', '010', '011', '020', '021', '100', '101', '110', '111', '120', '121', '200', '201', '210', '211', '220' ],
  '222': [ '001', '002', '010', '011', '012', '020', '021', '022', '100', '101', '102', '110', '111', '112', '120', '121', '122', '200', '201', '202', '210', '211', '212', '220', '221' ],
  '231': [ '001', '010', '011', '020', '021', '030', '031', '100', '101', '110', '111', '120', '121', '130', '131', '200', '201', '210', '211', '220', '221', '230' ],
  '311': [ '001', '010', '011', '100', '101', '110', '111', '200', '201', '210', '211', '300', '301', '310' ],
  '312': [ '001', '002', '010', '011', '012', '100', '101', '102', '110', '111', '112', '200', '201', '202', '210', '211', '212', '300', '301', '302', '310', '311' ],
  '321': [ '001', '010', '011', '020', '021', '100', '101', '110', '111', '120', '121', '200', '201', '210', '211', '220', '221', '300', '301', '310', '311', '320' ],
  '411': [ '001', '010', '011', '100', '101', '110', '111', '200', '201', '210', '211', '300', '301', '310', '311', '400', '401', '410' ],
};
const avail_valuations = {
  '111': [ '00a', '019', '028', '037', '046', '055', '064', '073', '082', '091', '0a0', '109', '118', '127', '136', '145', '154', '163', '172', '181', '190', '208', '217', '226', '235', '244', '253', '262', '271', '280', '307', '316', '325', '334', '343', '352', '361', '370', '406', '415', '424', '433', '442', '451', '460', '505', '514', '523', '532', '541', '550', '604', '613', '622', '631', '640', '703', '712', '721', '730', '802', '811', '820', '901', '910', 'a00' ],
  '112': [ '005', '024', '043', '062', '081', '0a0', '114', '133', '152', '171', '190', '204', '223', '242', '261', '280', '313', '332', '351', '370', '403', '422', '441', '460', '512', '531', '550', '602', '621', '640', '711', '730', '801', '820', '910', 'a00' ],
  '113': [ '013', '042', '071', '0a0', '103', '132', '161', '190', '222', '251', '280', '312', '341', '370', '402', '431', '460', '521', '550', '611', '640', '701', '730', '820', '910', 'a00' ],
  '114': [ '022', '061', '0a0', '112', '151', '190', '202', '241', '280', '331', '370', '421', '460', '511', '550', '601', '640', '730', '820', '910', 'a00' ],
  '121': [ '00a', '018', '026', '034', '042', '050', '109', '117', '125', '133', '141', '208', '216', '224', '232', '240', '307', '315', '323', '331', '406', '414', '422', '430', '505', '513', '521', '604', '612', '620', '703', '711', '802', '810', '901', 'a00' ],
  '122': [ '005', '014', '023', '032', '041', '050', '204', '213', '222', '231', '240', '403', '412', '421', '430', '602', '611', '620', '801', '810', 'a00' ],
  '123': [ '022', '050', '103', '131', '212', '240', '321', '402', '430', '511', '620', '701', '810', 'a00' ],
  '131': [ '00a', '017', '024', '031', '109', '116', '123', '130', '208', '215', '222', '307', '314', '321', '406', '413', '420', '505', '512', '604', '611', '703', '710', '802', '901', 'a00' ],
  '132': [ '005', '022', '113', '130', '204', '221', '312', '403', '420', '511', '602', '710', '801', 'a00' ],
  '141': [ '00a', '016', '022', '109', '115', '121', '208', '214', '220', '307', '313', '406', '412', '505', '511', '604', '610', '703', '802', '901', 'a00' ],
  '211': [ '00a', '019', '028', '037', '046', '055', '064', '073', '082', '091', '0a0', '108', '117', '126', '135', '144', '153', '162', '171', '180', '206', '215', '224', '233', '242', '251', '260', '304', '313', '322', '331', '340', '402', '411', '420', '500' ],
  '212': [ '005', '024', '043', '062', '081', '0a0', '104', '123', '142', '161', '180', '203', '222', '241', '260', '302', '321', '340', '401', '420', '500' ],
  '213': [ '013', '042', '071', '0a0', '122', '151', '180', '202', '231', '260', '311', '340', '420', '500' ],
  '221': [ '00a', '018', '026', '034', '042', '050', '108', '116', '124', '132', '140', '206', '214', '222', '230', '304', '312', '320', '402', '410', '500' ],
  '222': [ '005', '014', '023', '032', '041', '050', '104', '113', '122', '131', '140', '203', '212', '221', '230', '302', '311', '320', '401', '410', '500' ],
  '231': [ '00a', '017', '024', '031', '108', '115', '122', '206', '213', '220', '304', '311', '402', '500' ],
  '311': [ '00a', '019', '028', '037', '046', '055', '064', '073', '082', '091', '0a0', '107', '116', '125', '134', '143', '152', '161', '170', '204', '213', '222', '231', '240', '301', '310' ],
  '312': [ '005', '024', '043', '062', '081', '0a0', '113', '132', '151', '170', '202', '221', '240', '310' ],
  '321': [ '00a', '018', '026', '034', '042', '050', '107', '115', '123', '131', '204', '212', '220', '301' ],
  '411': [ '00a', '019', '028', '037', '046', '055', '064', '073', '082', '091', '0a0', '106', '115', '124', '133', '142', '151', '160', '202', '211', '220' ],
};
module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    this.value = o => sum(to_arr(o).map((x, i) => x * values[i]));
    this.value2 = (o, v) =>
      sum( to_arr(o).map( (x, i) => parseInt(v.slice(i, i + 1), 16) * (counts[i] - x)));
    const my = to_str(values);
    const c = to_str(counts);
    this.vals = avail_valuations[c].filter(v => v != my);
    this.vals_copy = this.vals.slice();
    this.offers = avail_offers[c].filter(this.value);
    this.sort_offers = (a, b) =>
      this.value(b) - this.value(a) ||
        sum( ((this.vals.length && this.vals) || this.vals_copy).map(v => this.value2(a, v))) -
        sum( ((this.vals.length && this.vals) || this.vals_copy).map(v => this.value2(b, v))) ||
      things(b) - things(a) ||
      a - b;
    this.offers.sort(this.sort_offers);
    this.best_we_can_hope_for = this.value(this.offers[0]);
    if (me) {
      if (/0../.test(my)) {
        if (/00./.test(my)) {
          this.offers = this.offers.filter(o => /00./.test(o));
        } else if (/0.0/.test(my)) {
          this.offers = this.offers.filter(o => /0.0/.test(o));
        } else {
          this.offers = this.offers.filter(o => /0../.test(o));
        }
      } else if (/.0./.test(my)) {
        if (/.00/.test(my)) {
          this.offers = this.offers.filter(o => /.00/.test(o));
        } else {
          this.offers = this.offers.filter(o => /.0./.test(o));
        }
      } else if (/..0/.test(my)) {
        this.offers = this.offers.filter(o => /..0/.test(o));
      }
      let y = 3;
      if (c == '111') y = 1;
      else if (c == '114' || c == '122') y = 5;
      else if (c == '212' || c == '221') y = 2;
      this.offers = this.offers.filter(
        o => this.value(o) > this.best_we_can_hope_for - y
      );
    } else if (c == '111') {
      this.offers = this.offers.filter(
        o => this.value(o) > this.best_we_can_hope_for - 2
      );
    } else {
      this.offers = this.offers.filter(
        o => this.value(o) > this.best_we_can_hope_for - 1
      );
    }
    this.offers_sent = [];
    this.offers_received = [];
    this.greedyness = 0;
  }
  offer(offer) {
    this.log(`${this.rounds} rounds left`);
    this.rounds--;
    if (!offer) {
      const o = this.offers.shift();
      this.offers_sent.push(o);
      return to_arr(o);
    }
    const o = to_str(offer);
    if (this.me && !this.rounds)
      return this.value(o) ? undefined : this.counts.slice();
    if (this.value(o) >= this.best_we_can_hope_for) return;
    if (this.offers_sent.includes(o)) return;
    if (this.me && this.rounds == 1) {
      let d = this.best_we_can_hope_for - 4;
      const c = to_str(this.counts);
      if (c == '111') d = 7;
      else if (c == '112' || c == '121' || c == '211') d = 6;
      else if (c == '114' || c == '141') d = 5;
      const received = [o, ...this.offers_received];
      let b;
      for (const r of received) {
        if (this.value(r) < d) continue;
        if (!b || this.value(r) > this.value(b)) b = r;
      }
      if (b) return b == o ? undefined : to_arr(b);
    }
    if (this.offers_sent.length) {
      const l = this.offers_sent[this.offers_sent.length - 1];
      this.vals = this.vals.filter(v => this.value2(l, v) != 10);
    }
    if (
      this.offers_received.length &&
      this.vals.length &&
      !this.offers_received.includes(o) &&
      !this.offers_received.some(r => strict_subset(o, r))
    ) {
      this.vals = this.vals.filter(v => {
        const val = this.value2(o, v);
        return val && !this.offers_received.some(r => this.value2(r, v) < val);
      });
    }
    if (!this.offers_received.length) {
      const z = offer.filter(n => n != 0).length;
      if (z == 2) {
        if (/0../.test(o)) {
          if (offer[1] == this.counts[1] && offer[2] == this.counts[2])
            this.vals = this.vals.filter(v => /.00/.test(v));
        } else if (/.0./.test(o)) {
          if (offer[0] == this.counts[0] && offer[2] == this.counts[2])
            this.vals = this.vals.filter(v => /0.0/.test(v));
        } else if (/..0/.test(o)) {
          if (offer[0] == this.counts[0] && offer[1] == this.counts[1])
            this.vals = this.vals.filter(v => /00./.test(v));
        }
      } else if (z == 1) {
        if (offer[0]) {
          this.vals = this.vals.filter(v => {
            const a = to_arr(v);
            return a[0] <= a[1] && a[0] <= a[2];
          });
          if (offer[0] == this.counts[0]) {
            if (this.counts[0] > 1)
              this.vals = this.vals.filter(v => /0../.test(v));
          }
        } else if (offer[1]) {
          this.vals = this.vals.filter(v => {
            const a = to_arr(v);
            return a[1] <= a[0] && a[1] <= a[2];
          });
          if (offer[1] == this.counts[1]) {
            if (this.counts[1] > 1)
              this.vals = this.vals.filter(v => /.0./.test(v));
          }
        } else if (offer[2]) {
          this.vals = this.vals.filter(v => {
            const a = to_arr(v);
            return a[2] <= a[0] && a[2] <= a[1];
          });
          if (offer[2] == this.counts[2]) {
            if (this.counts[2] > 1)
              this.vals = this.vals.filter(v => /..0/.test(v));
          }
        }
      }
    }
    if (this.value(o) > this.greedyness) this.greedyness = this.value(o);
    this.offers_received.push(o);
    this.offers = this.offers.filter(
      z =>
        z != o &&
        this.value(z) >= this.greedyness &&
        this.vals.some(v => this.value2(z, v)) &&
        !strict_subset(z, o)
    );
    this.offers.sort(this.sort_offers);
    if (!this.rounds) {
      let offers = this.offers_received.slice();
      let oo = offers.sort(this.sort_offers).shift();
      for (const x of offers) {
        const v = this.value(x);
        if (v == this.value(oo) && x == o) {
          oo = x;
          break;
        }
        if (v < this.value(oo)) break;
      }
      let div_by = 0;
      const vals = (this.vals.length && this.vals) || this.vals_copy;
      const fq = new Array(vals.length);
      for (let i = 0; i < fq.length; i++) {
        let p = 0;
        for (const r of this.offers_received) p += this.value2(r, vals[i]);
        div_by += p;
        fq[i] = [vals[i], p];
      }
      fq.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      for (let i = 0; i < fq.length; i++) fq[i][1] /= div_by;
      const m = this.value(oo);
      let my = '000';
      offers = avail_offers[to_str(this.counts)].filter(
        x => !this.offers_received.includes(x)
      );
      let myv = 0;
      for (const x of offers) {
        if (!this.value(x)) continue;
        let sum = 0;
        for (const f of fq) {
          const v = this.value2(x, f[0]);
          if (v) sum += (this.value(x) - m) * f[1];
          else sum -= m * f[1];
        }
        if (sum > myv || (sum == myv && this.value(x) > this.value(my)))
          [myv, my] = [sum, x];
      }
      if (this.value(oo) && this.value(oo) >= this.value(my))
        return oo == o ? undefined : to_arr(oo);
      return this.value(my) ? to_arr(my) : to_arr(this.offers_sent[0]);
    }
    let offer_this;
    if (this.offers.length) offer_this = this.offers.shift();
    else if (this.offers_sent.length) offer_this = this.offers_sent[0];
    else {
      const c = this.counts.slice();
      for (let i = 0; i < c.length; i++) c[i] = this.values[i] ? c[i] : 0;
      if (c[0] && c[1] && c[2]) {
        let min = 10;
        let mini = 0;
        for (let i = 0; i < this.values.length; i++) {
          if (this.values[i] < min) {
            min = this.values[i];
            mini = i;
          }
        }
        c[mini]--;
      }
      offer_this = to_str(c);
      const offers = this.offers_received.slice();
      offers.sort(this.sort_offers);
      if (offers.length && this.value(offers[0]) >= this.value(offer_this))
        offer_this = offers[0];
    }
    this.offers_sent.push(offer_this);
    return offer_this == o ? undefined : to_arr(offer_this);
  }
};
