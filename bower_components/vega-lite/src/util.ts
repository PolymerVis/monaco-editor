import * as stringify from 'json-stable-stringify';
import {isArray, isNumber, isString, splitAccessPath, stringValue} from 'vega-util';
import {isLogicalAnd, isLogicalNot, isLogicalOr, LogicalOperand} from './logical';


export {isArray, isObject, isNumber, isString, truncate, toSet, stringValue, splitAccessPath} from 'vega-util';

/**
 * Creates an object composed of the picked object properties.
 *
 * Example:  (from lodash)
 *
 * var object = {'a': 1, 'b': '2', 'c': 3};
 * pick(object, ['a', 'c']);
 * // → {'a': 1, 'c': 3}
 *
 */
export function pick(obj: object, props: string[]) {
  const copy = {};
  props.forEach((prop) => {
    if (obj.hasOwnProperty(prop)) {
      copy[prop] = obj[prop];
    }
  });
  return copy;
}

/**
 * The opposite of _.pick; this method creates an object composed of the own
 * and inherited enumerable string keyed properties of object that are not omitted.
 */
export function omit(obj: object, props: string[]) {
  const copy = duplicate(obj);
  props.forEach((prop) => {
    delete copy[prop];
  });
  return copy;
}

export function hash(a: any) {
  if (isString(a) || isNumber(a) || isBoolean(a)) {
    return String(a);
  }

  const str = stringify(a);

  // short strings can be used as hash directly, longer strings are hashed to reduce memory usage
  if (str.length < 100) {
    return str;
  }

  // from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = ((h<<5)-h)+char;
    h = h & h; // Convert to 32bit integer
  }
  return h;
}

export function contains<T>(array: T[], item: T) {
  return array.indexOf(item) > -1;
}

/** Returns the array without the elements in item */
export function without<T>(array: T[], excludedItems: T[]) {
  return array.filter(item => !contains(excludedItems, item));
}

export function union<T>(array: T[], other: T[]) {
  return array.concat(without(other, array));
}

/**
 * Returns true if any item returns true.
 */
export function some<T>(arr: T[], f: (d: T, k?: any, i?: any) => boolean) {
  let i = 0;
  for (let k = 0; k<arr.length; k++) {
    if (f(arr[k], k, i++)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if all items return true.
 */
 export function every<T>(arr: T[], f: (d: T, k?: any, i?: any) => boolean) {
  let i = 0;
  for (let k = 0; k<arr.length; k++) {
    if (!f(arr[k], k, i++)) {
      return false;
    }
  }
  return true;
}

export function flatten(arrays: any[]) {
  return [].concat.apply([], arrays);
}

/**
 * recursively merges src into dest
 */
export function mergeDeep<T>(dest: T, ...src: Partial<T>[]): T {
  for (const s of src) {
    dest = deepMerge_(dest, s);
  }
  return dest;
}

// recursively merges src into dest
function deepMerge_(dest: any, src: any) {
  if (typeof src !== 'object' || src === null) {
    return dest;
  }

  for (const p in src) {
    if (!src.hasOwnProperty(p)) {
      continue;
    }
    if (src[p] === undefined) {
      continue;
    }
    if (typeof src[p] !== 'object' || isArray(src[p]) || src[p] === null) {
      dest[p] = src[p];
    } else if (typeof dest[p] !== 'object' || dest[p] === null) {
      dest[p] = mergeDeep(isArray(src[p].constructor) ? [] : {}, src[p]);
    } else {
      mergeDeep(dest[p], src[p]);
    }
  }
  return dest;
}

export function unique<T>(values: T[], f: (item: T) => string | number): T[] {
  const results: any[] = [];
  const u = {};
  let v: string | number;
  for (const val of values) {
    v = f(val);
    if (v in u) {
      continue;
    }
    u[v] = 1;
    results.push(val);
  }
  return results;
}

export interface Dict<T> {
  [key: string]: T;
}

export type StringSet = Dict<boolean>;

/**
 * Returns true if the two dictionaries disagree. Applies only to defined values.
 */
export function differ<T>(dict: Dict<T>, other: Dict<T>) {
  for (const key in dict) {
    if (dict.hasOwnProperty(key)) {
      if (other[key] && dict[key] && other[key] !== dict[key]) {
        return true;
      }
    }
  }
  return false;
}

export function hasIntersection(a: StringSet, b: StringSet) {
  for (const key in a) {
    if (key in b) {
      return true;
    }
  }
  return false;
}

export function isNumeric(num: string | number) {
  return !isNaN(num as any);
}

export function differArray<T>(array: T[], other: T[]) {
  if (array.length !== other.length) {
    return true;
  }

  array.sort();
  other.sort();

  for (let i = 0; i < array.length; i++) {
    if (other[i] !== array[i]) {
      return true;
    }
  }

  return false;
}

export const keys = Object.keys;

export function vals<T>(x: {[key: string]: T}): T[] {
  const _vals: T[] = [];
  for (const k in x) {
    if (x.hasOwnProperty(k)) {
      _vals.push(x[k]);
    }
  }
  return _vals;
}

// Using mapped type to declare a collect of flags for a string literal type S
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
export type Flag<S extends string> = {
  [K in S]: 1
};

export function flagKeys<S extends string>(f: Flag<S>): S[] {
  return keys(f) as S[];
}

export function duplicate<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isBoolean(b: any): b is boolean {
  return b === true || b === false;
}

/**
 * Convert a string into a valid variable name
 */
export function varName(s: string): string {
  // Replace non-alphanumeric characters (anything besides a-zA-Z0-9_) with _
  const alphanumericS = s.replace(/\W/g, '_');

  // Add _ if the string has leading numbers.
  return (s.match(/^\d+/) ? '_' : '') + alphanumericS;
}

export function logicalExpr<T>(op: LogicalOperand<T>, cb: Function): string {
  if (isLogicalNot(op)) {
    return '!(' + logicalExpr(op.not, cb) + ')';
  } else if (isLogicalAnd(op)) {
    return '(' + op.and.map((and: LogicalOperand<T>) => logicalExpr(and, cb)).join(') && (') + ')';
  } else if (isLogicalOr(op)) {
    return '(' + op.or.map((or: LogicalOperand<T>) => logicalExpr(or, cb)).join(') || (') + ')';
  } else {
    return cb(op);
  }
}

// Omit from http://ideasintosoftware.com/typescript-advanced-tricks/
export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = {[P in Diff<keyof T, K>]: T[P]};

/**
 * Delete nested property of an object, and delete the ancestors of the property if they become empty.
 */
export function deleteNestedProperty(obj: any, orderedProps: string[]) {
  let isEmpty = true;
  while (orderedProps.length > 0 && isEmpty) {
    let o = obj;
    for (let i=0; i < orderedProps.length-1; i++) {
      o = o[orderedProps[i]];
    }
    delete o[orderedProps.pop()];
    if (keys(o).length !== 0) {
      isEmpty = false;
    }
  }
}

export function titlecase(s: string) {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

/**
 * Converts a path to an access path.
 */
export function accessPath(path: string) {
  return `[${splitAccessPath(path).map(stringValue).join('][')}]`;
}
