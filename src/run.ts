import {exec} from 'child_process';
import fs from 'fs';

import type {HashMap} from './types';
import {rsyncExec} from './rsyncApi';
import {
    getProp,
    createHashMap,
    pipeSync,
    readJSONSync,
    writeJSONSync,
    deleteJSONSync,
} from './utils';

const getConfig = pipeSync([
    getProp('config', 'deployer.config.json'),
    readJSONSync
]);

const getHashMapDiff = (hashMapControl: HashMap) => (hashMapActual: HashMap) => Object
    .entries(hashMapActual)
    .reduce(
        (acc, [key, value]) => {
            if (hashMapControl[key] !== value) acc[key] = value;
            return acc;
        },
        {} as HashMap
    );


export default pipeSync([
    getConfig,
    ({
        command = 'echo No command to build',
        stagedDirName = 'dist',
        deployCacheName = '.deployCache.json',
        login,
        port = 22,
        host,
        remotePath = '~',
    }) => exec(command, (error, stdout, stderr) => {
        if (stderr) console.log(stderr);
        if (stdout) console.log(stdout);
        if (error) return console.error(error);

        const writeCacheSync = (data: any) => writeJSONSync(deployCacheName)(data);

        let ifDeployCacheExists = fs.existsSync(deployCacheName)

        if (!fs.existsSync(stagedDirName)) {
            fs.mkdirSync(stagedDirName)
            if (ifDeployCacheExists) {
                deleteJSONSync(deployCacheName)
                ifDeployCacheExists = false
            }
        }

        const hashMapActual = createHashMap(stagedDirName);

        if (!ifDeployCacheExists) {
            writeCacheSync(hashMapActual);
            return console.log('Preparation completed! Make changes and run deploy again');
        }

        const hashMapControl = readJSONSync(deployCacheName);

        const hashMapDiff = getHashMapDiff(hashMapControl)(hashMapActual)
        const paths = Object.keys(hashMapDiff);

        if (!paths.length) return console.log('Nothing to deploy');

        console.log('Number of files to be uploaded: ', paths.length);

        return rsyncExec({paths, stagedDirName, login, host, port, remotePath})
            .then(() => writeCacheSync(hashMapActual))
    }),
]);
