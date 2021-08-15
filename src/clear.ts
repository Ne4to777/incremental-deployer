import {deleteDirSync, deleteJSONSync, existsSync, iterateStages} from './utils';
import {DEFAULT_CACHE_FILE, DEFAULT_DEPLOY_DIR} from './constants';

type Clear = (args: any) => (config: any) => Promise<any>
export default (() => async ({
    stages = [],
    outDir: stagedDir = DEFAULT_DEPLOY_DIR,
    deployerCacheName = DEFAULT_CACHE_FILE,
}) => {
    if (existsSync(deployerCacheName)) deleteJSONSync(deployerCacheName)
    if (stagedDir && existsSync(stagedDir)) deleteDirSync(stagedDir)
    await iterateStages(({outDir, diffDir}) => {
        if (existsSync(outDir)) deleteDirSync(outDir)
        if (existsSync(diffDir)) deleteDirSync(diffDir)
    })(stages)

    console.log('"clear" is done!')
}) as Clear
