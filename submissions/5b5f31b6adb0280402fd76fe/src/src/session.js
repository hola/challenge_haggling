'use strict'; /*jslint node:true*/

class Session {
    constructor(context, mk_agent, logger){
        this.context = context;
        this.logger = logger;
        this.agents = [
            mk_agent[0](0, context.counts, context.valuations[0],
                context.max_rounds),
            mk_agent[1](1, context.counts, context.valuations[1],
                context.max_rounds),
        ];
        this.turn = 0;
        this.round = 0;
        this.done = false;
        this.last_partition = undefined;
        this.agents[0].on('offer', this._on_offer.bind(this, 0));
        this.agents[1].on('offer', this._on_offer.bind(this, 1));
        this.agents[0].on('info', this._on_info.bind(this, 0));
        this.agents[1].on('info', this._on_info.bind(this, 1));
        this.agents[0].on('abort', this._on_abort.bind(this, 0));
        this.agents[1].on('abort', this._on_abort.bind(this, 1));
        this.logger.log('init',
            [this.agents[0].label(), this.agents[1].label()],
            this.context.counts, this.context.max_rounds);
    }
    _sum(choices, values){
        let res = 0;
        for (let i = 0; i<choices.length; i++)
            res += choices[i]*values[i];
        return res;
    }
    _validate(offer){
        if (!Array.isArray(offer))
            return false;
        if (offer.length!=this.context.counts.length)
            return false;
        for (let i = 0; i<offer.length; i++)
        {
            let n = offer[i];
            if (n!==(n|0) || n<0 || n>this.context.counts[i])
                return false;
        }
        return true;
    }
    _on_offer(turn, offer){
        if (this.done)
            return;
        if (turn!=this.turn)
            return this._abort(turn, 'Unexpected offer');
        if (offer && !this._validate(offer))
            return this._abort(turn, 'Invalid offer');
        if (!offer && this.last_partition)
        {
            this.logger.log('offer', turn);
            return this._done(true);
        }
        if (!offer)
            return this._abort(turn, 'Offer expected');
        if (!this.last_partition)
            this.last_partition = new Array(2);
        this.last_partition[turn] = offer;
        offer = offer.map((n, i)=>this.context.counts[i]-n);
        this.last_partition[1-turn] = offer;
        this.logger.log('offer', turn, this.last_partition);
        this.turn = 1-turn;
        if (!this.turn)
            this.round++;
        if (this.round==this.context.max_rounds)
            return this._done(false);
        process.nextTick(()=>this.agents[this.turn].offer(offer));
    }
    _done(agreed){
        this.logger.log('valuation', 0, this.context.valuations[0]);
        this.logger.log('score', 0, agreed ? this._sum(
            this.last_partition[0], this.context.valuations[0]) : 0);
        this.logger.log('valuation', 1, this.context.valuations[1]);
        this.logger.log('score', 1, agreed ? this._sum(
            this.last_partition[1], this.context.valuations[1]) : 0);
        this.logger.log('done', agreed);
        this._finalize();
    }
    _on_info(i, text){
        if (this.done)
            return;
        this.logger.log('info', i, text);
    }
    _on_abort(i, reason){
        if (this.done)
            return;
        this.logger.log('abort', i, reason);
        this._finalize();
    }
    _abort(i, reason){
        this.logger.log('abort', i, reason);
        this._finalize();
    }
    abort(reason){
        this.logger.log('abort', null, reason);
        this._finalize();
    }
    _finalize(){
        this.done = true;
        this.agents[0].destroy();
        this.agents[1].destroy();
        this.logger.finalize();
    }
}

module.exports = {Session};
