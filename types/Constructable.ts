/**
 * Represents any type possessing a constructor
 */
export type Constructable<T = {}> = new (...args: any[]) => T;
