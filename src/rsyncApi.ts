// @ts-ignore
import Rsync from 'rsync';

export type RsyncExec = (params: {
    paths: string[],
    stagedDirName: string,
    login: string,
    host: string,
    port: string | number,
    remotePath: string
}) => Promise<string>
export const rsyncExec: RsyncExec = ({
    paths,
    stagedDirName,
    login,
    host,
    port,
    remotePath
}) => new Promise((resolve, reject) => Rsync
    .build({
        source: paths.map(path => path.replace(new RegExp(`^${stagedDirName}/`), '')),
        destination: `${login}@${host}:${remotePath}`,
        shell: `ssh -p ${port}`,
        cwd: stagedDirName,
        flags: 'aR',
    })
    .execute((err: any, code: number, cmd: string) => {
        if (err) {
            switch (code) {
                case 255:
                    console.error('Connection: bad login, host or port');
                    break;
                case 23:
                    console.error('Connection: bad remotePath');
                    break;
                default:
                    console.log('Connection: unknown error')
            }
            return reject(err)
        }
        console.log(cmd);
        return resolve(cmd)
    }))
