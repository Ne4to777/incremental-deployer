import path from 'path';

import {
    createHashMap,
    getHashMapDiff,
    iterateStages,
    readJSONSync,
    writeJSONSync,
    execCommandSync
} from './utils';
import {rsyncLocalExec, rsyncRemoteExec} from './rsyncApi';
import {DEFAULT_CACHE_FILE, DEFAULT_DEPLOY_DIR} from './constants';

type Deploy = (args: any) => (config: any) => Promise<any>
export default (() => async ({
    ssh = {},
    command: stageCommand,
    stages = [],
    outDir: stagedDir = DEFAULT_DEPLOY_DIR,
    localPath = './',
    deployerCacheName = DEFAULT_CACHE_FILE
}) => {
    const writeCacheSync = writeJSONSync(deployerCacheName);
    const hashMapControl = readJSONSync(deployerCacheName);
    const hashMapActual: any = {}

    if (stageCommand) {
        execCommandSync(stageCommand)
    } else {
        await iterateStages(async ({command, outDir = stagedDir, diffDir}) => {
            execCommandSync(command)

            if (outDir === stagedDir) return
            hashMapActual[outDir] = createHashMap(outDir);

            if (!diffDir) return
            const diffPaths = Object.keys(getHashMapDiff(hashMapControl[outDir])(hashMapActual[outDir]))

            if (!diffPaths.length) return
            const outDirRE = new RegExp(`^${outDir}/`)

            return rsyncLocalExec({
                paths: diffPaths.map(p => p.replace(outDirRE, '')),
                outDir: path.join('..', diffDir, '/'),
                cwd: outDir
            })
        })(stages)
    }

    hashMapActual[stagedDir] = createHashMap(stagedDir);

    const pathsToDeploy = Object.keys(getHashMapDiff(hashMapControl[stagedDir])(hashMapActual[stagedDir]))

    if (!pathsToDeploy.length) return console.log('Nothing to deploy');

    console.log('Number of files to be uploaded: ', pathsToDeploy.length);

    const outDirRE = new RegExp(`^${stagedDir}/`)
    const paths = pathsToDeploy.map(p => p.replace(outDirRE, ''))

    await (
        Object.keys(ssh).length
            ? rsyncRemoteExec({
                ...ssh,
                outDir: stagedDir,
                paths
            })
            : rsyncLocalExec({
                outDir: path.resolve('..', localPath),
                paths,
                cwd: stagedDir
            })
    )


    writeCacheSync(hashMapActual)
    console.log('"deploy" is done!')
}) as Deploy
