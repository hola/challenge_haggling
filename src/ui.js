'use strict'; /*jslint node:true*/
const events = require('events');
const ansi_diff_stream = require('ansi-diff-stream');
const ansi_escapes = require('ansi-escapes');
const chalk = require('chalk');
const keypress = require('keypress');
const log = require('./log.js');

keypress(process.stdin);

const agent_names = ['Alice', 'Bob'];
const agent_styles = [chalk.magentaBright.bold, chalk.cyanBright.bold];

const item_names = [
    'book',
    'hat',
    'ball',
    'flower',
    'bottle',
    'cookie',
    'hammer',
    'chair',
    'spoon',
    'pencil',
];

function agent_prefix(agent, label){
    let name = agent_names[agent];
    if (label)
        name += ` (${label})`;
    return agent_styles[agent](name+':')+' ';
}

function format_list(items, last_sep=' and ', sep=', '){
    let res = '';
    for (let i = 0; i<items.length; i++)
    {
        if (i)
            res += i==items.length-1 ? last_sep : sep;
        res += items[i];
    }
    return res;
}

function format_valuation(values, is='is'){
    return format_list(values.map(
        (v, i)=>`a ${item_names[i]} ${is} worth $${v}`), ', and ');
}

class OfferPrompt extends events.EventEmitter {
    constructor(me, label, counts, values, initial){
        super();
        this.me = me;
        this.label = label;
        this.counts = counts;
        this.values = values;
        this.can_accept = !!initial;
        this.accept = false;
        this.choices = Array.from(initial || counts);
        this.cursor = this.can_accept ? 0 : 1;
        this.initial_sum = 0;
        if (initial)
        {
            for (let i = 0; i<counts.length; i++)
                this.initial_sum += initial[i]*values[i];
        }
        this.out = ansi_diff_stream();
        this.out.pipe(process.stdout);
        this._on_keypress = this._on_keypress.bind(this);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.addListener('keypress', this._on_keypress);
        process.stdout.write(ansi_escapes.cursorHide);
        OfferPrompt.active = this;
        this._render();
    }
    _on_keypress(ch, key){
        let code = ch;
        if (key)
        {
            if (!ch || ch.charCodeAt(0)<=32)
                code = key.name;
            if (key.ctrl)
                code = 'C-'+code;
            if (key.meta)
                code = 'M-'+code;
        }
        switch (code)
        {
        case 'q':
        case 'Q':
        case 'C-c':
        case 'escape':
            this.destroy();
            this.emit('abort');
            break;
        case 'return':
            this.destroy();
            this.emit('complete', this.accept ? undefined : this.choices);
            break;
        case 'left':
            if (this.can_accept)
            {
                if (this.cursor==0)
                    this.accept = true;
                else
                    this.cursor--;
            }
            else if (this.cursor>1)
                this.cursor--;
            this._render();
            break;
        case 'right':
            if (this.can_accept && this.cursor==0 && this.accept)
                this.accept = false;
            else if (this.cursor<this.counts.length*2)
                this.cursor++;
            this._render();
            break;
        case 'up':
            if (this.cursor==0)
                this.accept = !this.accept;
            else if (this.cursor<=this.counts.length)
                this._try_change(this.cursor-1, 1);
            else
                this._try_change(this.cursor-this.counts.length-1, -1);
            this._render();
            break;
        case 'down':
            if (this.cursor==0)
                this.accept = !this.accept;
            else if (this.cursor<=this.counts.length)
                this._try_change(this.cursor-1, -1);
            else
                this._try_change(this.cursor-this.counts.length-1, 1);
            this._render();
            break;
        default:
            if (/^\d$/.test(code))
            {
                if (this.cursor>this.counts.length)
                    this._try_set(this.cursor-this.counts.length-1, +code);
                else if (this.cursor>0)
                    this._try_set(this.cursor-1, +code);
                this._render();
            }
        }
    }
    _try_change(i, inc){ this._try_set(i, this.choices[i]+inc); }
    _try_set(i, v){
        if (v>=0 && v<=this.counts[i])
            this.choices[i] = v;
    }
    _field(text, active){
        let style = chalk.bold;
        if (active)
            style = style.greenBright.underline;
        else
            style = style.whiteBright;
        return style(text);
    }
    _render(){
        let output = '';
        output += `To you, ${format_valuation(this.values)}.\n`;
        if (this.can_accept)
        {
            output += `${agent_names[1-this.me]}'s offer is worth `
                +`$${this.initial_sum}.\n`;
        }
        output += agent_prefix(this.me, this.label);
        if (this.can_accept)
        {
            output += this._field(this.accept ? 'I accept' : 'I don\'t accept',
                this.cursor==0);
            output += '!';
            if (!this.accept)
                output += ' ';
        }
        if (!this.accept)
        {
            output += 'I want ';
            output += format_list(this.choices.map((n, i)=>{
                let value = `${n} ${item_names[i]}`;
                if (n!=1)
                    value += 's';
                return this._field(value, this.cursor==i+1);
            }));
            output += '; you get ';
            output += format_list(this.choices.map((n, i)=>{
                let value = `${this.counts[i]-n} ${item_names[i]}`;
                if (this.counts[i]-n!=1)
                    value += 's';
                return this._field(value, this.cursor==i+this.counts.length+1);
            }));
            output += '.';
        }
        output += '\n';
        if (!this.accept)
        {
            let sum = 0;
            for (let i = 0; i<this.counts.length; i++)
                sum += this.choices[i]*this.values[i];
            output += this.can_accept ? 'Your counter-' : 'Your ';
            output += `offer is worth $${sum} to you.\n`;
        }
        output += 'Use arrow keys to change your choice and Enter to submit.';
        this.out.write(output);
    }
    interject(text){
        this.out.clear();
        process.stdout.write(text);
        this._render();
    }
    destroy(){
        OfferPrompt.active = undefined;
        this.out.clear();
        this.out.unpipe();
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ansi_escapes.cursorShow);
        process.stdin.removeListener('keypress', this._on_keypress);
    }
}
OfferPrompt.active = undefined;

class Agent extends events.EventEmitter {
    constructor(me, counts, values, max_rounds){
        super();
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.current = undefined;
        this.prompt = undefined;
        if (this.me==0)
            this._prompt();
    }
    label(){ return 'human'; }
    offer(o){
        this.current = o;
        this._prompt();
    }
    destroy(){
        if (this.prompt)
        {
            this.prompt.destroy();
            this.prompt = undefined;
        }
    }
    _prompt(){
        this.prompt = new OfferPrompt(this.me, this.label(), this.counts,
            this.values, this.current);
        this.prompt.on('abort', this._on_abort.bind(this));
        this.prompt.on('complete', this._on_complete.bind(this));
    }
    _on_abort(){
        this.prompt = undefined;
        this.emit('abort', 'Session canceled');
    }
    _on_complete(o){
        this.propmt = undefined;
        this.emit('offer', o);
    }
}

class Logger extends log.Logger {
    constructor(){
        super();
        this.labels = undefined;
        this.counts = undefined;
        this.first = true;
    }
    _write(line){
        if (!line)
            return;
        if (OfferPrompt.active)
            OfferPrompt.active.interject(line+'\n');
        else
            process.stdout.write(line+'\n');
    }
    _format_offer(values){
        let items = [], empty = true, full = true;
        for (let i = 0; i<this.counts.length; i++)
        {
            if (values[i]==0)
                full = false;
            else if (values[i]==this.counts[i])
            {
                empty = false;
                if (values[i]==1)
                    items.push(`the ${item_names[i]}`);
                else if (values[i]==2)
                    items.push(`both ${item_names[i]}s`);
                else
                    items.push(`all the ${item_names[i]}s`);
            }
            else
            {
                empty = full = false;
                if (values[i]==1)
                    items.push(`a ${item_names[i]}`);
                else
                    items.push(`${values[i]} ${item_names[i]}s`);
            }
        }
        if (empty)
            return 'nothing';
        if (full)
            return 'everything';
        return format_list(items);
    }
    _agent_prefix(agent){
        return agent_prefix(agent, this.labels && this.labels[agent]);
    }
    log_init(labels, counts){
        this.labels = labels;
        this.counts = counts;
        let output = 'There are ';
        output += format_list(counts.map(
            (c, i)=>c>1 ? `${c} ${item_names[i]}s` : `a ${item_names[i]}`));
        output += '.';
        this._write(chalk.whiteBright.bold(output));
    }
    log_offer(agent, partition){
        let output = this._agent_prefix(agent);
        if (partition)
        {
            if (!this.first)
                output += 'I don\'t accept. ';
            output += 'I want ';
            output += this._format_offer(partition[agent]);
            output += '; you get ';
            output += this._format_offer(partition[1-agent]);
            output += '.';
        }
        else
            output += 'I accept.';
        this._write(output);
        this.first = false;
    }
    log_abort(agent, reason){
        let output = '';
        if (agent!=null)
            output += this._agent_prefix(agent);
        output += chalk.red(reason);
        this._write(output);
    }
    log_info(agent, text){
        let output = '';
        if (agent!=null)
            output += this._agent_prefix(agent);
        output += chalk.yellow(text);
        this._write(output);
    }
    log_done(agreed){
        let output = agreed
            ? 'Agreement achieved.' : 'Agreement not achieved.';
        this._write(chalk.whiteBright.bold(output));
    }
    log_seed(seed){
        let output = `Using pseudo-random seed ${seed}`;
        this._write(chalk.whiteBright.bold(output));
    }
    log_valuation(agent, values){
        let output = `For ${agent_styles[agent](agent_names[agent])}, `;
        output += format_valuation(values, 'was');
        output += '.';
        this._write(output);
    }
    log_score(agent, s){
        let output = `${agent_styles[agent](agent_names[agent])} got $${s}.`;
        this._write(output);
    }
    log_network(text){
        let output = chalk.cyan(text);
        this._write(output);
    }
}

module.exports = {Agent, Logger};
