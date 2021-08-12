# Save mixin

The `save` mixin allows to append [`CRUD`](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality into the model.

## Model definition

The mixin provides a factory function that returns a mixin function. It is a general interface that allows to send arguments or to the factory only once.

<code-group>
<code-block title="TS">

```ts
import { BaseModel, Options, mixSave } from '@vueent/mix-models';

interface Data {
  id: number;
  firstName: string;
  lastName: string;
}

class DataModel extends BaseModel<Data> {}

const genSaveModel = mixSave();

class SaveModel extends genSaveModel(DataModel) {}

class Model<ModelOptions extends Options> extends SaveModel {
  constructor(initialData?: Data, ...options: ModelOptions[]) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);
  }
}
```
</code-block>

<code-block title="JS">

```js
import BaseModel, mixSave } from '@vueent/mix-models';

const genSaveModel = mixSave();

class SaveModel extends genSaveModel(BaseModel);

class Model extends SaveModel {
  constructor(initialData = undefined, ...options) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);
  }
}
```
</code-block>
</code-group>

Of course, it's not necessary to define intermediate classes. Let's optimize the previous example:

<code-group>
<code-block title="TS">

```ts
import { BaseModel, Options, mixSave } from '@vueent/mix-models';

interface Data {
  id: number;
  firstName: string;
  lastName: string;
}

class Model<ModelOptions extends Options> extends mixSave()(class extends BaseModel<Data> {}) {
  constructor(initialData?: Data, ...options: ModelOptions[]) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);
  }
}
```
</code-block>

<code-block title="JS">

```js
import { BaseModel, mixSave } from '@vueent/mix-models';

class Model extends mixSave()(BaseModel) {
  constructor(initialData = undefined, ...options) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);
  }
}
```
</code-block>
</code-group>

## Flags

So, currently our model has a new method `save()` and the following readonly flags.

### Creating flag

Type: `boolean`. This flag indicating that the mixin is creating a record in the storage.

### Updating flag

Type: `boolean`. This flag indicating that the mixin is updating a record in the storage.

### Destroying flag

Type: `boolean`. This flag indicating that the mixin is deleting a record from the storage.

### Saving flag

Type: `boolean`. This flag indicating that the mixin is saving a record to the storage.

### New flag

Also the `save` mixin uses a flag from the base model class. This is a `new` flag. The flag indicating that the model data was never saved in the storage.

## Options

The mixin expects an options object with the following interface:

```ts
interface SaveOptions<T extends object> extends Options {
  /**
   * Mixin name.
   */
  mixinType: 'save';

  /**
   * A function that creates a new record in the storage.
   */
  create?: CreateFunc<T>;

  /**
   * A function that saves an existing record to the storage.
   */
  update?: UpdateFunc<T>;

  /**
   * A function that deletes an exisiting record from the storage.
   */
  destroy?: DestroyFunc<T>;
}
```

Type `T` is the model data type. That object should be send to the model constructor.

## Creating

You have to define the `create` property for `SaveOptions` if you want to create new records in your storage. The property must be a function that conforms to this interface:

```ts
type CreateFunc<T> = (data: T) => Promise<T | unknown> | T | unknown;
```

Type `T` is the model data type. The `data` argument must be an object, that will be send to the storage.

::: warning
If the function returns an object, that object will replace the model `data` property. If the function throws an error that error will be thrown outside.
:::

For example we define a `create` function (we are using [`axios`](https://github.com/axios/axios)):

<code-group>
<code-block title="TS">

```ts
import axios from 'axios';

async function create(data: Data): Promise<Data> {
  return await axios.post('/accounts/', data);
}
```
</code-block>

<code-block title="JS">

```js
import axios from 'axios';

async function create(data) {
  return await axios.post('/accounts/', data);
}
```
</code-block>
</code-group>

Instancing [the model](#model-definition) and try to save the new record to the storage:

```ts
const instance = new Model(undefined, { mixinType: 'save', create });

instance.data.firstName = 'John';
instance.data.lastName = 'Doe';

console.log(instance.new); // outputs: true

async function tryToSave() {
  try {
    await instance.save();
  } catch (error) {
    console.error('Could not save an instance by the reason:', error);
    console.log(instance.new); // outputs: true

    return;
  }

  console.log('An instance has been saved successfully');
  console.log(instance.new); // outputs: false
}

tryToSave(); // call the async function
```

The `creating` flag can be used to enable a loader indicator.

## Updating

Because the mixin doesn't know conditions of the model data identifier, the developer have to reset the `new` flag of existing records manually into the model constructor.

<code-group>
<code-block title="TS">

```ts
class Model<ModelOptions extends Options> extends mixSave()(class extends BaseModel<Data> {}) {
  constructor(initialData?: Data, ...options: ModelOptions[]) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);

    if (initialData?.id && initialData?.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

const newInstance = new Model();

console.log(newInstance.new); // outputs: true

const existingInstance = new Model({ id: 10, firstName: 'John', lastName: 'Doe' });

console.log(existingInstance.new); // outputs: false
```
</code-block>

<code-block title="JS">

```js
class Model extends mixSave()(BaseModel) {
  constructor(initialData = undefined, ...options) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);

    if (initialData?.id && initialData?.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

const newInstance = new Model();

console.log(newInstance.new); // outputs: true

const existingInstance = new Model({ id: 10, firstName: 'John', lastName: 'Doe' });

console.log(existingInstance.new); // outputs: false
```
</code-block>
</code-group>

Set the `update` property for `SaveOptions` to enable the record update operation. The property must be a function that conforms to this interface:

```ts
type UpdateFunc<T> = (id: unknown, data: T) => Promise<T | unknown> | T | unknown;
```

The `id` argument is a value of a data field which is accessible by [`idKey`](/guide/base-model.html#constructor-arguments). The `data` argument must be an object, that will be send to the storage.

::: warning
If the function returns an object, that object will replace the model `data` property. If the function throws an error that error will be thrown outside.
:::

Let's define an `update` function:

<code-group>
<code-block title="TS">

```ts
import axios from 'axios';

async function update(id: number, data: Exclude<Data, 'id'>): Promise<Data> {
  return await axios.put(`/accounts/${id}/`, data);
}
```
</code-block>

<code-block title="JS">

```js
import axios from 'axios';

async function update(id, data) {
  return await axios.put(`/accounts/${id}/`, data);
}
```
</code-block>
</code-group>

and test it together with the model:

```ts
const instance = new Model({ id: 10, firstName: 'John', lastName: 'Doe' }, { mixinType: 'save', create, update });

console.log(instance.new); // outputs: false
console.log(instance.dirty); // outputs: false

instance.data.firstName = 'James';
instance.data.lastName = 'Smith';

console.log(instance.dirty); // outputs: true

async function tryToSave() {
  const isNew = instance.new;

  try {
    await instance.save();
  } catch (error) {
    const text = isNew ? 'create' : 'update';

    console.error(`Could not ${text} an instance by the reason:`, error);
    console.log(instance.dirty); // outputs: true

    return;
  }

  const text = isNew ? 'created' : 'updated';

  console.log(`An instance has been ${text} successfully`);
  console.log(instance.dirty); // outputs: false
}

tryToSave();
```

The `updating` flag can be used to enable a loader indicator.

## Destroying

Simply define and use the `destroy` property of `SaveOptions` to enable the record delete operation. The property must be a function that conforms to this interface:

```ts
type DestroyFunc<T> = (id: unknown, data: T) => Promise<void> | void;
```

The `id` argument is a value of a data field which is accessible by [`idKey`](/guide/base-model.html#constructor-arguments). The `data` argument must be an object, that may be send to the storage.

::: warning
The record delete operation sets the `destroyed` flag, but doesn't destroys the model instance.
:::

It is necessary to define a `destroy` function to complete the mixin's options list.

<code-group>
<code-block title="TS">

```ts
import axios from 'axios';

async function destroy(id: number): Promise<void> {
  await axios.delete(`/accounts/${id}/`);
}
```
</code-block>

<code-block title="JS">

```js
import axios from 'axios';

async function destroy(id) {
  await axios.delete(`/accounts/${id}/`);
}
```
</code-block>
</code-group>

A complete example:

<code-group>
<code-block title="TS">

```ts
// file: account.ts
import { BaseModel, Options, mixSave } from '@vueent/mix-models';

export interface Data {
  id: number;
  firstName: string;
  lastName: string;
}

export class Model<ModelOptions extends Options = Options> extends mixSave()(class extends BaseModel<Data> {}) {
  constructor(initialData?: Data, ...options: ModelOptions[]) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);

    if (initialData?.id && initialData?.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

// file: api.ts
import axios from 'axios';

import { Data } from './account';

export async function create(data: Data): Promise<Data> {
  return await axios.post('/accounts/', data);
}

export async function update(id: number, data: Exclude<Data, 'id'>): Promise<Data> {
  return await axios.put(`/accounts/${id}/`, data);
}

export async function destroy(id: number): Promise<void> {
  await axios.delete(`/accounts/${id}/`);
}

// file main.ts
import { Model } from './account';
import * as api from './api';

async function tryToSave(instance: Model) {
  const isNew = instance.new;
  const removal = instance.deleted;

  try {
    instance.save();
  } catch (error) {
    let text: string;

    if (removal) text = 'delete';
    else if (isNew) text = 'create';
    else text = 'update';

    console.error(`Could not ${text} an instance by the reason:`, error);

    return;
  }

  let text: string;

  if (removal) text = 'deleted';
  else if (isNew) text = 'created';
  else text = 'updated';

  console.log(`An instance has been ${text} successfully`);
}

async function main() {
  const instance = new Model(undefined, { mixinType: 'save', create, update, destroy });

  // creating a new record
  console.log(instance.new); // outputs: true
  console.log(instance.dirty); // outputs: false

  instance.data.firstName = 'John';
  instance.data.lastName = 'Doe';

  console.log(instance.data.id); // ouputs: 0
  console.log(instance.dirty); // outputs: true

  await tryToSave(instance);

  // updating the record
  console.log(instance.new); // outputs: false
  console.log(instance.dirty); // outputs: false
  console.log(instance.data.id); // outputs: 10, for example

  instance.data.firstName = 'James';
  instance.data.lastName = 'Smith';

  console.log(instance.dirty); // outputs: true
  
  await tryToSave(instance);

  // deleting the record
  console.log(instance.dirty); // outputs: false
  console.log(instance.deleted); // outputs: false
  console.log(instance.destroyed); // outputs: false

  instance.delete();

  console.log(instance.deleted); // outputs: true
  console.log(instance.destroyed); // outputs: false

  await tryToSave(instance);

  console.log(instance.deleted); // outputs: true
  console.log(instance.destroyed); // outputs: true

  // destroying the instance
  instance.destroy();
}

main();
```
</code-block>

<code-block title="JS">

```js
// file: account.js
import { BaseModel, mixSave } from '@vueent/mix-models';

export class Model extends mixSave()(BaseModel) {
  constructor(initialData = undefined, ...options) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' }, true, ...options);

    if (initialData?.id && initialData?.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

// file: api.ts
import axios from 'axios';

export async function create(data) {
  return await axios.post('/accounts/', data);
}

export async function update(id, data) {
  return await axios.put(`/accounts/${id}/`, data);
}

export async function destroy(id) {
  await axios.delete(`/accounts/${id}/`);
}

// file main.ts
import { Model } from './account';
import * as api from './api';

async function tryToSave(instance) {
  const isNew = instance.new;
  const removal = instance.deleted;

  try {
    instance.save();
  } catch (error) {
    let text;

    if (removal) text = 'delete';
    else if (isNew) text = 'create';
    else text = 'update';

    console.error(`Could not ${text} an instance by the reason:`, error);

    return;
  }

  let text;

  if (removal) text = 'deleted';
  else if (isNew) text = 'created';
  else text = 'updated';

  console.log(`An instance has been ${text} successfully`);
}

async function main() {
  const instance = new Model(undefined, { mixinType: 'save', create, update, destroy });

  // creating a new record
  console.log(instance.new); // outputs: true
  console.log(instance.dirty); // outputs: false

  instance.data.firstName = 'John';
  instance.data.lastName = 'Doe';

  console.log(instance.data.id); // ouputs: 0
  console.log(instance.dirty); // outputs: true

  await tryToSave(instance);

  // updating the record
  console.log(instance.new); // outputs: false
  console.log(instance.dirty); // outputs: false
  console.log(instance.data.id); // outputs: 10, for example

  instance.data.firstName = 'James';
  instance.data.lastName = 'Smith';

  console.log(instance.dirty); // outputs: true

  await tryToSave(instance);

  // deleting the record
  console.log(instance.dirty); // outputs: false
  console.log(instance.deleted); // outputs: false
  console.log(instance.destroyed); // outputs: false

  instance.delete();

  console.log(instance.deleted); // outputs: true
  console.log(instance.destroyed); // outputs: false

  await tryToSave(instance);

  console.log(instance.deleted); // outputs: true
  console.log(instance.destroyed); // outputs: true

  // destroying the instance
  instance.destroy();
}

main();
```
</code-block>
</code-group>
