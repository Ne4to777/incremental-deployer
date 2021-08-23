import {readJSON, pipe, getProp, ifElse, pathJoin2, T, existsSync, writeJSONSync} from './utils';
import deploy from './deploy';
import clear from './clear';
import init from './init';
import type {Config} from './types';

type GetConfig = (args: any) => Config
const getConfig: GetConfig = pipe([
    getProp('config', 'deployer.config.json'),
    pathJoin2(process.cwd()),
    ifElse(existsSync)([
        readJSON,
        pipe([
            writeJSONSync,
            write => pipe([
                readJSON,
                write
            ])('init.config.json')
        ])
    ])
])

type Run = (args: any) => Promise<any>;
export default (args => pipe([
    getConfig,
    config => pipe([
        ifElse(getProp('clear'))([clear, ifElse(getProp('init'))([init, deploy])]),
        T(config)
    ])(args)
])(args)) as Run
