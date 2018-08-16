'use strict'; /*jslint node:true*/

module.exports = class RLAgent {
    constructor(me, counts, values, rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = rounds;
        this.log = log;
        this.accept = undefined;
        this.total = this.get_total();
        this.state_map = this.get_state_map();
        this.state_action_mapping = this.get_all_actions_for_individual_states();
        this.q_values = [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.546688604624, 3.55993998132, 5.52634663385, 7.70356063959, 9.64328397591, 11.7824594645, 12.4666909313, 13.9437706004, 15.3153187974, 15.6230476753, 15.6191375347, 0.368407032499],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.18203019517, 3.55639920913, 6.23988852076, 8.33804796666, 9.99810810669, 11.5213747045, 11.6071016262, 11.5521191059, 11.5533107796, 11.5501720707, 11.5485092344, 0.0, 3.28605200946],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.972157688871, 3.2055135448, 5.48285647318, 8.0209294089, 9.91571895892, 11.6833399033, 11.7198668127, 11.7599881862, 11.7147258532, 11.723147233, 11.6280131957, 0.0, 0.0, 5.40508115738],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.889029341503, 3.19682341949, 5.29370677477, 7.40296219292, 9.88896778674, 11.778132843, 11.5914302504, 11.5590367827, 11.9208030255, 11.7928517878, 11.5662165768, 0.0, 0.0, 0.0, 7.54517133957],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.819266062168, 3.38065870661, 5.25767986274, 7.45683962079, 9.26471772638, 11.8547527888, 11.8248869573, 12.2664856023, 12.1113291758, 11.8350381231, 11.7594937076, 0.0, 0.0, 0.0, 0.0, 9.61845730028],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.541806020066, 3.28708487086, 5.34496589244, 7.57541990988, 9.43483697509, 11.5478871424, 12.4411990217, 12.3345777544, 12.3285778654, 12.0329390818, 12.4402349875, 0.0, 0.0, 0.0, 0.0, 0.0, 12.4415326676],
            [0.0, 0.0, 0.0, 0.0, 0.564176245211, 3.68896038768, 5.22019682607, 7.27787327255, 9.26668204306, 11.6563884084, 13.02980127, 13.9107939339, 13.8427884886, 13.9367510596, 13.9391916637, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 13.9460248592],
            [0.0, 0.0, 0.0, 0.490084985835, 3.26990485728, 5.25896964122, 7.45974066882, 8.80879971438, 11.5848818353, 12.8860787666, 15.1261922983, 14.9293411702, 13.5741188151, 14.9054173743, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 16.5606831394],
            [0.0, 0.0, 0.358422939068, 3.66196069573, 5.46258986521, 7.75203321287, 8.84500829074, 11.7239394844, 12.8907132678, 15.8118537432, 17.041949492, 18.6438531243, 22.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 18.055733757],
            [0.0, 0.573913043477, 4.2565557172, 4.49315068493, 7.31088944306, 9.24344023323, 12.0522875817, 12.7097021606, 16.0319510717, 17.0459646822, 28.0, 19.9636282989, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 20.5049566444],
            [0.412844036697, 2.43548387097, 4.44615551459, 6.40845070422, 8.47054571739, 10.7920353982, 12.6899935382, 15.107632094, 17.0671821503, 19.4084880636, 21.2544299565, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 24.9367481848]
        ];
    }

    get_state_map() {
        var state_map = {};
        var obj1 = this.counts[0];
        var obj2 = this.counts[1];
        var obj3 = this.counts[2];
        var val1 = this.values[0];
        var val2 = this.values[1];
        var val3 = this.values[2];

        for (var i = 0; i <= obj1; i++) {
            for (var j = 0; j <= obj2; j++) {
                for (var k = 0; k <= obj3; k++) {
                    var state = i * val1 + j * val2 + k * val3;
                    if (state in state_map) {
                        state_map[state].push([i, j, k]);
                    } else {
                        state_map[state] = [
                            [i, j, k]
                        ];
                    }

                }
            }
        }

        return state_map;
    }

    get_all_actions_for_individual_states() {
        var states = [];
        for (var k in this.state_map) {
            states.push(k);
        }
        var state_action_mapping = {};
        for (var i=0;i<states.length;i++) {
            var s1 = states[i];
            for (var j=0;j<states.length;j++) {
                var s2 =states[j];
                if (s1 in state_action_mapping) {
                    state_action_mapping[s1].push(s2 - s1);
                } else {
                    state_action_mapping[s1] = [s2 - s1];
                }
            }
            state_action_mapping[s1].push(11);
        }
        return state_action_mapping;

    }

    give_state_for(list_state) {
        var return_state = 0;
        for (var i = 0; i < 3; i++) {
            return_state += list_state[i] * this.values[i];
        }
        return return_state;
    }

    get_total() {
        var total = 0;
        for (var i = 0; i < this.values.length; i++) {
            total += this.values[i] * this.counts[i];
        }
        return total;
    }

    action_for_state(list_state) {
        var state_map = this.state_map;
        var actions = this.state_action_mapping
        var state = this.give_state_for(list_state);
        var q_values_considered = [];
        for (var i=0;i<actions[state].length;i++) {
            var action = parseInt(actions[state][i]);
            q_values_considered.push([action+10, this.q_values[state][action+10]]);
        }
        
        q_values_considered.sort(function cmp(a,b,){
            return b[1]-a[1];
        });

        var max_q_value_action = q_values_considered[0][0] - 10;
        var max_q_value_action2 = q_values_considered[1][0] - 10;
        var final_money_action = 0;

        if (state==8 || state==9 || state==10) {
            final_money_action = 11;
        }
        else {
            var random_number = Math.random();
            if(random_number <= 0.7) {
                final_money_action = max_q_value_action;
            }
            else {
                final_money_action = max_q_value_action2;
                if(state + final_money_action < 6) {
                    final_money_action = max_q_value_action;
                }
            }
        }

        if(final_money_action == 11) {
            return this.accept;
        }
        var states_closest_to_offer = [];
        var min_diff = 100;
        for(var i=0;i<this.state_map[state+final_money_action].length;i++) {
            var eligible_state = this.state_map[state+final_money_action][i];
            var diff = Math.abs(list_state[0]-eligible_state[0]) + Math.abs(list_state[1]-eligible_state[1]) + Math.abs(list_state[2]-eligible_state[2]);
            if(diff < min_diff) {
                states_closest_to_offer.length = 0;
                states_closest_to_offer.push(eligible_state);
                min_diff = diff;
            }
            else if(diff == min_diff) {
                states_closest_to_offer.push(eligible_state);
            }
        }
        return states_closest_to_offer[Math.floor(Math.random() * states_closest_to_offer.length)];
    }

    give_bid_for(list_state) {
        var next_state_we_want = this.action_for_state(list_state);
        return next_state_we_want;
    }

    offer(o) {

        if (o){
        return this.give_bid_for(o);
        }
        return this.give_bid_for([0,0,0]);
    }
};