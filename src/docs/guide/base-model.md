# Base model

## Simple model

A simple model without any mixins already has useful features. It has a reactive data, with the `dirty` flag that is changed automatically when the one of fields is changed. In order to define a simple model, it is necessary to describe the data type and inherit the base class of the model.

::: warning
The data must be an object not an array or `null`.
:::

<code-group>
<code-block title="TS">

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
```
</code-block>

<code-block title="JS">

```js
import { BaseModel } from '@vueent/mix-models';

class Model extends BaseModel {
  constructor(initialData?: Data) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' });
  }
}
```
</code-block>
</code-group>

### Constructor arguments

As you can see, the `BaseModel` constructor expects several parameters:

* `idKey`, type: `string` - name of the primary data key, may be an empty string
* `data`, type: `T | Ref<T>` - initial data value, raw or reactive, see [`@vue/composition-api`](https://github.com/vuejs/composition-api)
* `react`, type: `boolean`, default: `true` - make data reactive
* `...options`, type: `any[]` - [general varargs](#options) which are used by mixins

## Dirty state tracking

The dirty state tracking:

```ts
const m = new Model();

console.log(m.dirty); // outputs: false
m.data.firstName = 'John';
m.data.lastName = 'Doe';
console.log(m.dirty); // outputs: true
```

## Destroying an instance

Call the `destroy()` method to destroy the instance. After that the dirty state tracker stops.

```ts
const m = new Model();

console.log(m.dirty); // outputs: false
m.destroy();
m.data.firstName = 'John';
console.log(m.dirty); // outputs: false
```

::: tip
The `destroyed` flag indicating the data state in a storage, it will not be turned on after destroying the instance.
Check `instanceDestroyed` flag instead.
:::

## Unique instance identifier

Each model has a globally numeric unique identifier in the current application instance, For example, it can be used as a unique key in templates.

```ts
const m = new Model();
const m2 = new OtherModel();
const m3 = new Model();

console.log(m.uid); // 1
console.log(m2.uid); // 2
console.log(m3.uid); // 3
```

## Checking of the mixin existence

Call the `hasMixin()` method to check an existence of a mixin in the model. It can be useful if you have to write mixins which depends on other mixins.

<code-group>
<code-block title="TS">

```ts
import { BaseModel, mixSave, saveMixin } from '@vueent/mix-models';

interface Data {
  id: number;
  name: string;
}

class Model extends mixSave()(class extends BaseModel<Data> {}) {
  constructor(initialData?: Data) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' });
  }
}

const m = new Model();

console.log(m.hasMixin(saveMixin)); // outputs: true
```
</code-block>

<code-block title="JS">

```js
import { BaseModel, mixSave, saveMixin } from '@vueent/mix-models';

class Model extends mixSave()(class extends BaseModel {}) {
  constructor(initialData = undefined) {
    super('id', initialData ?? { id: 0, firstName: '', lastName: '' });
  }
}

const m = new Model();

console.log(m.hasMixin(saveMixin)); // outputs: true
```
</code-block>
</code-group>

## Removal

The `delete()` method marks an instance as `deleted` and turns on the flag. It is more useful together with the [`save`](/guide/save-mixin) mixin.

```ts
const m = new Model();

console.log(m.deleted); // outputs: false
m.delete();
console.log(m.deleted); // outputs: true
```

## Hooks

The base model class have several lifecycle hooks, which are used by mixins too.

### beforeCreate

This hook is called before creating an instance in storage.

### afterCreate

This hook is called after creating an instance in storage.

### beforeSave

This hook is called before saving an existing instance to storage.

### afterSave

This hook is called after saving an existing instance to storage.

### beforeDestroy

This hook is called before deleting an existing instance from storage.

### afterDestroy

This hook is called after deleting an existing instance from storage.

### beforeRollback

This hook is called before rollback the model data.

### afterRollback

This hook is called after rollback the model data.

### delete

This hook marks a model as deleted.

### destroy

This hook destroys the model data.

## Options

Some mixins receive initialization parameters through the constructor via varargs. `Options` must be an object with a mixin name.

```ts
interface Options {
  mixinName: string;
}
```

For example, the `save` mixin options interface:

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
