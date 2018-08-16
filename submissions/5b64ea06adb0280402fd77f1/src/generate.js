// https://github.com/hola/challenge_haggling/blob/master/src/generate.js
'use strict';

/*jslint node:true*/

class Generator
{
    constructor(types, min_obj, max_obj, total, max_rounds)
    {
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

    _init_sets(counts, i, total_count)
    {
        let min = Math.max(1, this.min_obj - total_count - this.types + i + 1);
        let max = this.max_obj - total_count - this.types + i + 1;
        for (let j = min; j <= max; j++)
        {
            counts[i] = j;
            if (i < this.types - 1)
                this._init_sets(counts, i + 1, total_count + j);
            else
            {
                let obj_set = {counts: Array.from(counts), valuations: []};
                this._init_valuations(obj_set, new Array(this.types), 0, 0);
                if (obj_set.valuations.length >= 2)
                    this.obj_sets.push(obj_set);
            }
        }
    }

    _init_valuations(obj_set, values, i, total_value)
    {
        let count = obj_set.counts[i];
        let max = (this.total - total_value) / count | 0;
        if (i == this.types - 1)
        {
            if (total_value + max * count == this.total)
            {
                values[i] = max;
                obj_set.valuations.push(Array.from(values));
            }
            return;
        }
        for (let j = 0; j <= max; j++)
        {
            values[i] = j;
            this._init_valuations(obj_set, values, i + 1, total_value + j * count);
        }
    }

    get(random)
    {
        let obj_set = random.pick(this.obj_sets);
        return {
            counts: obj_set.counts,
            valuations: random.sample(obj_set.valuations, 2),
            max_rounds: this.max_rounds,
        };
    }
}

module.exports = {Generator};
