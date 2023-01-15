export abstract class AbstractCollection {}

export type AbstractCollectionConstructor<T extends AbstractCollection = AbstractCollection> = new (...args: any[]) => T;

export type AbstractCollectionType<C> = C extends new (...args: any[]) => infer T ? T : never;
