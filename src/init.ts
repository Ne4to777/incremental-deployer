import {mkdirSync} from 'fs';
import path from 'path';

import {createHashMap, deleteDirSync, execCommandSync, existsSync, iterateStages, writeJSONSync} from './utils';
import {DEFAULT_CACHE_FILE, DEFAULT_DEPLOY_DIR} from './constants';

type Init = (args: any) => (config: any) => Promise<any>;
export default (() => async ({
    command: stageCommand,
    stages = [],
    outDir: stagedDir = DEFAULT_DEPLOY_DIR,
    deployerCacheName = DEFAULT_CACHE_FILE,
}) => {
    const writeCacheSync = writeJSONSync(deployerCacheName);
    const hashMapActual: any = {};

    if (stageCommand) {
        execCommandSync(stageCommand)
    } else {
        await iterateStages(({command, outDir = stagedDir, diffDir}) => {
            execCommandSync(command);
            if (outDir === stagedDir) return
            hashMapActual[outDir] = createHashMap(outDir)
            if (diffDir && !existsSync(diffDir)) mkdirSync(diffDir);
        })(stages)
    }

    if (existsSync(stagedDir)){
        hashMapActual[stagedDir] = createHashMap(stagedDir)
        deleteDirSync(stagedDir)
    }

    mkdirSync(stagedDir)
    writeCacheSync(hashMapActual);

    console.log('Preparation completed! Run deployer every time you make changes');
}) as Init;
