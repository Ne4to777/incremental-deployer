#!/usr/bin/env node

import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';

import run from '../run';

const args = yargs(hideBin(process.argv))
    .options({
        config: {
            alias: 'c',
            describe: 'config file path',
            type: 'string',
        },
        init: {
            alias: 'i',
            describe: 'init or reinit cache infrastructure',
            type: 'boolean',
        },
        clear: {
            alias: 'x',
            describe: 'delete cache infrastructure',
            type: 'boolean',
        }
    })
    .parseSync();

run(args);
