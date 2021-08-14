import {exec} from 'child_process';
import path from 'path';

import {rsyncExec} from './rsyncApi';
import {
    createHashMap,
    readJSONSync,
    writeJSONSync,
    getHashMapDiff,
    existsSync,
} from './utils';

const cwd = process.cwd()

export default ({config: configPath = 'deployer.config.json'}: Record<string, any>): any => {
    const configFullPath = path.join(cwd, configPath)

    if (!existsSync(configFullPath)) return console.log(`Config file "${configPath}" does not exist at ${cwd}`)

    const {
        command = 'echo No command to build',
        stagedDirName = 'dist',
        deployerCacheName = '.deployerCache.json',
        login,
        port = 22,
        host,
        remotePath = '~',
    } = readJSONSync(configFullPath)

    return exec(command, (error, stdout, stderr) => {
        if (stderr) console.log(stderr);
        if (stdout) console.log(stdout);
        if (error) return console.error(error);
        if (!existsSync(stagedDirName)) return console.log(`Folder "${stagedDirName}" does not exist at ${cwd}`)

        const writeCacheSync = (data: any) => writeJSONSync(deployerCacheName)(data);

        const hashMapActual = createHashMap(stagedDirName);

        if (!existsSync(deployerCacheName)) {
            writeCacheSync(hashMapActual);
            return console.log('Preparation completed! Make changes and run deployer again');
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
