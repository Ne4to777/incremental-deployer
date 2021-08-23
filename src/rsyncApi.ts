// @ts-ignore
import Rsync from 'rsync';

import {DEFAULT_PORT, DEFAULT_REMOTE_PATH} from './constants';

export type RsyncRemoteExec = (params: {
    paths: string[],
    login: string,
    host: string,
    port: string | number,
    privateKey?: string,
    remotePath: string,
    outDir: string
}) => Promise<string>
export const rsyncRemoteExec: RsyncRemoteExec = ({
    paths,
    login,
    host,
    port = DEFAULT_PORT,
    privateKey,
    remotePath = DEFAULT_REMOTE_PATH,
    outDir
}) => new Promise((resolve, reject) => Rsync
    .build({
        source: paths,
        destination: `${login}@${host}:${remotePath}`,
        shell: `ssh ${privateKey ? `-i ${privateKey} `: ''}-p ${port}`,
        cwd: outDir,
        flags: 'aR',
    })
    .execute((err: any, code: number, cmd: string) => {
        if (err) {
            switch (code) {
                case 255:
                    console.error('Connection: bad login, host or port');
                    break;
                case 23:
                    console.error('Connection: bad remotePath or paths to upload');
                    break;
                default:
                    console.log('Connection: unknown error')
            }
            return reject(err)
        }
        console.log(`Rsync: ${cmd}`);
        return resolve(cmd)
    }))

export type RsyncLocalExec = (params: {
    paths: string[],
    outDir: string,
    cwd?: string,
}) => Promise<string>

export const rsyncLocalExec: RsyncLocalExec = ({
    paths,
    outDir,
    cwd,
}) => new Promise((resolve, reject) => Rsync
    .build({
        source: paths,
        destination: outDir,
        flags: 'R',
        cwd
    })
    .execute((err: any, code: number, cmd: string) => {
        if (err) return reject(err)
        console.log(`Rsync: ${cmd}`);
        return resolve(cmd)
    }))
