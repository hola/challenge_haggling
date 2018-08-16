'use strict'; /*jslint node:true*/
const cluster = require('cluster');
const events = require('events');
const fs = require('fs');
const vm = require('vm');

class AI extends events.EventEmitter {
    constructor(script, timeout, me, counts, values, max_rounds){
        super();
        this.timer = undefined;
        this.timeout = timeout;
        this.worker = cluster.fork({script});
        this.worker.addListener('message', ({type, data})=>{
            switch (type)
            {
            case 'offer':
                if (this.timer)
                {
                    clearTimeout(this.timer);
                    this.timer = undefined;
                }
                return this.emit('offer', data);
            case 'info':
                return this.emit('info', data);
            case 'abort':
                if (this.timer)
                {
                    clearTimeout(this.timer);
                    this.timer = undefined;
                }
                return this.emit('abort', data);
            }
        });
        this.worker.send({type: 'init',
            data: [me, counts, values, max_rounds]});
        if (me==0)
            this.offer();
    }
    label(){ return 'script'; }
    offer(o){
        this.worker.send({type: 'offer', data: o});
        if (this.timeout)
        {
            this.timer = setTimeout(()=>this.emit('abort', 'AI timeout'),
                this.timeout);
        }
    }
    destroy(){
        if (this.timer)
        {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        if (this.worker.process)
            this.worker.process.kill();
    }
    static worker_run(){
        const id = '__hola_xyzzy__';
        let text = fs.readFileSync(process.env.script, 'utf8');
        // strip BOM and/or shebang
        text = text.slice(/^\ufeff?(#![^\r\n]*)?/.exec(text)[0].length)+'\n';
        let m = {exports: {}};
        let console = Object.create(global.console);
        console.log = console.info = ()=>{};
        let context = vm.createContext({
            module: m,
            exports: m.exports,
            console,
            Buffer,
            __hola_log__: data=>process.send({type: 'info', data}),
        });
        context.global = context;
        process.on('message', ({type, data})=>{
            if (!context)
                return;
            switch (type)
            {
            case 'init':
                try {
                    vm.runInContext(
                        `(function(exports, module){${text}})`
                        +`.call(exports, exports, module);`
                        + `const ${id} = new module.exports(`
                        +data.map(JSON.stringify).join(',')
                        +`, __hola_log__);`, context,
                        {filename: process.env.script});
                } catch(e){
                    context = undefined;
                    process.send({type: 'abort', data: String(e)});
                }
                return;
            case 'offer':
                let o = data ? JSON.stringify(data) : '';
                try {
                    o = vm.runInContext(`${id}.offer(${o})`, context);
                } catch(e){
                    context = undefined;
                    return process.send({type: 'abort', data: String(e)});
                }
                process.send({type: 'offer', data: o});
                return;
            }
        });
    }
}

class UnsafeAI extends events.EventEmitter {
    constructor(script, me, counts, values, max_rounds){
        super();
        let path = require('path');
        this.script = path.basename(script);
        this.mod = require(fs.realpathSync(script));
        this.agent = undefined;
        process.nextTick(()=>this._init(me,
            Array.from(counts), Array.from(values), max_rounds));
    }
    _init(me, counts, values, max_rounds){
        try {
            this.agent = new this.mod(me, counts, values, max_rounds,
                this._info.bind(this));
        } catch(e){
            return this.emit('abort', String(e));
        }
        if (me==0)
            this.offer();
    }
    label(){ return this.script; }
    offer(o){
        let res;
        try {
            res = this.agent.offer(o && Array.from(o));
        } catch(e){
            return this.emit('abort', String(e));
        }
        this.emit('offer', res && Array.from(res));
    }
    destroy(){}
    _info(text){ this.emit('info', text); }
}

module.exports = {AI, UnsafeAI};
