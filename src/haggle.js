#!/usr/bin/env node
'use strict'; /*jslint node:true*/
const cluster = require('cluster');
const random_js = require('random-js');
const client = require('./client.js');
const generate = require('./generate.js');
const loader = require('./loader.js');
const log = require('./log.js');
const session = require('./session.js');
const ui = require('./ui.js');
const getopt = require('node-getopt').create([
    ['l', 'log=FILE.json', 'log the session into a machine-readable file'],
    ['r', 'replay=FILE.json', 'replay a logged session'],
    ['t', 'timeout=MS',
        'enforce timeout upon scripts (default: do not enforce)'],
    ['s', 'seed=N',
        'pseudo-random seed for session parameters (default: random)'],
    ['I', 'id=ID', 'agent identifier for the remote server'],
    ['T', 'types=N', 'types of objects (default: 3)'],
    ['m', 'min-objects=N', 'minimum total number of objects (default: 1)'],
    ['M', 'max-objects=N', 'maximum total number of objects (default: 6)'],
    ['V', 'total-value=V', 'total value of all objects (default: 10)'],
    ['R', 'max-rounds=N', 'maximum number of negotiation rounds (default: 5)'],
    ['u', 'unsafe', 'use unsafe, in-process script loader without VM'],
    ['f', 'force', 'override Node.js version check'],
    ['q', 'quiet', 'do not log to the console'],
    ['h', 'help', 'show this text'],
]).bindHelp(`Usage: node haggle.js [OPTION...] [AGENT1 [AGENT2]]

[[OPTIONS]]

Run one or more negotiation sessions involving a human, local scripts or
a remote server.

Two human agents:
  node haggle.js [OPTION...]
Human vs. script:
  node haggle.js [OPTION...] SCRIPT
Script vs. script;
  node haggle.js [OPTION...] SCRIPT SCRIPT
Human vs. remote agent:
  node haggle.js [OPTION...] URL
Script vs. remote agent:
  node haggle.js [OPTION...] SCRIPT URL`);

const REQUIRED_NODE_VERSION = 'v10.4.1';

function die(msg){
    console.error(msg);
    process.exit(1);
}

function main(){
    let {options, argv} = getopt.parseSystem();
    if (argv.length>2)
        return getopt.showHelp();
    if (!options.force && REQUIRED_NODE_VERSION
        && process.version!=REQUIRED_NODE_VERSION)
    {
        die(`Run this script with Node.js ${REQUIRED_NODE_VERSION}`
            +` or use --force to override`);
    }
    if (options.replay)
    {
        if (argv.length)
            die('--replay must be used without other arguments');
        return log.replay(options.replay, new ui.Logger());
    }
    let mk_agent = [], remote, shuffle = false;
    for (let a of argv)
    {
        if (/^wss?:\/\//.test(a))
        {
            if (remote)
                return getopt.showHelp();
            remote = a;
        }
        else
        {
            if (options.unsafe)
            {
                mk_agent.push(
                    (...arg)=>new loader.UnsafeAI(a, ...arg));
            }
            else
            {
                mk_agent.push(
                    (...arg)=>new loader.AI(a, options.timeout|0, ...arg));
            }
        }
    }
    if (options.timeout && options.unsafe)
        die('--timeout is incompatible with --unsafe');
    if (!mk_agent[0])
    {
        if (options.quiet)
            die('--quiet cannot be used with a human agent');
        mk_agent[0] = (...arg)=>new ui.Agent(...arg);
        shuffle = true;
    }
    if (!mk_agent[1] && !remote)
    {
        if (options.quiet)
            die('--quiet cannot be used with a human agent');
        mk_agent[1] = (...arg)=>new ui.Agent(...arg);
        shuffle = true;
    }
    let loggers = [];
    if (!options.quiet)
        loggers.push(new ui.Logger());
    if (options.log)
        loggers.push(new log.FileLogger(options.log));
    let multi_logger = new log.MultiLogger(loggers);
    if (remote)
    {
        if (!options.id)
            die('When using a remote server, --id is mandatory');
        if (options.seed)
            die('--seed cannot be used with a remote server');
        if (options.types)
            die('--types cannot be used with a remote server');
        if (options['min-objects'])
            die('--min-objects cannot be used with a remote server');
        if (options['max-objects'])
            die('--max-objects cannot be used with a remote server');
        if (options['total-value'])
            die('--total-value cannot be used with a remote server');
        if (options['max-rounds'])
            die('--max-rounds cannot be used with a remote server');
        new client.Client(remote, options.id, mk_agent[0], multi_logger);
    }
    else
    {
        let seed = options.seed>>>0 || undefined;
        if (options.id)
            die('--id cannot be used without a remote server');
        if (!Number.isFinite(seed))
            seed = Math.random()*0x7fffffff|0;
        let types = (options.types|0)||3;
        let min_obj = (options['min-objects']|0)||1;
        let max_obj = (options['max-objects']|0)||6;
        let total = (options['total-value']|0)||10;
        let max_rounds = (options['max-rounds']|0)||5;
        if (types<2 || types>10)
            die('--types must be between 2 and 10');
        if (min_obj<1 || min_obj>10)
            die('--min-objects must be between 1 and 10');
        if (max_obj<1 || max_obj>100)
            die('--max-objects must be between 1 and 100');
        if (min_obj>max_obj)
            die('--min-objects cannot exceed --max-objects');
        if (total<max_obj)
            die('--total-value cannot be less than --max-objects');
        if (max_rounds<1)
            die('--max-rounds must be at least 1');
        let generator;
        try {
            generator = new generate.Generator(types, min_obj, max_obj, total,
                max_rounds);
        } catch(e){
            die(String(e));
        }
        multi_logger.log('seed', seed);
        let random = new random_js(random_js.engines.mt19937().seed(seed));
        if (random.bool() && shuffle)
            mk_agent = [mk_agent[1], mk_agent[0]];
        new session.Session(generator.get(random), mk_agent, multi_logger);
    }
}

if (cluster.isMaster)
    main();
else
    loader.AI.worker_run();
