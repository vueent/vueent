import { AbstractCollection, AbstractCollectionType, AbstractCollectionConstructor } from './abstract-collection';

export type AssertCollectionType<T, V> = T extends V ? T : never;

export class Store<Collections extends AbstractCollection = AbstractCollection> {
  private _collections: Map<AbstractCollectionConstructor<Collections>, Collections>;

  constructor(collections?: Iterable<Collections>) {
    this._collections = new Map();

    if (!collections) return;

    for (const collection of collections) {
      this._collections.set(Object.getPrototypeOf(collection).constructor, collection);
    }
  }

  get<C extends AbstractCollectionConstructor<Collections>, T = AssertCollectionType<AbstractCollectionType<C>, Collections>>(
    collection: C
  ): T {
    const coll = this._collections.get(collection);

    if (!coll) throw new Error('unregistered collection');

    return coll as unknown as T;
  }
}
