'use strict'; /*jslint node:true*/
const ws = require('ws');

class Client {
    constructor(url, id, mk_agent, logger){
        this.logger = logger;
        this.logger.log('network', `Connecting to ${url}...`);
        this.ws = new ws(url, {headers: {'X-Hola-Challenge-ID': id}});
        this.ws.onopen = this._on_open.bind(this);
        this.ws.onclose = this._on_close.bind(this);
        this.ws.onmessage = this._on_message.bind(this);
        this.ws.onerror = this._on_error.bind(this);
        this.counts = undefined;
        this.me = undefined;
        this.agent  = undefined;
        this.mk_agent = mk_agent;
        this.connected = false;
    }
    _on_open(){
        this.connected = true;
        this.logger.log('network',
            'Connected to remote server, waiting for partner...');
    }
    _on_message(event){
        try {
            let json = JSON.parse(event.data);
            switch (json.type)
            {
            case 'start':
                this.me = json.opt.me;
                this.counts = json.opt.counts;
                this.agent = this.mk_agent(this.me, this.counts,
                    json.opt.values, json.opt.max_rounds);
                this.agent.on('offer', this._on_offer.bind(this));
                this.agent.on('info', this._on_info.bind(this));
                this.agent.on('abort', this._on_abort.bind(this));
                let labels = new Array(2);
                labels[this.me] = this.agent.label();
                labels[1-this.me] = 'remote';
                this.logger.log('init', labels, json.opt.counts,
                    json.opt.max_rounds);
                break;
            case 'offer':
                this.logger.log('offer', 1-this.me,
                    this._expand(1-this.me, json.offer));
                this.agent.offer(json.offer);
                break;
            case 'log':
                this.logger.log(...json.arg);
                break;
            default:
                this.logger.log('network', 'Protocol error');
                this.destroy(true);
            }
        } catch(e){
            this.logger.log('network', `Protocol error: ${e}`);
            this.destroy(true);
        }
    }
    _on_error(event){
        this.logger.log('network', event.message);
        this.destroy(false);
    }
    _on_close(event){
        this.destroy(false);
    }
    _on_offer(o){
        this.ws.send(JSON.stringify({type: 'offer', offer: o}));
        this.logger.log('offer', this.me, this._expand(this.me, o));
    }
    _on_info(text){
        this.ws.send(JSON.stringify({type: 'info', text}));
        this.logger.log('info', this.me, text);
    }
    _on_abort(reason){
        this.ws.send(JSON.stringify({type: 'abort', reason}));
        this.logger.log('abort', this.me, reason);
        this.destroy(true);
    }
    _expand(turn, o){
        if (!o)
            return;
        let res = new Array(2);
        res[turn] = o;
        res[1-turn] = o.map((n, i)=>this.counts[i]-n);
        return res;
    }
    destroy(close){
        if (this.agent)
            this.agent.destroy();
        this.ws.onopen = undefined;
        this.ws.onclose = undefined;
        this.ws.onmessage = undefined;
        this.ws.onerror = ()=>{};
        if (close)
        {
            if (this.connected)
                this.ws.close();
            else
                this.ws.destroy();
        }
        this.logger.log('network', 'Disconnected from remote server');
        this.logger.finalize();
    }
}

module.exports = {Client};
