# Rollback mixin

The `rollback` mixin allows to reset the model state to the last saved (origin) state.

## Rollback mask

The mixin uses an object called "rollback mask" that determines fields must be rolled back, and which field don't.

::: tip
If a rollback mask is not specified the whole model data will be reset.
:::

Simple rollback mask example:

<code-group>
<code-block title="TS">

```ts
interface Data {
  id: number;
  age: number;
  name: string;
}

const rollbackMask = {
  id: false,
  age: true,
  name: true
} as const;
```

</code-block>

<code-block title="JS">

```js
/**
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {string} name
 */

const rollbackMask = {
  id: false,
  age: true,
  name: true
};
```

</code-block>
</code-group>

The rollback mask from the previous example allows the model fields `age` and `name` to be reset prevents the `id` field from being reset.

::: tip
If a field is `true` or `undefined` in a user-defined mask, the field will be ignored.
:::

Rollback masks support special keys to define arrays and items with specified array positions (indexes). To define a mask of array, use `$array: true` marker:

<code-group>
<code-block title="TS">

```ts
interface Data {
  id: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: {
    number: Array<{ tel: string }>;
    name: string;
  }[];
}

const rollbackMask = {
  id: false,
  credentials: {
    firstName: true,
    lastName: true
  },
  phones: { $array: true, number: true }
} as const;
```

</code-block>

<code-block title="JS">

```js
/**
 * @typedef Credentials
 * @property {string} firstName
 * @property {string} lastName
 *
 * @typedef Phone
 * @property {Array<{ tel: string }>} number
 * @property {string} name
 *
 * @typedef Data
 * @property {number} id
 * @property {Credentials} credentials
 * @property {Phone[]} phones
 */

const rollbackMask = {
  id: false,
  credentials: {
    firstName: true,
    lastName: true
  },
  phones: { $array: true, number: true }
};
```

</code-block>
</code-group>

The `phones` field of the mask is marked as array with `$array: true`, overwise the field will be processed like an object. The `number` field of each item of the `phones` array will be rolled back, but the `name` field won't.

If it is necessary to roll back only a few elements of an array, the `$index` keyword should be used:

<code-group>
<code-block title="TS">

```ts
const rollbackMask = {
  id: false,
  credentials: false,
  phones: {
    $array: true,
    $index: [1, 2]
    number: true,
    name: true
  }
} as const;
```

</code-block>
<code-block title="JS">

```js
const rollbackMask = {
  id: false,
  credentials: false,
  phones: {
    $array: true,
    $index: [1, 2]
    number: true,
    name: true
  }
};
```

</code-block>
</code-group>

## Model definition

The mixin provides a factory function that returns a mixin function. The following example presents a typical use of the `rollback` mixin:

<code-group>
<code-block title="TS">

```ts
import { BaseModel, mix, mixRollback } from '@vueent/mix-models';
import type { Base, Options, Rollback, RollbackPrivate } from '@vueent/mix-models';

/**
 * Internal data representation.
 */
interface Data {
  id: number;
  age: number;
  name: string;
}

/**
 * A mask that marks the fields that will be rolled back.
 *
 * This object is optional and can be omitted, in which case all fields,
 * including the primary key, will be rolled back.
 */
const rollbackMask = {
  id: false,
  age: true,
  name: true
} as const;

/**
 * Returns initial data state.
 */
function makeInitialData(): Data {
  return {
    id: 0,
    age: 0,
    name: ''
  };
}

/**
 * An intermediate class that required for using TypeScript mixins,
 * because BaseModel is a generic class.
 */
class DataModel extends BaseModel<Data> {}

/**
 * The Model's private interface that cannot be inferred automatically since TypeScript limitations.
 */
interface Model extends DataModel, RollbackPrivate<Data> {}

/**
 * Model class.
 */
class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    // the first argument indicates which field is considered the primary key of the model,
    // there is no support for composite keys, empty string is a valid value
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}

/**
 * The Model's public interface.
 */
type ModelType = Base<Data> & Rollback;

function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
```

</code-block>
<code-block title="JS">

```js
import { BaseModel, mix, mixRollback } from '@vueent/mix-models';

/**
 * Internal data representation.
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {string} name
 */

/**
 * A mask that marks the fields that will be rolled back.
 *
 * This object is optional and can be omitted, in which case all fields,
 * including the primary key, will be rolled back.
 */
const rollbackMask = {
  id: false,
  age: true,
  name: true
};

/**
 * Returns initial data state.
 */
function makeInitialData() {
  return {
    id: 0,
    age: 0,
    name: ''
  };
}

/**
 * Model class.
 */
class Model extends mix(BaseModel, mixRollback(rollbackMask)) {
  constructor(initialData = undefined, react = true, ...options) {
    // the first argument indicates which field is considered the primary key of the model,
    // there is no support for composite keys, empty string is a valid value
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}
```

</code-block>
</code-group>

## Flags

The mixin does not provide any flags, but toggles the [`dirty`](./base-model#dirty-state-tracking) flag of the [`BaseModel`](./base-model) class.

## Usage

The `rollback()` method is provided by the mixin. Optionally, it accepts a runtime rollback mask which is used to roll back only specified data fields.

<code-group>
<code-block title="TS">

```ts
const instance = create({ id: 1, age: 22, name: 'John' }, true);

console.log(instance.dirty); // outputs: false

instance.data.age = 20;
instance.data.name = 'Jane';

console.log(instance.dirty); // outputs: true

instance.rollback();

console.log(instance.dirty); // outputs: false
console.log(instance.data.id, instance.data.age, instance.data.name); // outputs: 1 22 "John"

instance.data.age = 20;
instance.data.name = 'Jane';

console.log(instance.dirty); // outputs: true

instance.rollback({ age: true }); // using a custom rollback mask

console.log(instance.dirty); // outputs: false
console.log(instance.data.id, instance.data.age, instance.data.name); // outputs: 1 20 "Jane"
```

</code-block>
<code-block title="JS">

```js
const instance = new Model({ id: 1, age: 22, name: 'John' }, true);

console.log(instance.dirty); // outputs: false

instance.data.age = 20;
instance.data.name = 'Jane';

console.log(instance.dirty); // outputs: true

instance.rollback();

console.log(instance.dirty); // outputs: false
console.log(instance.data.id, instance.data.age, instance.data.name); // outputs: 1 22 "John"

instance.data.age = 20;
instance.data.name = 'Jane';

console.log(instance.dirty); // outputs: true

instance.rollback({ age: true }); // using a custom rollback mask

console.log(instance.dirty); // outputs: false
console.log(instance.data.id, instance.data.age, instance.data.name); // outputs: 1 20 "Jane"
```

</code-block>
</code-group>

## Combination with the Save mixin

The `rollback` mixin automatically updates an origin data object after the model saving, it uses [`afterCreate`](./base-model#aftercreate) anf [`afterSave`](./base-model#aftersave) hooks.

<code-group>
<code-block title="TS">

```ts
// file: person.ts
import { BaseModel, mix, mixRollback, mixSave } from '@vueent/mix-models';
import type { Base, Options, Rollback, RollbackPrivate, Save, SavePrivate } from '@vueent/mix-models';

/**
 * Internal data representation.
 */
interface Data {
  id: number;
  age: number;
  name: string;
}

/**
 * A mask that marks the fields that will be rolled back.
 *
 * This object is optional and can be omitted, in which case all fields,
 * including the primary key, will be rolled back.
 */
const rollbackMask = {
  id: false,
  age: true,
  name: true
} as const;

/**
 * Returns initial data state.
 */
function makeInitialData(): Data {
  return {
    id: 0,
    age: 0,
    name: ''
  };
}

/**
 * An intermediate class that required for using TypeScript mixins,
 * because BaseModel is a generic class.
 */
class DataModel extends BaseModel<Data> {}

/**
 * The Model's private interface that cannot be inferred automatically since TypeScript limitations.
 */
interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data> {}

/**
 * Model class.
 */
class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask), mixSave()) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    // the first argument indicates which field is considered the primary key of the model,
    // there is no support for composite keys, empty string is a valid value
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}

/**
 * The Model's public interface.
 */
type ModelType = Base<Data> & Rollback & Save;

function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}

// file: api.ts
import axios from 'axios';

export async function create(data) {
  return await axios.post('/persons/', data);
}

export async function update(id, data) {
  return await axios.put(`/persons/${id}/`, data);
}

export async function destroy(id) {
  await axios.delete(`/persons/${id}/`);
}

// file main.ts
import { create } from './person';
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
  const instance = create(undefined, { mixinType: 'save', create, update, destroy });

  // creating a new record
  console.log(instance.new); // outputs: true
  console.log(instance.dirty); // outputs: false

  instance.data.age = 22;
  instance.data.name = 'John';

  console.log(instance.data.id); // ouputs: 0
  console.log(instance.dirty); // outputs: true

  await tryToSave(instance);

  // updating the record
  console.log(instance.new); // outputs: false
  console.log(instance.dirty); // outputs: false
  console.log(instance.data.id); // outputs: 10, for example

  instance.data.age = 23;
  instance.data.name = 'James';

  console.log(instance.dirty); // outputs: true

  instance.rollback();

  console.log(instance.data.age); // outputs: 22
  console.log(instance.data.name); // outputs: "John"

  // destroying the instance
  instance.destroy();

  console.log(instance.instanceDestroyed); // outputs: true
}

main();
```

</code-block>
<code-block title="JS">

```js
// file: person.js
import { BaseModel, mix, mixRollback, mixSave } from '@vueent/mix-models';

/**
 * Internal data representation.
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {string} name
 */

/**
 * A mask that marks the fields that will be rolled back.
 *
 * This object is optional and can be omitted, in which case all fields,
 * including the primary key, will be rolled back.
 */
const rollbackMask = {
  id: false,
  age: true,
  name: true
};

/**
 * Returns initial data state.
 */
function makeInitialData() {
  return {
    id: 0,
    age: 0,
    name: ''
  };
}

/**
 * Model class.
 */
class Model extends mix(BaseModel, mixRollback(rollbackMask), mixSave()) {
  constructor(initialData?: Data, react = true, ...options) {
    // the first argument indicates which field is considered the primary key of the model,
    // there is no support for composite keys, empty string is a valid value
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}

// file: api.js
import axios from 'axios';

export async function create(data) {
  return await axios.post('/persons/', data);
}

export async function update(id, data) {
  return await axios.put(`/persons/${id}/`, data);
}

export async function destroy(id) {
  await axios.delete(`/persons/${id}/`);
}

// file main.js
import { create } from './person';
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

  instance.data.age = 22;
  instance.data.name = 'John';

  console.log(instance.data.id); // ouputs: 0
  console.log(instance.dirty); // outputs: true

  await tryToSave(instance);

  // updating the record
  console.log(instance.new); // outputs: false
  console.log(instance.dirty); // outputs: false
  console.log(instance.data.id); // outputs: 10, for example

  instance.data.age = 23;
  instance.data.name = 'James';

  console.log(instance.dirty); // outputs: true

  instance.rollback();

  console.log(instance.data.age); // outputs: 22
  console.log(instance.data.name); // outputs: "John"

  // destroying the instance
  instance.destroy();

  console.log(instance.instanceDestroyed); // outputs: true
}

main();
```

</code-block>
</code-group>
