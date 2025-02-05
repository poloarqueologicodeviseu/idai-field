import { Associative, detach, isArray, isDefined, Map, Pair } from 'tsfun';
import { Named } from './named';


/**
 * @author Daniel de Oliveira
 */

export type Lookup<T> = { [_: string]: T};


export function typeOf(v: any) { return typeof v }


export function log<T>(v: T): T {

    console.log(v);
    return v;
}


export function logWithMessage<T>(message: string) {

    return (v: T): T => {

        console.log(message, v);
        return v;
    }
}


export function toMap<T extends Named>(categories: Associative<T>) {

    return isArray(categories)
        ? Named.arrayToMap(categories as Array<T>)
        : categories as Map<T>;
}


/**
 * to be used with reduce
 */
export function withDissoc(struct: any, path: string) {

    return detach(path)(struct);
}
// return map(val(undefined))(range(size));


export function pick<T>(struct: Map<T>, targetId: string): T;
export function pick<A>(as: Array<A>, targetId: number): A;
export function pick<A>(struct: Map<A>|Array<A>, targetId: string|number): A  {

    const result = (struct as any)[targetId];
    if (!result) throw 'illegal argument in pick - given key/index does not exist on associative';
    return result as A;
}


export function toPair<T>(k1: string, k2: string) {

    return (o: Map<T>): Pair<T, T> => [o[k1], o[k2]];
}


export const intoObj = <T>(keyName: string, valName: string) =>
    (object: Map<T>, item: Map<T>) =>
        isDefined(item[keyName])
            ? (object[((item[keyName]) as any).toString()] = item[valName], object)
            : object;


export const concatIf = (f: (_: string) => boolean) => (acc: string[], val: string) =>
    f(val) ? acc.concat([val as string]) : acc;
