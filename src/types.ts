export type Stage = {
    outDir?: string,
    command: string,
    diffDir?: string,
}
export type Config = {
    ssh: {
        login: string,
        host: string,
        port?: number | string,
        remotePath: string
    },
    deployerCacheName?: string,
    outDir?: string,
    command?: string,
    stages?: Array<Array<Stage>>
}
