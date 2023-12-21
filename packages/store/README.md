# @vueent/store

This library is a part of [_VueentT_](https://github.com/vueent/vueent) project. It provides `Collection`, `Store`, and `StoreService` classes. `Collection` incapsulates a loading, creation, updating and deletion of its models, controls a models lifecycle. `Store` class provides a central storage of collections. Collections do not support relations yet, but models data may be a structured object.

::: warning
The library is experimental, API breaking changes may be occured.
:::

## Installation

```sh
npm install --save-dev @vueent/core
```

This library has [Vue 3](https://v3.vuejs.org/guide/introduction.html) or [Vue composition API plugin for Vue 2](https://github.com/vuejs/composition-api) peer dependency, it means that your have to add this dependencies into your project (`package.json`) manually.

## Using store service

Define available collections as an argument of generic type of `StoreService` to support compile time types constrains, e.g.:

```ts
store.get(UnknownCollectionClass); // ts: Argument of type 'typeof StorableCollection' is not assignable to parameter of type...
```

```ts
// file: services/store.ts
import { StoreService } from '@vueent/store';

import { Service, registerService } from '@/vueent';
import { UsersCollection, ArticlesCollection } from '@/collections';
import { EncodedData as EncodedUserData } from '@/models/user';
import { EncodedData as EncodedArticleData } from '@/models/article';

export class ProjectStoreService extends StoreService<UsersCollection | ArticlesCollection> {
  constructor(serverStores: {
    users: {
      mapStore: Map<number, EncodedUserData>;
      getNewPk: () => number;
    };
    articles: {
      mapStore: Map<number, EncodedArticleData>;
      getNewPk: () => number;
    };
  }) {
    super([
      new UsersCollection(serverStores.users.mapStore, serverStores.users.getNewPk),
      new ArticlesCollection(serverStores.articles.mapStore, serverStores.articles.getNewPk)
    ]);
  }
}

registerService(StoreService);
```

# LICENSE

[MIT](./LICENSE)
