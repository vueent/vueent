# Store

This library provides `Collection`, `Store`, and `StoreService` classes. `Collection` incapsulates a loading, creation, updating and deletion of its models, controls a models lifecycle. `Store` class provides a central storage of collections. Collections do not support relations yet, but models data may be a structured object.

::: danger
The library is experimental, API breaking changes may be occured.
:::

## Installation

<code-group>
<code-block title="NPM" active>

```bash
npm install --save-dev @vuent/core # optional, install if you want to use Store as service
npm install --save-dev @vueent/mix-models @vueent/store
```
</code-block>

<code-block title="YARN">

```bash
yarn add --dev @vueent/core # optional, install if you want to use Store as service
yarn add --dev @vueent/mix-models @vueent/store
```
</code-block>
</code-group>


## Usage

You may use the library via `StoreService` as a part of your `VueenT`-based application, via `Store` class without `VueenT`'s services and controllers, as independent collections directly. You're free to choose your own way.

### Collections

At first, we should start from the collection level. `Collection` is a base class which should be inherited by collections of your project. Any collection stores a set of cached items.

#### constructor

Constructor receives an object with the model constructor and functions which provides CRUD operations.

#### destroy

The `destroy` method destroys a collection instance and all its local records.

#### setStore

The `setStore` method binds a store instance.

::: warning
The method should not be used directly, it is used by the `Store`'s constructor.
:::

#### create

The `create` method creates a local model instance. It receives an initial model data and an options list.

#### find

The `find` method searches for a multiple records and receives search parameters defined by server API. It scans a local cache if `reload` option is set to `false`. A local filter function may be applied.

#### findOne

The `findOne` method searches for a single record and receives record's primary key and search parameters defined by server API. It scans a local cache if `reload` options is set to `false`. A local filter function may be applied.

#### peek

The `peek` method searches for some records in a local cache. A filter function may be applied.

#### peekOne

The `peekOne` method searches for a single record in a local cache by the primary key. A filter function may be applied.

#### normalize

The `normalize` method converts an encoded data to internal.

### denormalize

The `denormalize` method converts an internal representation to the encoded.

#### unload

The `unload` method unloads a model instance (removes a model instance from the collection).

::: warning
This method does not removes a record from the server store.
:::

#### unloadAll

The `unloadAll` method unloads all models (clears the collection cache).

::: warning
This method does not removes records from the server store.
:::

### Store class

### Store service

## Using store service

Define available collections as an argument of generic type of `StoreService` to support compile time types constrains, e.g.:

```ts
store.get(UnknownCollectionClass); // compile error: Argument of type 'typeof StorableCollection' is not assignable to parameter of type...
```

<code-group>
<code-block title="TS">

```ts
// file: services/store.ts
import { StoreService } from '@vueent/store';

import { Service, registerService } from '@/vueent';
import { UsersCollection, ArticlesCollection } from '@/collections';
import { EncodedData as EncodedUserData } from '@/models/user';
import { EncodedData as EncodedArticleData } from '@/models/article'; 

import { StoreService } from '@vueent/store';

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
</code-block>

<code-block title="JS">

```js
// file: services/store.js
import { StoreService } from '@vueent/store';

import { Service, registerService } from '@/vueent';
import { UsersCollection, ArticlesCollection } from '@/collections'; 

import { StoreService } from '@vueent/store';

export class ProjectStoreService extends StoreService {
  constructor(serverStores) {
    super([
      new UsersCollection(serverStores.users.mapStore, serverStores.users.getNewPk),
      new ArticlesCollection(serverStores.articles.mapStore, serverStores.articles.getNewPk)
    ]);
  }
}

registerService(StoreService);
```
</code-block>
</code-group>
