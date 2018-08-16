'use strict'; /*jslint node:true*/
const crypto = require('crypto');
const ws = require('ws');

function get_pow(id, bits){
    loop: for (let nonce = 0;; nonce++)
    {
        let hash = crypto.createHash('sha256')
            .update(`${nonce}:${id}`).digest();
        let b = bits, i = 0;
        while (b)
        {
            if (b<8)
            {
                if (hash[i] & ((1<<b) - 1))
                    continue loop;
                return String(nonce);
            }
            if (hash[i++])
                continue loop;
            b -= 8;
        }
        return String(nonce);
    }
}

class Client {
    constructor(url, id, mk_agent, logger){
        let hash = crypto.createHash('md5').update(id).digest('hex');
        this.id = id;
        this.logger = logger;
        this.logger.log('network',
            `Connecting to ${url} (ID hash ${hash})...`);
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
                this.logger.log('offer', 1-this.me, this._expand(json.offer));
                this.agent.offer(json.offer);
                break;
            case 'log':
                if (json.arg[0]=='network')
                {
                    let m = /^pow:(\d+)$/.exec(json.arg[2]);
                    if (m)
                    {
                        this.logger.log('network',
                            'Passing anti-spam test...');
                        return this.ws.send(JSON.stringify({type: 'pow',
                            nonce: get_pow(this.id, +m[1])}));
                    }
                }
                this.logger.log(...json.arg);
                break;
            default:
                this.destroy(true, 'Protocol error');
            }
        } catch(e){
            this.destroy(true, `Protocol error: ${e}`);
        }
    }
    _on_error(event){ this.destroy(false, event.message); }
    _on_close(event){ this.destroy(false, event.reason); }
    _on_offer(o){
        this.ws.send(JSON.stringify({type: 'offer', offer: o}));
        this.logger.log('offer', this.me, this._expand(o));
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
    _expand(o){
        if (!o)
            return;
        let res = new Array(2);
        res[this.me] = o;
        res[1-this.me] = o.map((n, i)=>this.counts[i]-n);
        return res;
    }
    destroy(close, reason){
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
        let msg = 'Disconnected from remote server';
        if (reason)
            msg += `: ${reason}`;
        this.logger.log('network', msg);
        this.logger.finalize();
    }
}

module.exports = {Client};
