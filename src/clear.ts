import {deleteDirSync, deleteJSONSync, existsSync, iterateStages} from './utils';
import {DEFAULT_CACHE_FILE, DEFAULT_DEPLOY_DIR, DEFAULT_ROOT_DIR} from './constants';

type Clear = (args: any) => (config: any) => Promise<any>
export default (() => async ({
    stages = [],
    outDir: stagedDir = DEFAULT_DEPLOY_DIR,
    rootDir = DEFAULT_ROOT_DIR,
    deployerCacheName = DEFAULT_CACHE_FILE,
}) => {
    if (rootDir === DEFAULT_ROOT_DIR) {
        if (existsSync(deployerCacheName)) deleteJSONSync(deployerCacheName)
        await iterateStages(({outDir, diffDir}) => {
            if (existsSync(outDir)) deleteDirSync(outDir)
            if (diffDir && existsSync(diffDir)) deleteDirSync(diffDir)
        })(stages)
    } else {
        deleteDirSync(rootDir)
        await iterateStages(({outDir}) => {
            if (existsSync(outDir)) deleteDirSync(outDir)
        })(stages)
    }
    if (stagedDir && existsSync(stagedDir)) deleteDirSync(stagedDir)

    console.log('"clear" is done!')
}) as Clear
