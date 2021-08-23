import fs, {promises} from 'fs';
import path from 'path';
import crypto from 'crypto';
import {execSync} from 'child_process';

import {Stage} from './types';

export type HashMap = Record<string, string>

export type AnyToAnyT = (...xs: any) => any;

type IType = <Arg>(x: Arg) => Arg
export const I: IType = x => x;

type KType = <Arg>(x: Arg) => () => Arg
export const K: KType = x => () => x

type TType = <Arg, Result>(x?: Arg) => (f: (_x?: Arg) => Result) => Result
export const T: TType = x => f => f(x);

type PipeReducer = <Arg, First, Second>(
    acc: (x: Arg) => Promise<First>, f: (x: First) => Promise<Second>
) => (x: Arg) => Promise<Second>
const pipeReducer: PipeReducer = (acc, f) => async x => f(await acc(x));

type Pipe = (xs: AnyToAnyT[]) => AnyToAnyT
export const pipe: Pipe = xs => xs.reduce(pipeReducer, I);

type PipeSyncReducer = <Arg, First, Second>(acc: (x: Arg) => First, f: (x: First) => Second) => (x: Arg) => Second
const pipeSyncReducer: PipeSyncReducer = (acc, f) => x => f(acc(x));

type PipeSync = (xs: AnyToAnyT[]) => AnyToAnyT
export const pipeSync: PipeSync = xs => xs.reduce(pipeSyncReducer, I);

type Info = (msg: string) => <Arg>(x: Arg) => Arg
export const info: Info = msg => x => {
    console.log(msg);
    return x;
};
type Log = <Arg>(x: Arg) => Arg
export const log: Log = x => {
    console.log(x);
    return x;
};

type GetProp = <O, DefValue>(key: keyof O, def?: DefValue) => (o: O) => O[keyof O] | DefValue | void
export const getProp: GetProp = (key, def) => o => key in o ? o[key] : def;

type ExecCommandSync = (command: string) => void
export const execCommandSync: ExecCommandSync = command => execSync(command, {stdio: 'inherit'})

type ExistsSync = (filepath: string) => boolean
export const existsSync: ExistsSync = filepath => fs.existsSync(filepath);

type ReadJSONSync = (filepath: string) => Record<string, HashMap>
export const readJSONSync: ReadJSONSync = filepath => JSON.parse(fs.readFileSync(filepath, 'utf-8'));

type ReadJSON = (filepath: string) => Promise<Record<string, HashMap>>
export const readJSON: ReadJSON = filepath => promises.readFile(filepath, 'utf-8').then(JSON.parse)

type WriteJSONSync = (filename: any) => (data: any) => void
export const writeJSONSync: WriteJSONSync = filename => data => fs
    .writeFileSync(filename, JSON.stringify(data, null, '\t'), 'utf-8');

type DeleteJSONSync = (filename: any) => void
export const deleteJSONSync: DeleteJSONSync = filename => fs
    .unlinkSync(filename);

type DeleteDirSync = (dirname: any) => void
export const deleteDirSync: DeleteDirSync = dirname => fs
    .rmdirSync(dirname, {recursive: true})

export type CreateHashMap = (parentPath: string) => Record<string, string>
export const createHashMap: CreateHashMap = parentPath => fs.readdirSync(parentPath)
    .reduce((acc, itemName) => {
        const fullPath = path.join(parentPath, itemName);
        if (fs.statSync(fullPath).isDirectory()) return {...acc, ...createHashMap(fullPath)};
        acc[fullPath] = crypto
            .createHash('md5')
            .update(fs.readFileSync(fullPath))
            .digest('hex');
        return acc;
    }, {} as Record<string, string>);

type GetHashMapDiff = (hashMapControl: HashMap) => (hashMapActual: HashMap) => HashMap
export const getHashMapDiff: GetHashMapDiff = hashMapControl => hashMapActual => Object
    .entries(hashMapActual)
    .reduce(
        (acc, [key, value]) => {
            if (hashMapControl[key] !== value) acc[key] = value;
            return acc;
        },
        {} as HashMap
    );

type IfThen = <X>(predicate: (x: X) => boolean) => <R>(onTrue: (x: X) => R) => (data: X) => R | X
export const ifThen: IfThen = predicate => onTrue => data => predicate(data) ? onTrue(data) : data

type IfElse = (predicate: (x: any) => boolean) => (handlers: [onTrue: (x: any) => any, onFalse?: (x: any) => any]) => (data: any) => any
// eslint-disable-next-line no-nested-ternary
export const ifElse: IfElse = predicate => ([onTrue, onFalse]) => data => predicate(data)
    ? onTrue(data)
    : onFalse ? onFalse(data) : data

type PathJoin2 = (path1: string) => (path2: string) => string
export const pathJoin2: PathJoin2 = path1 => path2 => path.join(path1, path2)

type IterateStages = (f: (x: any) => any) => (stages: any[]) => any;
export const iterateStages: IterateStages = (f) => (stages) => Promise.all(
    stages.map(async (stageGroup: Stage[]) => {
        for (const stage of stageGroup) await f(stage)
    })
);
