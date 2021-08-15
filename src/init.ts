import {mkdirSync} from 'fs';

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

    hashMapActual[stagedDir] = createHashMap(stagedDir)

    writeCacheSync(hashMapActual);

    if (existsSync(stagedDir)) deleteDirSync(stagedDir)
    mkdirSync(stagedDir)

    console.log('Preparation completed! Make changes and run deployer with no flags');
}) as Init;
