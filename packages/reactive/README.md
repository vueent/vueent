# @vueent/reactive

This library is a part of [_VueentT_](https://github.com/vueent/vueent) project, but it can be used independently. It is a set of decorators which allows to use `ref` and `computed` as class properties and forget about checks like this:

```ts
const value = isRef(this.field) ? this.field.value : this.field);
```

## Installation

```sh
npm install -D @vueent/reactive
```

> [!IMPORTANT]
>
> This library has [Vue 3](https://v3.vuejs.org/guide/introduction.html), Vue 2.7 or [Vue composition API plugin for Vue 2](https://github.com/vuejs/composition-api) peer dependency, it means that your have to add this dependencies into your project (`package.json`) manually.

## Usage

> [!IMPORTANT]
>
> As of TypeScript 4.3, support of experimental decorators must be allowed by the following `tsconfig.json` options:
>
> ```json
> {
>   "compilerOptions": {
>     // ...
>     "moduleResolution": "node",
>     "useDefineForClassFields": false,
>     "experimentalDecorators": true
>   }
> }
> ```
>
> Experimantal decorators are still available as `legacyTracked` and `legacyCalculated`.

The package provides two decorators. `tracked` makes a `ref` from the class `field`. `calculated` wrapps a getter/setter pair and makes a `computed` property.

> [!WARNING]
>
> `isRef` and `toRef` functions don't work with decorated fields, but decorated fields are not mutated within `reactive` objects as a benefit.

Let's look at the trivial example:

```ts
import { tracked, calculated } from '@vueent/reactive';

class MyClass {
  @tracked public accessor num = 2;
  @tracked public accessor factor = 3;

  @calculated public get mul() {
    return this.num * this.factor;
  }
}

const my = new MyClass();

const myObj = reactive({ my });

myObj.my.factor = 4;

console.log(myObj.my.mul); // 8 - everything works fine
```

You may try to write the following code, but it won't work:

```ts
class InvalidClass {
  public num = ref(2);
  public factor = ref(3);
  readonly mul = computed(() => this.num.value * this.factor.value);
}

const invalid = new InvalidClass();

const invalidObj = reactive({ invalid });

invalidObj.invalid.factor = 4;
console.log(invalidObj.invalid.mul);
// Ooops! throws an error, because this.num is a `number`, not `{ value: number }`
```

The brutal solution:

```ts
class MyClass {
  private _num: Ref<number> | number = ref(2);
  private _factor: Ref<number> | number = ref(3);
  private readonly _mul: ComputedRef<number> | number> = computed(() => this.num * this.factor);

  public get num() {
    return isRef(this._num) ? this._num.value : this._num;
  }

  public set num(value: number) {
    isRef(this._num) ? (this._num.value = value) : (this._num = value);
  }

  public get factor() {
    return isRef(this._factor) ? this._factor.value : this._factor;
  }

  public set factor(value: number) {
    return isRef(this._factor) ? (this._factor.value = value) : (this._factor = value);
  }

  public get mul() {
    return isRef(this._mul) ? this._mul.value : this._mul;
  }
}

const my = new MyClass();

const myObj = reactive({ my });

myObj.my.factor = 4;

console.log(myObj.my.mul); // 8 - everything works fine
```

# LICENSE

[MIT](./LICENSE)
