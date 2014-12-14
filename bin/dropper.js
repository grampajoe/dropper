#!/usr/bin/env node

var cli = require('../lib/cli'),
    dropper = require('../lib/dropper');

cli(process.argv, dropper);
