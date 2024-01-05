# Models and components

The Mix-Models are reactive and were developed for use with forms. Let's write a small example to demonstrate a solution.

Because `<input>` tag uses a string value, all user-defined fields of the model will be transformed to strings (see [serializing and deserializing](./tips-and-tricks.md#serializing-and-deserializing)):

<code-group>
<code-block title="TS">

```ts
// file: @/models/user.ts
import {
  type Base,
  BaseModel,
  type PatternAssert,
  type Validate,
  type ValidatePrivate,
  mixValidate,
  mix,
  type Options,
  type Rollback,
  type RollbackPrivate,
  mixRollback,
  type Save,
  type SavePrivate,
  mixSave
} from '@vueent/mix-models';
import { v9s, simplify } from 'v9s';
import { integer } from 'v9sx';

export interface Data {
  id: number;
  age: string;
  name: string;
}

export interface EncodedData {
  id: number;
  age: number;
  name: string;
}

export function makeInitialData(): Data {
  return {
    id: 0,
    age: '',
    name: ''
  };
}

const rollbackMask = {
  age: true,
  name: true
} as const;

const validations = {
  age: simplify(
    v9s<string>()
      .string('Invalid age format.')
      .minLength(1, 'Enter the age.')
      .use(integer, 'Age must be an integer value.', Number)
      .gte(0, 'Age cannot be a negative value.')
  ),
  name: simplify(
    v9s<string>()
      .string('The name must be a string.')
      .minLength(1, 'Enter the name.')
      .maxLength(255, 'The name length exceeds 255 characters.')
  )
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

export class DataModel extends BaseModel<Data> {}

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixSave(),
  mixValidate(validations)
) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

export function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
```

</code-block>
<code-block title="JS">

```js
// file: @/models/user.js
import { BaseModel, mixValidate, mix, mixRollback, mixSave } from '@vueent/mix-models';
import { v9s, simplify } from 'v9s';
import { integer } from 'v9sx';

/**
 * @typedef {import('@vueent/mix-models).Options} Options
 */

/**
 * @typedef Data
 * @property {number} id
 * @property {string} age
 * @property {string} name
 */

/**
 * @typedef EncodedData
 * @property {number} id
 * @property {number} age
 * @property {string} name
 */

export function makeInitialData() {
  return {
    id: 0,
    age: '',
    name: ''
  };
}

const rollbackMask = {
  age: true,
  name: true
};

const validations = {
  age: simplify(
    v9s()
      .string('Invalid age format.')
      .minLength(1, 'Enter the age.')
      .use(integer, 'Age must be an integer value.', Number)
      .gte(0, 'Age cannot be a negative value.')
  ),
  name: simplify(
    v9s()
      .string('The name must be a string.')
      .minLength(1, 'Enter the name.')
      .maxLength(255, 'The name length exceeds 255 characters.')
  )
};

export class Model extends mix(BaseModel, mixRollback(rollbackMask), mixSave(), mixValidate(validations)) {
  /**
   *
   * @param {Data=} initialData
   * @param {boolean} react
   * @param  {...Options} options
   */
  constructor(initialData = undefined, react = true, ...options) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}
```

</code-block>
</code-group>

The model instances can be created by [Pinia](https://pinia.vuejs.org/), by [Vuex](https://vuex.vuejs.org/), by [VueEnt Service](./core.md), and, of course, by [VueEnt Store](./store.md) or directly by a component.

<code-group>
<code-block title="TS">

```vue
<template>
  <form @submit.prevent="save">
    <div>
      <input placeholder="Enter the age" v-model="model.data.age" @change="model.v.c.age.touch()" />
    </div>
    <div v-if="model.v.c.age.dirtyMessage" class="error-message">
      {{ model.v.c.age.dirtyMessage }}
    </div>
    <div v-else class="error-message">&nbsp;</div>

    <div>
      <input placeholder="Enter the name" v-model="model.data.name" @change="model.v.c.name.touch()" />
    </div>

    <div v-if="model.v.c.name.dirtyMessage" class="error-message">
      {{ model.v.c.name.dirtyMessage }}
    </div>
    <div v-else class="error-message">&nbsp;</div>

    <div>
      <button type="submit">Save</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount } from 'vue';

import { create } from '@/models/user-model';

export default defineComponent({
  setup() {
    const model = create();

    onBeforeUnmount(() => {
      model.destroy();
    });

    const save = () => {
      model.v.touch(); // touching all fields

      if (model.v.invalid) return;

      // do something, e.g. model.save();
    };

    const reset = () => model.rollback();

    return { model, save, reset };
  }
});
</script>

<style lang="css" scoped>
.error-message {
  color: red;
}
</style>
```

</code-block>
<code-block title="JS">

```vue
<template>
  <form @submit.prevent="save">
    <div>
      <input placeholder="Enter the age" v-model="model.data.age" @change="model.v.c.age.touch()" />
    </div>
    <div v-if="model.v.c.age.dirtyMessage" class="error-message">
      {{ model.v.c.age.dirtyMessage }}
    </div>
    <div v-else class="error-message">&nbsp;</div>

    <div>
      <input placeholder="Enter the name" v-model="model.data.name" @change="model.v.c.name.touch()" />
    </div>

    <div v-if="model.v.c.name.dirtyMessage" class="error-message">
      {{ model.v.c.name.dirtyMessage }}
    </div>
    <div v-else class="error-message">&nbsp;</div>

    <div>
      <button type="submit">Save</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </form>
</template>

<script lang="js">
import { onBeforeUnmount } from "vue";

import { create } from "@/models/user-model";

export default {
  setup() {
    const model = create();

    onBeforeUnmount(() => {
      model.destroy();
    });

    const save = () => {
      model.v.touch(); // touching all fields

      if (model.v.invalid) return;

      // do something, e.g. model.save();
    };

    const reset = () => model.rollback();

    return { model, save, reset };
  },
};
</script>

<style lang="css" scoped>
.error-message {
  color: red;
}
</style>
```

</code-block>
</code-group>
