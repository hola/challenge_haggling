'use strict'; /* jslint node:true */

/* Hola Generator */
class Generator {
    constructor(types, min_obj, max_obj, total, max_rounds) {
        this.types = types;
        this.min_obj = min_obj;
        this.max_obj = max_obj;
        this.total = total;
        this.max_rounds = max_rounds;
        this.obj_sets = [];
        this._init_sets(new Array(types), 0, 0);
        if (!this.obj_sets.length)
            throw new Error('Constraints cannot be satisfied');
    }
    _init_sets(counts, i, total_count) {
        let min = Math.max(1, this.min_obj - total_count - this.types + i + 1);
        let max = this.max_obj - total_count - this.types + i + 1;
        for (let j = min; j <= max; j++) {
            counts[i] = j;
            if (i < this.types - 1)
                this._init_sets(counts, i + 1, total_count + j);
            else {
                let obj_set = {
                    counts: Array.from(counts),
                    valuations: []
                };
                this._init_valuations(obj_set, new Array(this.types), 0, 0);
                if (obj_set.valuations.length >= 2)
                    this.obj_sets.push(obj_set);
            }
        }
    }
    _init_valuations(obj_set, values, i, total_value) {
        let count = obj_set.counts[i];
        let max = (this.total - total_value) / count | 0;
        if (i == this.types - 1) {
            if (total_value + max * count == this.total) {
                values[i] = max;
                obj_set.valuations.push(Array.from(values));
            }
            return;
        }
        for (let j = 0; j <= max; j++) {
            values[i] = j;
            this._init_valuations(obj_set, values, i + 1, total_value + j * count);
        }
    }
    get(random) {
        let obj_set = random.pick(this.obj_sets);
        return {
            counts: obj_set.counts,
            valuations: random.sample(obj_set.valuations, 2),
            max_rounds: this.max_rounds,
        };
    }
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.round = 0;
        this.log = log;
        // this.log = function () {};
        this.total = this.mul_sum_arr(this.counts, this.values);
        this.types = counts.length;
        this.min_obj = 1;
        this.max_obj = 6;

        this.history = [];
        this.generator = new Generator(this.types, this.min_obj, this.max_obj, this.total, this.rounds);
    }

    // сумма в массиве
    arr_sum(arr) {
        return arr.reduce((a, b) => a + b, 0);
    }

    // максимальный элемент в массиве
    arr_max(arr) {
        return Math.max.apply(Math, arr);
    }

    f_arr(arr1, arr2, f) {
        var res = [];

        for (let i = 0; i < arr1.length; i++) {
            res.push(f(arr1[i], arr2[i]));
        }

        return res;
    }

    // Минимум массивов
    min_arr(arr1, arr2) {
        return this.f_arr(arr1, arr2, function(a, b) { return Math.min(a, b); });
    }

    // Максимум массивов
    max_arr(arr1, arr2) {
        return this.f_arr(arr1, arr2, function(a, b) { return Math.max(a, b); });
    }

    // Сумма массивов
    sum_arr(arr1, arr2) {
        return this.f_arr(arr1, arr2, function(a, b) { return a + b; });
    }

    // Вычитание массивов
    sub_arr(arr1, arr2) {
        return this.f_arr(arr1, arr2, function(a, b) { return a - b; });
    }

    // Произведение массивов
    mul_arr(arr1, arr2) {
        return this.f_arr(arr1, arr2, function(a, b) { return a * b; });
    }

    // Сумма произведения массивов
    mul_sum_arr(arr1, arr2) {
        if (!arr1 || !arr2 || !arr1.length || !arr2.length) {
            return 0;
        }

        return this.arr_sum(this.mul_arr(arr1, arr2));
    }

    // на сколько массивы отличаются
    get_diff_arr(arr1, arr2) {
        let max1 = this.arr_max(arr1);
        let max2 = this.arr_max(arr2);

        let koeff = max1 / max2;
        arr2 = this.mul_arr(arr2, arr2.slice().fill(koeff));

        let arr_sub = this.sub_arr(arr1, arr2);
        let arr_abs = arr_sub.map(Math.abs);

        return this.arr_sum(arr_abs);
    }

    // Процентное соотношение
    get_percent(value, percent) {
        return value * percent / 100;
    }

    // Значение пропорциональное раунду
    get_value_by_round(left_value, rigth_value) {
        let k = this.round / this.rounds;

        if (left_value < rigth_value) {
            return left_value + (rigth_value - left_value) * k;
        } else {
            return left_value - (left_value - rigth_value) * k;
        }
    }

    // Значение пропорциональное раунду в процентах
    get_value_by_round_in_percent(value, left_percent, right_percent) {
        let left_value = this.get_percent(value, left_percent);
        let rigth_value = this.get_percent(value, right_percent);

        return this.get_value_by_round(left_value, rigth_value);
    }

    // Получаем возможную генерацию торгов по количеству предметов
    get_variation_of_trades(out, acc, i) {
        out = out || [];
        acc = acc || {};
        i = i || 0;

        for (let j = 0; j <= this.counts[i]; j++) {
            acc[i] = j;

            if (i < this.counts.length - 1) {
                this.get_variation_of_trades(out, acc, i + 1);
            } else {
                out.push(Object.values(acc));
            }
        }

        return out;
    }

    // Возможные веса по комбинации предметов
    get_valuations() {
        let obj_sets = this.generator.obj_sets;

        for (let i = 0; i < obj_sets.length; i++) {
            if (this.counts.toString() == obj_sets[i].counts.toString()) {
                return obj_sets[i].valuations;
            }
        };
    }

    // Распределиение очков у соперника
    get_vot1_distribution(vot0)
    {
        let out = {};
        let valuations = this.get_valuations();
        let vot1_prefer = this.get_vot1_prefer(vot0);

        // this.log(`vot0=${vot0}; vot1_prefer=${vot1_prefer};`);

        for (let i = 0; i <= this.total; i++) {
            out[i] = 0;
        }

        let counts = this.sub_arr(this.counts, vot0); // что мы оставили сопернику

        for (let i = 0; i < valuations.length; i++) {
            if (valuations[i].toString() == this.values.toString()) { // совпали веса? такого не бывало!
                continue;
            }

            if (this.arr_sum(vot1_prefer) > 0) {
                let diff = this.get_diff_arr(valuations[i], vot1_prefer);
                // this.log(valuations[i], vot1_prefer, diff);

                if (diff > this.total) { // не то, что ищет соперник
                    // this.log('SKIP: valuation', valuations[i], 'vot1_prefer', vot1_prefer, 'diff', diff);
                    continue;
                }
            }

            let mul_sum = this.mul_sum_arr(counts, valuations[i]);

            out[mul_sum] += 1;
        }

        return out;
    }

    // Сколько очков скорее всего получит соперник
    get_vot1_mul_sum_probability(distribution)
    {
        let dist_count = this.arr_sum(Object.values(distribution));
        let sum = 0;

        for (var key in distribution) {
            sum += distribution[key] * parseInt(key);
        }

        return parseFloat((sum / dist_count).toFixed(1));
    }

    // Максимум что может получить соперник
    get_vot1_mul_sum_max(distribution)
    {
        let max = 0;

        for (var key in distribution) {
            if (distribution[key]) {
                max = parseInt(key);
            }
        }

        return max;
    }

    // Вероятность что у нас не хуже
    get_probability(distribution, vot0_mul_sum)
    {
        let s0 = 0,
            s1 = 0;

        for (var key in distribution) {
            if (parseInt(key) < vot0_mul_sum) {
                s0 += distribution[key];
            } else {
                s1 += distribution[key];
            }
        }

        return parseFloat((s0 / (s0 + s1) * 100).toFixed(0));
    }

    // Генерим таблицу
    get_table() {
        this.table = [];
        let vot0 = this.get_variation_of_trades();

        for (let i = 0; i < vot0.length; i++) {
            let vot0_mul_sum = this.mul_sum_arr(vot0[i], this.values);
            let vot1_distribution = this.get_vot1_distribution(vot0[i]);
            let vot1_mul_sum_probability = this.get_vot1_mul_sum_probability(vot1_distribution);
            let sub_mul_sum = parseFloat((vot0_mul_sum - vot1_mul_sum_probability).toFixed(1));
            let vot1_mul_sum_max = this.get_vot1_mul_sum_max(vot1_distribution);
            let vot1_prefer = this.arr_sum(this.get_vot1_prefer(vot0[i]));
            let probability = this.get_probability(vot1_distribution, vot0_mul_sum);

            this.table.push({
                'vot0': vot0[i],
                'vot1': this.sub_arr(this.counts, vot0[i]),
                // 'vot0_sum': this.arr_sum(vot0[i]),
                // 'vot0_max': this.arr_max(vot0[i]),
                'vot0_mul_sum': vot0_mul_sum,
                'vot1_mul_sum': '?',
                'vot1_mul_sum_probability': vot1_mul_sum_probability,
                'sub_mul_sum': sub_mul_sum,
                'vot1_mul_sum_max': vot1_mul_sum_max,
                'vot1_prefer': vot1_prefer,
                'probability': probability,
                'vot1_dist': Object.values(vot1_distribution).join(','),
                'mark': '',
            });
        }

        let threshold = this.get_value_by_round_in_percent(this.total, 100, 90);

        this.table.sort(function(first, second) {
            // return second.sub_mul_sum - first.sub_mul_sum;

            if (first.vot0_mul_sum != second.vot0_mul_sum) {
                return second.vot0_mul_sum - first.vot0_mul_sum;
            }

            if (first.vot0_mul_sum >= threshold) {
                return second.vot1_prefer - first.vot1_prefer ||
                       second.probability - first.probability ||
                       second.vot1_mul_sum_max - first.vot1_mul_sum_max ||
                       second.vot1_mul_sum_probability - first.vot1_mul_sum_probability;
            } else {
                return first.vot1_prefer - first.vot1_prefer ||
                       first.probability - second.probability ||
                       first.vot1_mul_sum_max - second.vot1_mul_sum_max ||
                       first.vot1_mul_sum_probability - second.vot1_mul_sum_probability;
            }
        });

        this.mark_table_rows();
    }

    // Помечаем строки таблицы
    mark_table_rows() {
        let max_prefer = 0;

        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i].vot1_prefer > max_prefer) {
                max_prefer = this.table[i].vot1_prefer;
            }

            this.table[i].mark = '';

            if (this.table[i].vot1_mul_sum_max < this.get_percent(this.total, 50)) {
                this.table[i].mark = 'max';
            }

            let percent = this.get_value_by_round_in_percent(this.table[i].vot0_mul_sum, 10, 25);

            if (this.table[i].vot0_mul_sum < this.table[i].vot1_mul_sum_probability - percent) {
                this.table[i].mark = 'min';
            }

            if (this.table[i].vot0_mul_sum < this.get_percent(this.total, 40)) {
                this.table[i].mark = 'min';
            }

            for (let j = 0; j < this.history.length; j++) {
                if (this.table[i].vot0.toString() == this.history[j].vot.toString()) {
                    this.table[i].mark += this.table[i].mark ? "," + this.history[j].who : this.history[j].who;
                }
            }
        }

        // this.log(`max_prefer ${max_prefer}`);

        let unmark_count = this.get_unmark_count(true);
        let lost_rounds = this.rounds - this.round;
        let can_mark = unmark_count - lost_rounds + 1;

        // this.log(`unmark_count ${unmark_count}, can_mark ${can_mark}`);

        for (let i = 0; i < this.table.length; i++) {

            if (can_mark <= 0) {
                break;
            }

            if (this.table[i].mark) {
                continue;
            }

            if (this.table[i].vot1_prefer < this.get_percent(max_prefer, 50)) {
                this.table[i].mark = 's1';
                // this.log(`mark_1 ${i}`);
                can_mark--;
                continue;
            }

            if (this.table[i].vot1_mul_sum_probability < this.get_percent(this.total, 30)) {
                this.table[i].mark = 's2';
                // this.log(`mark_2 ${i}`);
                can_mark--;
                continue;
            }
        }
    }

    // Возвращает строку по vot0
    get_table_row(vot0) {
        let vot0_str = vot0.toString();

        for (let i = 0; i < this.table.length; i++) {
            if (vot0_str == this.table[i].vot0.toString()) {
                return this.table[i];
            }
        }

        return;
    }

    // Количество непомеченных строк
    get_unmark_count(stop_on_vot1) {
        let cnt = 0;

        for (let i = 0; i < this.table.length; i++) {
            if (!this.table[i].mark) {
                cnt++;
            }

            if (stop_on_vot1 && this.table[i].mark.indexOf('1') != -1) {
                break;
            }
        }

        return cnt;
    }

    // Первая не помеченная строка
    get_first_unmark_row() {
        let row;

        for (let i = 0; i < this.table.length; i++) {
            if (!this.table[i].mark) {
                row = this.table[i];
                break;
            }
        }

        return row;
    }

    // Лучшая не помеченная строка
    get_best_unmark_row() {
        let row;
        let max = 0;

        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i].mark) {
                continue;
            }

            if (this.table[i].vot0_sum > max) {
                row = this.table[i];
                max = this.table[i].vot0_sum;
            }
        }

        return row;
    }

    // Мы ходим первыми
    we_are_first() {
        return this.me == 0;
    }

    // Добавляем в историю
    add2hisotry(who, vot) {
        if (this.round > this.rounds) {
            this.log(`ROUNDS: ${this.round} > ${this.rounds}`);
            // return;
        }

        let vot0_mul_sum = this.mul_sum_arr(vot, this.values);
        let row = this.get_table_row(vot);

        if (!row) {
            this.log(`Invalid vot = ${vot.toString()}`);
            return;
        }

        this.history.push({
            'round': this.round,
            'who': who,
            'vot': vot,
            'vot0_mul_sum': vot0_mul_sum,
            'vot1_mul_sum_probability': row.vot1_mul_sum_probability,
            'vot1_prefer': row.vot1_prefer,
        });

        // update vot1
        for (let i = 0; i < this.history - 1; i++) {
            let row = this.get_table_row(this.history[i].vot);
            this.history[i]['vot1_mul_sum_probability'] = row.vot1_mul_sum_probability;
            this.history[i]['vot1_prefer'] = row.vot1_prefer;
        }

        this.mark_table_rows();
    }

    // Максимальное что предлагал соперник за всю историю
    get_vot1_mul_sum_max_history() {
        let max = 0,
            index = 0;

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].who == 0) { // skip self
                continue;
            }

            let row = this.get_table_row(this.history[i].vot);

            // строка не найдена или помечена как min/max
            if (!row || row.mark.indexOf('min') != -1 || row.mark.indexOf('max') != -1) {
                continue;
            }

            if (this.history[i].vot0_mul_sum > max) {
                max = this.history[i].vot0_mul_sum;
                index = i;
            }
        }

        return this.history[index];
    }

    // За нами последний вопрос
    get_from_history() {
        let vot = this.counts;
        let history = this.history.slice();

        history.sort(function(first, second) {
            return second.who - first.who ||
                   second.vot1_prefer - first.vot1_prefer ||
                   second.vot0_mul_sum - first.vot0_mul_sum ||
                   second.vot1_mul_sum_probability - first.vot1_mul_sum_probability;
        });

        this.debug = history;

        for (let i = 0; i < history.length; i++) {
            if (history[i].who == 0) {
                vot = history[i].vot; // запомним свой предложенный вариант
                break;
            }

            if (history[i].vot0_mul_sum >= history[i].vot1_mul_sum_probability - this.get_value_by_round_in_percent(this.total, 0, 10)) {
                this.log('NEXT_HISTORY');
                return history[i].vot;
            }
        }

        let row = this.get_first_unmark_row();

        if (row) {
            vot = row.vot0;
        }

        return vot;
    }

    // Предпочитает ли соперник данную комбинацию
    get_vot1_prefer(vot0) {
        let prefer = [];

        for (let i = 0; i < this.counts.length; i++) {
            prefer.push(0);
        }

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].who == 0) {
                continue;
            }

            if (this.arr_sum(this.history[i].vot) == 0) { // соперник очень жадный
                continue;
            }

            let sub_vot0 = this.sub_arr(this.counts, vot0);
            let sub_vot0_history = this.sub_arr(this.counts, this.history[i].vot);

            prefer = this.sum_arr(prefer, this.min_arr(sub_vot0, sub_vot0_history));
        }

        return prefer;
    }

    // Проверка согласия
    check_accept(vot, percent) {
        let row = this.get_table_row(vot);

        // строка не найдена
        if (!row) {
            return false;
        }

        // строка помечена как min || max
        if (row.mark.indexOf('min') != -1 || row.mark.indexOf('max') != -1) {
            return false;
        }

        // мы сами этот вариант предлагали
        if (row.mark.indexOf('0') != -1) {
            return true;
        }

        // у нас больше или равно, чем у соперника
        if (row.vot0_mul_sum >= row.vot1_mul_sum_probability + this.get_percent(row.vot0_mul_sum, percent)) {
            return true;
        }

        return false;
    }

    // Формируем очередное предложение
    get_next_vot0(vot1, history) {
        let row = this.get_first_unmark_row();
        let vot0 = row ? row.vot0 : [];

        if (vot1) {
            // сколько мы можем предложить
            let vot0_mul_sum = this.mul_sum_arr(vot0, this.values);
            // смотрим сколько предложил соперник
            let vot1_mul_sum = this.mul_sum_arr(vot1, this.values);

            // очков поровну, борзеем...
            if (vot0_mul_sum == vot1_mul_sum) {
                if (this.check_accept(vot1, this.get_value_by_round_in_percent(vot0_mul_sum, 5, 15))) {
                    this.log('NEXT_ACCEPT_1');
                    return undefined; // соглашаемся
                }
            }

            // больше чем, соперник мы уже не можем предложить
            if (vot0_mul_sum < vot1_mul_sum) {
                // сколько раньше максимум предлагал соперник
                let vot1_mul_sum_max_history = this.get_vot1_mul_sum_max_history();

                // раньше он больше предлагал
                if (vot1_mul_sum_max_history.vot0_mul_sum > vot1_mul_sum) {
                    let percent = this.get_value_by_round_in_percent(vot1_mul_sum_max_history.vot0_mul_sum, 10, -5);

                    if (this.check_accept(vot1_mul_sum_max_history.vot, percent)) {
                        this.log('MAX_HISTORY');
                        return vot1_mul_sum_max_history.vot;
                    }
                }

                if (this.check_accept(vot1, -5)) {
                    this.log('NEXT_ACCEPT_2');
                    return undefined; // соглашаемся
                }
            }
        }

        if (!vot0.length || history) {
            this.log('FROM_HISTORY');
            return this.get_from_history();
        }

        this.log('NEXT');

        return vot0;
    }

    // За нами последний ответ
    get_last_answer(vot) {
        if (this.check_accept(vot, -5)) {
            this.log('LAST_ACCEPT');
            return undefined; // соглашаемся
        }

        return this.counts; // не согласны
    }

    // Получить новое предложение
    get_offer(vot) {
        if (this.round == 1) {
            if (this.we_are_first()) {
                this.log('--- WE_ARE_FIRST ---');
                return this.get_next_vot0();
            }
        } else if (this.round == this.rounds - 1) {
            if (this.we_are_first()) {
                this.log('--- LAST_QUESTION --');
                return this.get_next_vot0(vot, true);
            }
        } else if (this.round == this.rounds) {
            if (this.we_are_first()) {
                this.log('--- LAST_ANSWER --');
                return this.get_last_answer(vot);
            } else {
                this.log('--- LAST_QUESTION --');
                return this.get_next_vot0(vot, true);
            }
        }

        return this.get_next_vot0(vot, false);
    }

    // Есть чё? А если найду?
    offer(o) {
        this.round++;
        this.log(`--- ${this.round} ---`);

        this.get_table();

        if (o) {
            this.log(`IN: ${o}`);
            this.add2hisotry(1, o);
            this.get_table();
        }

        o = this.get_offer(o);

        if (o) {
            this.add2hisotry(0, o);
        }

        this.log(`OUT: ${o}`);

        return o;
    }
};
