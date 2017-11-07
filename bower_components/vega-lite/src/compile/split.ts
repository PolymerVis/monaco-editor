
import * as log from '../log';
import {duplicate} from '../util';

/**
 * Generic class for storing properties that are explicitly specified
 * and implicitly determined by the compiler.
 * This is important for scale/axis/legend merging as
 * we want to prioritize properties that users explicitly specified.
 */
export class Split<T extends object> {
  constructor(public readonly explicit: T = {} as T, public readonly implicit: T = {} as T) {}

  public clone() {
    return new Split(duplicate(this.explicit), duplicate(this.implicit));
  }

  public combine(): T {
    // FIXME remove "as any".
    // Add "as any" to avoid an error "Spread types may only be created from object types".
    return {
      ...this.explicit as any, // Explicit properties comes first
      ...this.implicit as any
    };
  }

  public get<K extends keyof T>(key: K): T[K] {
    // Explicit has higher precedence
    return this.explicit[key] !== undefined ? this.explicit[key] : this.implicit[key];
  }

  public getWithExplicit<K extends keyof T>(key: K): Explicit<T[K]> {
    // Explicit has higher precedence
    if (this.explicit[key] !== undefined) {
      return {explicit: true, value: this.explicit[key]};
    } else if (this.implicit[key] !== undefined) {
      return {explicit: false, value: this.implicit[key]};
    }
    return {explicit: false, value: undefined};
  }

  public setWithExplicit<K extends keyof T>(key: K, value: Explicit<T[K]>) {
    if (value.value !== undefined) {
      this.set(key, value.value, value.explicit);
    }
  }

  public set<K extends keyof T>(key: K, value: T[K], explicit: boolean) {
    delete this[explicit ? 'implicit' : 'explicit'][key];
    this[explicit ? 'explicit' : 'implicit'][key] = value;
    return this;
  }

  public copyKeyFromSplit<S extends object, K extends keyof (T|S)>(key: K, s: Split<S>) {
    // Explicit has higher precedence
    if (s.explicit[key] !== undefined) {
      this.set(key, s.explicit[key], true);
    } else if (s.implicit[key] !== undefined) {
      this.set(key, s.implicit[key], false);
    }
  }
  public copyKeyFromObject<S, K extends keyof (T|S)>(key: K, s: S) {
    // Explicit has higher precedence
    if (s[key] !== undefined) {
      this.set(key, s[key], true);
    }
  }
}

export interface Explicit<T> {
  explicit: boolean;
  value: T;
}


export function makeExplicit<T>(value: T): Explicit<T> {
  return {
    explicit: true,
    value
  };
}

export function makeImplicit<T>(value: T): Explicit<T> {
  return {
    explicit: false,
    value
  };
}

export function tieBreakByComparing<S, T>(compare: (v1: T, v2: T) => number) {
  return (v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string): Explicit<T> => {
    const diff = compare(v1.value, v2.value);
    if (diff > 0) {
      return v1;
    } else if (diff < 0) {
      return v2;
    }
    return defaultTieBreaker<S, T>(v1, v2, property, propertyOf);
  };
}

export function defaultTieBreaker<S, T>(v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string) {
  if (v1.explicit && v2.explicit) {
    log.warn(log.message.mergeConflictingProperty(property, propertyOf, v1.value, v2.value));
  }
  // If equal score, prefer v1.
  return v1;
}

export function mergeValuesWithExplicit<S, T>(
    v1: Explicit<T>, v2: Explicit<T>,
    property: keyof S,
    propertyOf: 'scale' | 'axis' | 'legend' | '',
    tieBreaker: (v1: Explicit<T>, v2: Explicit<T>, property: keyof S, propertyOf: string) => Explicit<T> = defaultTieBreaker
  ) {
  if (v1 === undefined || v1.value === undefined) {
    // For first run
    return v2;
  }

  if (v1.explicit && !v2.explicit) {
    return v1;
  } else if (v2.explicit && !v1.explicit) {
    return v2;
  } else if (v1.value === v2.value) {
    return v1;
  } else {
    return tieBreaker(v1, v2, property, propertyOf);
  }
}
