import { Service } from '@vueent/core';

import { AbstractCollection, AbstractCollectionConstructor, AbstractCollectionType } from './abstract-collection';
import { Store, AssertCollectionType } from './store';

export class StoreService<Collections extends AbstractCollection = AbstractCollection> extends Service {
  private readonly _store: Store<Collections>;

  constructor(collections?: Iterable<Collections>) {
    super();

    this._store = new Store(collections);
  }

  public get<
    C extends AbstractCollectionConstructor<Collections>,
    T = AssertCollectionType<AbstractCollectionType<C>, Collections>
  >(collection: C): T {
    return this._store.get(collection);
  }
}
