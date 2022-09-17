import { AbstractCollection, AbstractCollectionType, AbstractCollectionConstructor } from './abstract-collection';

export type AssertCollectionType<T, V> = T extends V ? T : never;

export class Store<Collections extends AbstractCollection> {
  private _collections: Set<Collections>;

  constructor(collections?: Iterable<Collections>) {
    this._collections = new Set(collections);
  }

  get<C extends AbstractCollectionConstructor<Collections>, T = AssertCollectionType<AbstractCollectionType<C>, Collections>>(
    collection: C
  ): T {
    for (const coll of this._collections) {
      if (coll instanceof collection) return (coll as unknown) as T;
    }

    throw new Error('unregistered collection');
  }
}
