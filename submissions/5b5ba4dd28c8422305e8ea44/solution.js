'use strict'; /*jslint node:true*/


module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;  //(A,B,C) cate sunt
        this.A = counts[0];
        this.B = counts[1];
        this.C = counts[2];
        this.my_values = values; //(X,Y,Z) valori pt mine
        this.rounds = max_rounds;
        this.current_round = 0;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];

        // [ (x,y,z) ] for enemy
        this.possible_enemy_values = this.compute_possible_values();
        this.enemy_probabilities = [];

        // [ (ca,cb,cc) ]
        this.possible_choice = this.compute_possible_choice();
        // [ evaluated_income ]
        this.possible_income = this.generate_possible_income();
        this.my_top_indexes = this.generate_my_top_indexes();

        this.fibo = [1,2,3,5,8];
        this.enemy_wants = [];
        this.best_offer_from_enemy = -1;
    }

    log3(array){
        let log_str = "";
        for(let i=0; i<array.length; i++){
            log_str += "("+array[i]+")"
        }
        this.log(log_str);
    }

    compute_best_offer_from_enemy(){
        this.log("Computing best offer from enemy");
        this.best_offer_from_enemy = [0,0,0];
        for(let i=0;i< this.enemy_wants.length; ++i)
            if (this.get_value(this.my_values, this.best_offer_from_enemy) <
                this.get_value(this.my_values, this.inverse(this.enemy_wants[i])))
            {
                this.best_offer_from_enemy = this.inverse(this.enemy_wants[i]);
            }
        this.log("Best offer from enemy:"+ this.best_offer_from_enemy);
    }

    compute_possible_values(){
        let values = [];
        for(let x = 0; x <= this.total; ++x)
            for(let y = 0; y <= this.total; ++y)
            {
                let up = this.total - this.A * x - this.B * y;
                if (up <0 || up % this.C !== 0)
                    continue;
                else
                {
                    let z = up / this.C;
                    values.push([x,y,z]);
                }
            }
        this.log("Possible my_values for enemy: "+values.length);
        this.log3(values);
        return values;
    }

    generate_my_top_indexes(){
        let sorted = [];
        for(let i=0; i<this.possible_income.length; ++i)
            sorted[i] = i;
        for(let i=0; i<this.possible_income.length -1; ++i)
            for(let j =i+1; j< this.possible_income.length; ++j)
            {
                if(this.possible_income[sorted[i]]< this.possible_income[sorted[j]])
                {
                    let aux = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = aux;
                }
            }
        this.log("My top indexes: "+ sorted);
        return sorted;
    }
    compute_possible_choice(){
        let possible_choice = [];
        for (let ca = 0; ca <= this.A; ++ca)
            for (let cb = 0; cb <= this.B; ++cb)
                for (let cc = 0 ; cc <= this.C; ++cc)
                    possible_choice.push([ca,cb,cc])

        this.log("Possible choices: "+ possible_choice.length);
        this.log3(possible_choice);
        return possible_choice;
    }
    generate_possible_income(){
        let incomes = [];
        let income = 0;
        for (let i = 0; i< this.possible_choice.length; ++i)
        {
            let cur = this.possible_choice[i];
            income = this.get_value(this.my_values, cur);
            incomes.push(income);
        }
        this.log("Possible income: "+incomes.length);
        this.log(incomes);
        return incomes;
    }

    get_value_from_index(i){
        return this.get_value(this.my_values, this.possible_choice[i]);
    }

    offer(o){
        this.current_round ++;
        this.log("Round: "+this.current_round);

        if(this.me === 0) // i go first
        {
            if (this.current_round === 1) { //random from maximum income variants
                this.log("I go first");
                let max_return_indexes = [];
                for(let i=0; i< this.possible_income.length; ++i)
                {
                    if(this.possible_income[i] === this.total)
                    {
                        max_return_indexes.push(i);
                    }
                }
                let index = this.rand(max_return_indexes.length);
                return this.possible_choice[max_return_indexes[index]];
            }
            this.log("Got arg:"+o);
            this.enemy_wants.push(this.inverse(o));
            this.compute_probabilities();
            let aprox_enemy_value = this.enemy_avg_value(this.inverse(o));
            let my_value = this.get_value(this.my_values, o);
            this.log("My value: "+ my_value + " aprox enemy value " +  aprox_enemy_value);

                if (this.current_round === 5) {
                    if(my_value >= aprox_enemy_value +2-(0.3*this.current_round) &&
                        ((my_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[2]))||my_value >=7))
                    {
                        this.log("OK1");
                        return undefined;
                    }


                    this.compute_best_offer_from_enemy();
                    let best_offer_value = this.get_value(this.my_values, this.best_offer_from_enemy);

                    if(my_value >= aprox_enemy_value +2-(0.3*this.current_round) &&
                        ((my_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[2])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[3])) ||
                        (my_value === this.get_value_from_index(this.my_top_indexes[4])) ||
                        (my_value >= best_offer_value && my_value >=7)))
                    {
                        this.log("OK2");
                        return undefined;
                    }

                    if (best_offer_value > aprox_enemy_value +2-(0.3*this.current_round) ||
                        (best_offer_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                        (best_offer_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                        (best_offer_value === this.get_value_from_index(this.my_top_indexes[2])))
                    {
                        return this.best_offer_from_enemy;
                    }
                    if (this.rand(2) === 0)
                    {
                        if (best_offer_value >= this.total - 3 - (0.5*this.current_round))
                        {
                            return this.best_offer_from_enemy;
                        }
                    }
                    else
                    {
                        if(best_offer_value >= this.total -1.5 -(0.5*this.current_round) )
                        {
                            return this.best_offer_from_enemy;
                        }
                    }
                    return this.inverse(o);
                }

                if(my_value >= aprox_enemy_value +2 -(0.3*this.current_round)  &&
                    ((my_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                    (my_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                    (my_value === this.get_value_from_index(this.my_top_indexes[2]))|| my_value >=7))
                {
                    this.log("OK3");
                    return undefined;
                }
                else
                {
                    return this.possible_choice[this.my_top_indexes[this.rand(5)]];
                }
            return this.counts;
        }
        else //enemy goes first
        {
            this.enemy_wants.push(this.inverse(o));
            this.compute_probabilities();
            let aprox_enemy_value = this.enemy_avg_value(this.inverse(o));
            let my_value = this.get_value(this.my_values, o);
            this.log("My value: "+ my_value + " aprox enemy value " +  aprox_enemy_value);

            if(this.current_round === 5)
            {
                if(my_value >= aprox_enemy_value +2-(0.3*this.current_round) &&
                    (my_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                    (my_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                    (my_value === this.get_value_from_index(this.my_top_indexes[2])))
                {
                    this.log("OK4");
                    return undefined;
                }
                return this.counts;
            }
            if(this.current_round === 4 && this.rand(3) === 1)
            {
                this.compute_best_offer_from_enemy();

                let best_offer_value = this.get_value(this.my_values, this.best_offer_from_enemy);
                if (best_offer_value > aprox_enemy_value +2-(0.3*this.current_round) ||
                    ((best_offer_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                    (best_offer_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                    (best_offer_value === this.get_value_from_index(this.my_top_indexes[2]))))
                {
                    return this.best_offer_from_enemy;
                }
                if (this.rand(2) === 0)
                {
                    if (best_offer_value >= this.total - 3 - (0.5*this.current_round))
                    {
                        return this.best_offer_from_enemy;
                    }
                }
                else
                {
                    if(best_offer_value >= this.total -1.5 -(0.5*this.current_round) )
                    {
                        return this.best_offer_from_enemy;
                    }
                }
            }
            if(my_value >= aprox_enemy_value +2-(0.3*this.current_round) &&
                ((my_value === this.get_value_from_index(this.my_top_indexes[0])) ||
                (my_value === this.get_value_from_index(this.my_top_indexes[1])) ||
                (my_value === this.get_value_from_index(this.my_top_indexes[2])) || my_value >=7))
            {
                this.log("OK5");
                return undefined;
            }
            else
            {
                return this.possible_choice[this.my_top_indexes[this.rand(5)]];
            }
            return this.counts;
        }
    }

    get_value(values, count)
    {
        return count[0] * values[0] + count[1] * values[1] + count[2] * values[2];
    }

    inverse(o){
        return [this.A-o[0], this.B - o[1], this.C - o[2]];
    }

    rand(max) {
        let val = Math.floor(Math.random() * Math.floor(max));
        this.log("Random: " + val);
        return val;
    }

    index_of(lst, sublst){
        for(let i = 1; i <lst[i].length ; ++i)
        {
            if (lst[i][0] === sublst[0] && lst[i][1] === sublst[1] && lst[i][2] === sublst[2])
                return i;
        }
        return -1;
    }

    compute_probabilities()
    {
        let enemy_prob = [];
        let fibo_sum = 0;
        let suma = 0, sumb = 0, sumc = 0;
        let pa =0, pb=0, pc =0;

        for(let i =0; i< this.enemy_wants.length; ++i)
        {
            fibo_sum += this.fibo[i];
            suma += this.enemy_wants[i][0];
            sumb += this.enemy_wants[i][1];
            sumc += this.enemy_wants[i][2];
        }

        let totalA = this.A * fibo_sum;
        let totalB = this.B * fibo_sum;
        let totalC = this.C * fibo_sum;

        if(totalA)
            pa = suma/totalA;
        if(totalB)
            pb = sumb/totalB;
        if(totalC)
            pc = sumc/totalC;

        this.log("pa:"+pa+" pb:"+pb+" pc:"+pc);
        for (let i = 0; i < this.possible_enemy_values.length; ++i)
        {
            let xp = this.possible_enemy_values[i][0];
            let yp = this.possible_enemy_values[i][1];
            let zp = this.possible_enemy_values[i][2];
            let computed_nr=
                (xp * this.A * pa +
                 yp * this.B * pb +
                 zp * this.C * pc);
            // this.log("Computed_nr: " + computed_nr);

            let prob = computed_nr/this.total * 100;
            // this.log("Current prob " + prob +" for ("+xp + " " + yp + " " + zp + ")");
            enemy_prob.push(prob);
        }
        // this.log("Enemy_prob: " + enemy_prob);
        this.enemy_probabilities = enemy_prob;
    }

    enemy_avg_value(enemy_wants){
        let numitor = 0;
        let numarator = 0;
        let best_enemy_indexes = this.get_best_enemy_indexes();

        for(let i = 0; i< best_enemy_indexes.length/2; ++i)
        {
            let value = this.get_value(enemy_wants, this.possible_enemy_values[i]);
            numarator += value * this.enemy_probabilities[i];
            numitor += this.enemy_probabilities[i];
            // this.log("value: " + value + " probability: "+ this.enemy_probabilities[i]);
        }
        let avg_enemy_value = numarator/numitor;
        this.log("AVG enemy value: " + avg_enemy_value + " numarator: "+ numarator + " numitor " + numitor);
        return avg_enemy_value;
    }

    get_best_enemy_indexes() {
        let sorted = [];
        for(let i=0; i<this.possible_enemy_values.length; ++i)
            sorted[i] = i;
        for(let i=0; i<this.enemy_probabilities.length -1; ++i)
            for(let j =i+1; j< this.enemy_probabilities.length; ++j)
            {
                if(this.enemy_probabilities[sorted[i]]< this.enemy_probabilities[sorted[j]])
                {
                    let aux = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = aux;
                }
            }
        this.log("Enemy top indexes: "+ sorted);
        return sorted;
    }
};
