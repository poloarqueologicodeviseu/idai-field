import {copy, Pair, Map, to, identity, isDefined, isString, reduce, Associative, isArray} from 'tsfun';
import {dissoc} from 'tsfun/associative';
import {path, get} from 'tsfun/struct';
import {Named, namedArrayToNamedMap} from './named';


/**
 * @author Daniel de Oliveira
 */

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
        ? namedArrayToNamedMap(categories as Array<T>)
        : categories as Map<T>;
}


export function toArray(token: any) {

    return Array.from(token);
}


/**
 * to be used with reduce
 */
export function withDissoc(struct: any, path: string) {

    return dissoc(path)(struct);
}
// return map(val(undefined))(range(size));


/**
 * target: { a: 2, b: 3 }
 * source: [['a', 17]]
 * ->
 * { a: 17, b: 3 }
 */
export function replaceIn<T>(target: Map<T>): (source: Array<Pair<string, T>>) => Map<T>;
export function replaceIn<T>(target: Array<T>): (source: Array<Pair<number, T>>) => Array<T>;
export function replaceIn<T>(target: Map<T>|Array<T>) {

    return assocReduce(identity as any, target as Map<T>) as any;
}


/**
 * source: ['c','d']
 * target: {}
 * f: a => [a, a + a]
 * ->
 * { c: 'cc', d: 'dd'}
 */
export function assocReduce<T,A>(f: (a: A, i?: number|string) => [number, T], target: Array<T>)
    : (source: Array<A>|Map<A>) => Array<T>;
export function assocReduce<T,A>(f: (a: A, i?: number|string) => [string, T], target: Map<T>)
    : (source: Array<A>|Map<A>) => Map<T>;
export function assocReduce<T,A>(f: (a: A, i?: number|string) => [string|number, T], target: Map<T>|Array<T>) {

    return reduce((copied: Map<T>, a: A, i: number|string) => {
            const [k1, v1] = f(a, i);
            copied[k1] = v1;
            return copied;
        },
        /* we do not modify target in place */
        copy(target as any) as any) as (source: Array<A>|Map<A>) => Map<T>;
}


export function pick<T>(struct: Map<T>, targetId: string): T;
export function pick<A>(as: Array<A>, targetId: number): A;
export function pick<A>(struct: Map<A>|Array<A>, targetId: string|number): A  {

    const result = (struct as any)[targetId];
    if (!result) throw 'assertion violation - given key/index does not exist on associative';
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


export function setOn(object: any, path_: string) {

    return (val: any): void => _setOn(object, path(path_), val);
}


/**
 * if o has not already a value at path, it sets it to alternative
 */
export function takeOrMake<T>(o: T, path: string, alternative: any) {

    return setOn(o, path)(get(path , alternative)(o));
}


function _setOn(object: any, path: Array<string|number>, val: any) {

    const key = path[0];

    if (path.length === 1) {
        object[key] = val;
    } else {
        path.shift();
        if (!object[key]) {
            object[key] = isString(key)
                ? {}
                : [];
        }
        _setOn(object[key], path, val);
    }
}


// --- please do not remove, even if not used currently ---

/**
 * keys = ['a', 'b']
 * o = { a: 1, b: 2, c: 3 }
 * ->
 * [1, 2]
 */
export function toTuple(...keys: string[]) {

    return <T>(o: Map<T>) => keys.map(k => to(k)(o));
}
