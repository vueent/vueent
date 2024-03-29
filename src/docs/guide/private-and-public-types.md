# Private and public types

Here are several types that are provided by the library. That types are required due to the limitations of TypeScript type inference. It is useful to separate private and public fields of a class because users of the model should use a public interface only, but TypeScript doesn't support mixin visibility modifiers and cannot infer the types of generic functions, therefore the only way to provide a public interface is to set it manually.

Example (without manual type definitions):

```ts
import { BaseModel } from '@vueent/mix-models';

interface Data {
  id: number;
  firstName: string;
  lastName: string;
}

class Model extends BaseModel<Data> {
  constructor(initialData?: Data) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' });
  }
}

const instance = new Model();

console.log(instance.dirty); // public field
console.log(instance._flags.dirty); // private `_flags` field is available for model users.
```

A function that returns a public interface can be used instead of the direct model constructor call:

```ts
import { BaseModel, Base } from '@vueent/mix-models';

interface Data {
  id: number;
  firstName: string;
  lastName: string;
}

class Model extends BaseModel<Data> {
  constructor(initialData?: Data) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' });
  }
}

type ModelType = Base<Data>;

function create(initialData?: Data) {
  return new Model(initialData) as ModelType;
}

const instance = create();

console.log(instance.dirty); // public field
console.log(instance._flags.dirty); // compile error: property `_flags` does not exist on type `ModelType`
```

::: tip
Use an external friend-function instantiating a model.
:::

## Using mix function

Often a model should contain several mixins such as `Save`, `Rollback`, `Validate`, etc. The `mix` function is necessary to simplify a mixins chain definition.

The following example demonstrates the use of `Rollback` and `Save` mixins together:

```ts
import type { Base, Options, Rollback, RollbackPrivate, Save, SavePrivate } from '@vueent/mix-models';
import { BaseModel, mix, mixRollback, mixSave } from '@vueent/mix-models';

interface Data {
  id: number;
  age: number;
  name: string;
}

function makeInitialData(): Data {
  return {
    id: 0,
    age: 0,
    name: ''
  };
}

const rollbackMask = {
  id: false,
  age: true,
  name: true
} as const;

class DataModel extends BaseModel<Data> {}

interface Model extends DataModel, SavePrivate<Data>, RollbackPrivate<Data> {}

class Model extends mix<Data, typeof DataModel>(DataModel, mixSave(), mixRollback(rollbackMask)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);

    if (initialData?.id && initialData.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

type ModelType = Base<Data> & Save & Rollback;
```
