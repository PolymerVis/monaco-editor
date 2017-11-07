/**
 * Generic class for storing properties that are explicitly specified
 * and implicitly determined by the compiler.
 * This is important for scale/axis/legend merging as
 * we want to prioritize properties that users explicitly specified.
 */
export declare class Split<T extends object> {
    readonly explicit: T;
    readonly implicit: T;
    constructor(explicit?: T, implicit?: T);
    clone(): Split<T>;
    combine(): T;
    get<K extends keyof T>(key: K): T[K];
    getWithExplicit<K extends keyof T>(key: K): Explicit<T[K]>;
    setWithExplicit<K extends keyof T>(key: K, value: Explicit<T[K]>): void;
    set<K extends keyof T>(key: K, value: T[K], explicit: boolean): this;
    copyKeyFromSplit<S extends object, K extends keyof (T | S)>(key: K, s: Split<S>): void;
    copyKeyFromObject<S, K extends keyof (T | S)>(key: K, s: S): void;
}
export interface Explicit<T> {
    explicit: boolean;
    value: T;
}
export declare function makeExplicit<T>(value: T): Explicit<T>;
export declare function makeImplicit<T>(value: T): Explicit<T>;
export declare function tieBreakByComparing<S, T>(compare: (v1: T, v2: T) => number): (v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string) => Explicit<T>;
export declare function defaultTieBreaker<S, T>(v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string): Explicit<T>;
export declare function mergeValuesWithExplicit<S, T>(v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: 'scale' | 'axis' | 'legend' | '', tieBreaker?: (v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string) => Explicit<T>): Explicit<T>;
