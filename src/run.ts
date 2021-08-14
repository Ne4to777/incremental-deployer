import {exec} from 'child_process';
import fs from 'fs';

import {rsyncExec} from './rsyncApi';
import {
    createHashMap,
    readJSONSync,
    writeJSONSync,
    deleteJSONSync,
    getHashMapDiff,
} from './utils';

export default ({config: configPath = 'deployer.config.json'}: Record<string, any>): void => {
    const {
        command = 'echo No command to build',
        stagedDirName = 'dist',
        deployerCacheName = '.deployerCache.json',
        login,
        port = 22,
        host,
        remotePath = '~',
    } = readJSONSync(configPath)

    exec(command, (error, stdout, stderr) => {
        if (stderr) console.log(stderr);
        if (stdout) console.log(stdout);
        if (error) return console.error(error);

        const writeCacheSync = (data: any) => writeJSONSync(deployerCacheName)(data);

        let ifDeployerCacheExists = fs.existsSync(deployerCacheName)

        if (!fs.existsSync(stagedDirName)) {
            fs.mkdirSync(stagedDirName)
            if (ifDeployerCacheExists) {
                deleteJSONSync(deployerCacheName)
                ifDeployerCacheExists = false
            }
        }

        const hashMapActual = createHashMap(stagedDirName);

        if (!ifDeployerCacheExists) {
            writeCacheSync(hashMapActual);
            return console.log('Preparation completed! Make changes and run deploy again');
        }

        const hashMapControl = readJSONSync(deployerCacheName);

        const hashMapDiff = getHashMapDiff(hashMapControl)(hashMapActual)
        const paths = Object.keys(hashMapDiff);

        if (!paths.length) return console.log('Nothing to deploy');

        console.log('Number of files to be uploaded: ', paths.length);

        return rsyncExec({paths, stagedDirName, login, host, port, remotePath})
            .then(() => writeCacheSync(hashMapActual))
    })
}
