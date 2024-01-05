# Mixins development

Each user of the library can write their own mixins. The mixin should provide a mixin function, private and public interfaces. The mixin function is a function that accepts a parent class and returns a mixed class:

```ts
import { type Constructor, BaseModel } from '@vueent/mix-models';

export interface Random {
  readonly rand: number;
}

export interface RandomPrivate extends Random {
  setMaxRandom(max: number): void;
}

export function randomMixin<D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) {
  return class extends parent implements RandomPrivate {
    #maxRandom = 1;

    get rand(): number {
      return Math.floor(Math.random() * this.#maxRandom);
    }

    setMaxRandom(max: number): void {
      this.#maxRandom = max;
    }

    hasMixin(mixin: Function): boolean {
      return mixin === randomMixin || super.hasMixin(mixin); // useful for dynamic type checking and JS
    }
  };
}

export function mixRandom() {
  return <D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) => randomMixin<D, C>(parent);
}
```

::: tip
Due to TypeScript limitations mixins cannot use access modifiers, but private (starting with `#`) variables can be used.
:::

So, the mixin above provides a `rand` getter and a protected `setMaxRandom` method.

## Class generating function

A class generating function is a generic function that accepts a parent constructor, the mixin parameters and returns a new mixed class.

## Factory function

A factory function should return a function like a class generating function, but with bound parameters if needed. The `mix` function uses its result (see [below](#usage)).

## Private interface

A private interface is required to add protected fields and methods to a final model class.

## Public interface

A public interface contains public fields and methods only. These fields and methods can be used by the user of the model instance.

## Constructor arguments

Of course, a mixin can override the constructor, but it must have arguments that are compatible with the `BaseModel` constructor.

## Usage

```ts
import { type Base, BaseModel, mix, Options } from '@vueent/mix-models';

import { mixRandom, type Random, type RandomPrivate } from '@/model-mixin/random';

interface Data {
  id: number;
  value: number;
}

function makeInitialData(): Data {
  return { id: 0, value: 0 };
}

class DataModel extends BaseModel<Data> {}

export interface Model extends DataModel, RandomPrivate {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRandom()) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);

    this.setMaxRandom(256); // provided by RandomPrivate interface
  }
}

export type ModelType = Base<Data> & Random;

export function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}

const instance = create();

instance.data.value = instance.rand;

console.log(instance.data.value); // outputs: <a random number between 0 and 256>
```
