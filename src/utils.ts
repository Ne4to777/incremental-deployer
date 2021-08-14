import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type HashMap = Record<string, string>

export type AnyToAnyT = (...xs: any) => any;

type IType = <T>(x: T) => T
export const I: IType = x => x;

type TType = <T, K>(x?: T) => (f: (_x?: T) => K) => K
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
export const getProp: GetProp = (key, def) => o => o[key] || def;

type ExistsSync = (filepath: string) => boolean
export const existsSync: ExistsSync = filepath => fs.existsSync(filepath);

type ReadJSONSync = (filepath: string) => Record<string, string>
export const readJSONSync: ReadJSONSync = filepath => JSON.parse(fs.readFileSync(filepath, 'utf-8'));

type WriteJSONSync = (filename: any) => (data: any) => void
export const writeJSONSync: WriteJSONSync = filename => data => fs
    .writeFileSync(filename, JSON.stringify(data, null, '\t'), 'utf-8');

type DeleteJSONSync = (filename: any) => void
export const deleteJSONSync: DeleteJSONSync = filename => fs
    .unlinkSync(filename);

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
