#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import run from './run';

const args = yargs(hideBin(process.argv))
    .options({
        config: {
            alias: 'c',
            describe: 'config file path',
            type: 'string',
        }
    })
    .parseSync();

run(args);
