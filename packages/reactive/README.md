# @vueent/reactive

VueenT's reactive library is aset of decorators which allows to use `ref` and `computed` as class properties and forget about checks like `const value = isRef(this.field) ? this.field.value : this.field)`.

[![Coverage Status](https://coveralls.io/repos/github/vueent/reactive/badge.svg?branch=main)](https://coveralls.io/github/vueent/reactive?branch=main) [![Build Status](https://travis-ci.org/vueent/reactive.svg?branch=main)](https://travis-ci.org/vueent/reactive) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fvueent%2Freactive.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fvueent%2Freactive?ref=badge_shield)

## Example

```ts
import { tracked, calculated } from '@vueent/reactive';

class MyClass {
  @tracked num = 2;
  @tracked factor = 3;

  @calculated get mul() {
    return this.num * this.factor;
  }
}

const my = new MyClass();

const myObj = reactive({
  my
});

myObj.my.factor = 4;

console.log(myObj.my.mul); // 8 - everything works fine

class InvalidClass {
  num = ref(2);
  factor = ref(3);
  readonly mul = computed(() => this.num.value * this.factor.value);
}

const invalid = new InvalidClass();

const invalidObj = reactive({
  invalid
});

invalidObj.invalid.factor = 4;
console.log(invalidObj.invalid.mul); // Uuups! throws an error, because this.num is a `number`, not `{ value: number }`

// brutal solution
class YourClass {
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
```
