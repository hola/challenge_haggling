'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log)
    {
        this.log = log;
        this.log("New script");
        this.i_am_first = (me == 0);
        this.num_items = counts.length;
        this.full_counts = counts.slice();
        this.values = values.slice();
        this.rounds_remaining = max_rounds;
        this.valuable_to_opponent = new Set();
    }
    offer(o)
    {
        this.log(`${this.rounds_remaining} rounds left`);
        this.rounds_remaining--;

        if (this.i_am_first)
        {
            return this.play_as_first(o);
        }
        else
        {
            return this.play_as_second(o);
        }
    }
    play_as_first(o)
    {
        if (o != undefined)
        {
            this.add_valuable_to_opponent(o);
            if (this.sum(o) == this.sum(this.full_counts))
            {
                this.log("As good as it gets");
                return undefined;
            }
        }
        if (this.rounds_remaining != 0)
        {
            return this.clear_not_valuable_to_me(this.full_counts);
        }
        else
        {
            let my_o = this.clear_not_valuable_to_me(this.min_worthwhile_offer());
            if (this.sum(my_o) == this.sum(o))
            {
                this.log("Equivalent");
                return undefined;
            }
            return my_o;
        }
    }
    play_as_second(o)
    {
        if (this.rounds_remaining == 0)
        {
            this.log("I am second and this is the last round");
            if (this.sum(o) != 0)
            {
                this.log("Taking anything but zero");
                return undefined;
            }
            else
            {
                this.log("Not taking nothing");
                return this.full_counts;
            }
        }

        if (this.good_enough(o))
        {
            this.log("Accepting good-enough offer");
            return undefined;
        }

        let fixed_offer = o.slice();
        while (!this.good_enough(fixed_offer))
        {
            let index = this.rand_index();
            if (fixed_offer[index] < this.full_counts[index])
            {
                fixed_offer[index]++;
            }
        }
        this.log("Trying fixed offer");
        return this.clear_not_valuable_to_me(fixed_offer);
    }
    add_valuable_to_opponent(o)
    {
        for (let i = 0; i < this.num_items; ++i)
        {
            if (o[i] < this.full_counts[i])
            {
                this.valuable_to_opponent.add(i);
            }
        }
    }
    clear_not_valuable_to_me(o_)
    {
        let o = o_.slice();
        for (let i = 0; i < this.num_items; ++i)
        {
            if (this.values[i] == 0)
            {
                o[i] = 0;
            }
        }
        return o;
    }
    min_value_index(index_set)
    {
        let min_index = -1;
        let min_value = -1;
        for (let i = 0; i < this.num_items; ++i)
        {
            if (index_set.has(i))
            {
                if (min_value == -1 || this.values[i] < min_value)
                {
                    min_value = this.values[i];
                    min_index = i;
                }
            }
        }
        return min_index;
    }
    min_worthwhile_offer()
    {
        let index = this.min_value_index(this.valuable_to_opponent);
        if (index == -1)
        {
            return this.full_counts;
        }
        else
        {
            this.log(`Min value index: ${index}`);
            let o = this.full_counts.slice();
            o[index] -= 1;
            this.log(`Min value index: ${o}`);
            return o;
        }
    }
    sum(counts)
    {
        let s = 0;
        for (let i = 0; i < counts.length; ++i)
        {
            s += counts[i] * this.values[i];
        }
        return s;
    }
    good_enough(offer)
    {
        return this.sum(offer) >= (this.sum(this.full_counts) / 2);
    }
    rand_index()
    {
        return Math.floor(Math.random()*this.full_counts.length);
    }
};

