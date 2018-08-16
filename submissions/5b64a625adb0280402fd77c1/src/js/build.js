#!/usr/bin/env node
'use strict';

const fs = require('fs');

const js = fs.readFileSync(process.argv[2]).toString();
const weights = fs.readFileSync(process.argv[3]).toString().trim();

process.stdout.write(js.replace(/{\/\*weights\*\/}/, weights));
