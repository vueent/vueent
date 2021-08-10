# Mix Models

This library provides reactive models classes for _nosql_ models with optionally saving, rollback and live validations.

## Installation

<code-group>
<code-block title="NPM" active>

```bash
npm install --save-dev @vueent/mix-models
```
</code-block>

<code-block title="YARN">

```bash
yarn add --dev @vueent/mix-models
```
</code-block>
</code-group>

## Why mixins?

The library provides tools to construct model classes by composing of a base model class and built-in or external custom mixins. A few worlds should be said about this strange solution.

Classic class-based inheritance has a strict inheritance tree, which does not allow to append an optional independent functionality.

For example:

<code-group>
<code-block title="TS">

```ts
// library

class A {
  public n = 0;
}

class B extends A {
  public digits = 2;

  public print() {
    console.log(this.n.toFixed(this.digits));
  }
}

class C extends B {
  public add(op: number) {
    this.n += op;
  }
}

// project

class MyClass extends C {}
```
</code-block>

<code-block title="JS">

```js
// library

class A {
  n = 0;
}

class B extends A {
  digits = 2;

  print() {
    console.log(this.n.toFixed(this.digits));
  }
}

class C extends B {
  add(op: number) {
    this.n += op;
  }
}

// project

class MyClass extends C {}
```
</code-block>
</code-group>

If we want to use both the `print()` and `add()` methods, everything is fine, but if we need only `add()` method, our class will still contain the useless `digits` field and the `print()` method. If we inherit class `C` directly from class `A`, we cannot inherit `MyClass` from both classes `B` and `C` to take full advantage of their features.

<code-group>
<code-block title="TS">

```ts
// library

class A {
  public n = 0;
}

class B extends A {
  public digits = 2;

  public print() {
    console.log(this.n.toFixed(this.digits));
  }
}

class C extends A {
  public add(op: number) {
    this.n += op;
  }
}

// project

class ExtB extends B {}

const extB = new ExtB();

extB.print(); // prints 0.00

class ExtC extends C {}

const extC = new ExtC();

extC.add(2); // n += 2 == 2

class MyClass extends B, extends C {} // Ooops, doesn't allowed!
```
</code-block>

<code-block title="JS">

```js
// library

class A {
  n = 0;
}

class B extends A {
  digits = 2;

  print() {
    console.log(this.n.toFixed(this.digits));
  }
}

class C extends A {
  add(op: number) {
    this.n += op;
  }
}

// project

class ExtB extends B {}

const extB = new ExtB();

extB.print(); // prints 0.00

class ExtC extends C {}

const extC = new ExtC();

extC.add(2); // n += 2 == 2

class MyClass extends B, extends C {} // Ooops, doesn't allowed!
```
</code-block>
</code-group>

Yet another method is composing a final object by functions.

Example:

<code-group>
<code-block title="TS">

```ts
// library

interface A {
  n: number;
}

// basic object
function a(): A {
  return { n: 0 };
}

function b() {
  return {
    digits: 2,
    print() {
      console.log(((this as unknown) as A).n.toFixed(this.digits));
    }
  };
}

function c() {
  return {
    add(op: number): void {
      ((this as unknown) as A).n += op;
    }
  };
}

// project
const my = { ...a(), ...b(), ...c() };

my.add(2.2222);
my.print(); // outputs: 2.22
```
</code-block>

<code-block title="JS">

```js
// library

// basic object
function a() {
  return { n: 0 };
}

function b() {
  return {
    digits: 2,
    print() {
      console.log(this.n.toFixed(this.digits));
    }
  };
}

function c() {
  return {
    add(op: number): void {
      this.n += op;
    }
  };
}

// project
const my = { ...a(), ...b(), ...c() };

my.add(2.2222);
my.print(); // outputs: 2.22
```
</code-block>
</code-group>

Everything works as expected, but each object such `my` contains its own copies of methods. This problem can be worked around using `prototype`.

<code-group>
<code-block title="TS">

```ts
// library
interface Creator<T extends A> {
  new (...args: any[]): T;
  (...args: any[]): T;
}

interface A {
  n: number;
}

// basic object
function a() {
  const proto = {};

  return {
    setup: function(this: A) {
      Object.setPrototypeOf(this, proto);
      this.n = 0;

      return this;
    } as Creator<A>,
    proto
  };
}

interface B {
  digits: number;
  print(): void;
}

function b<T extends A>({ proto, setup }: { proto: any; setup: Creator<T> }) {
  proto.print = function(this: T & B) {
    console.log(this.n.toFixed(this.digits));
  };

  return {
    setup: function(this: T & B, ...args: any[]) {
      setup.call(this, ...args);

      this.digits = 2;

      return this;
    } as Creator<T & B>,
    proto
  };
}

interface C {
  add(op: number): void;
}

function c<T extends A>({ proto, setup }: { proto: any; setup: Creator<T> }) {
  proto.add = function(this: T & C, op: number) {
    this.n += op;
  };

  return { proto, setup: setup as Creator<T & C> };
}

// project
const ABC = c(b(a())).setup;
const abc = new ABC();

abc.add(2.2222);
abc.print(); // outputs: 2.22

const AB = b(a()).setup;
const ab = new AB();

ab.n = 2;
ab.print(); // outputs: 2.00

const AC = c(a()).setup;
const ac = new AC();

ac.add(2.2222);
console.log(ac.n); // outputs: 2.2222
```
</code-block>

<code-block title="JS">

```js
// library

// basic object
function a() {
  const proto = {};

  return {
    setup: function() {
      Object.setPrototypeOf(this, proto);
      this.n = 0;

      return this;
    },
    proto
  };
}

function b({ proto, setup }) {
  proto.print = function() {
    console.log(this.n.toFixed(this.digits));
  };

  return {
    setup: function() {
      setup.call(this, ...arguments);

      this.digits = 2;

      return this;
    },
    proto
  };
}

function c({ proto, setup }) {
  proto.add = function(op) {
    this.n += op;
  };

  return { proto, setup };
}

// project
const ABC = c(b(a())).setup;
const abc = new ABC();

abc.add(2.2222);
abc.print(); // outputs: 2.22

const AB = b(a()).setup;
const ab = new AB();

ab.n = 2;
ab.print(); // outputs: 2.00

const AC = c(a()).setup;
const ac = new AC();

ac.add(2.2222);
console.log(ac.n); // outputs: 2.2222
```
</code-block>
</code-group>

Doesn't look clear, right? A few years ago, this was the only way to imitate classes in JavaScript. But for now we have native classes and mixins.

Modern solution:

<code-group>
<code-block title="TS">

```ts
// library
type Constructor<T extends A> = new (...args: any[]) => T;

class A {
  n = 0;
}

function b<T extends Constructor<A>>(parent: T) {
  return class extends parent {
    digits = 2;

    print() {
      console.log(this.n.toFixed(this.digits));
    }
  };
}

function c<T extends Constructor<A>>(parent: T) {
  return class extends parent {
    add(op: number) {
      this.n += op;
    }
  };
}

// project
class ABC extends c(b(A)) {}

const abc = new ABC();

abc.add(2.2222);
abc.print(); // outputs: 2.22

class AB extends b(A) {}
const ab = new AB();

ab.n = 2;
ab.print(); // outputs: 2.00

class AC extends c(A) {}
const ac = new AC();

ac.add(2.2222);
console.log(ac.n); // outputs: 2.2222
```
</code-block>

<code-block title="JS">

```js
// library
class A {
  n = 0;
}

function b(parent) {
  return class extends parent {
    digits = 2;

    print() {
      console.log(this.n.toFixed(this.digits));
    }
  };
}

function c(parent) {
  return class extends parent {
    add(op) {
      this.n += op;
    }
  };
}

// project
class ABC extends c(b(A)) {}

const abc = new ABC();

abc.add(2.2222);
abc.print(); // outputs: 2.22

class AB extends b(A) {}
const ab = new AB();

ab.n = 2;
ab.print(); // outputs: 2.00

class AC extends c(A) {}
const ac = new AC();

ac.add(2.2222);
console.log(ac.n); // outputs: 2.2222
```
</code-block>
</code-group>

But the simpleness melts away when we try to use a generic base class.

<code-group>
<code-block title="TS">

```ts
// library
class A<D extends object> {
  _data: D;

  constructor(initial: D) {
    this._data = initial;
  }
}

type Constructor<D extends object, T extends A<D>> = new (...args: any[]) => T;

interface B {
  indentation: number;

  print(): void;
}

function b<D extends object, P extends Constructor<D, A<D>>>(parent: P) {
  return class extends parent implements B {
    indentation = 2;

    print() {
      console.log(JSON.stringify(this._data, undefined, this.indentation));
    }
  };
}

interface C {
  isArray(): boolean;
}

function c<D extends object, P extends Constructor<D, A<D>>>(parent: P) {
  return class extends parent implements C {
    isArray() {
      return Array.isArray(this._data);
    }
  };
}

// project
interface Data {
  a: number;
  b: string;
}

class ABC extends c(b(class extends A<Data> {})) {
  constructor(initial?: Data) {
    super(initial ?? { a: 0, b: '' });
  }
}

const abc = new ABC();

console.log(abc.isArray()); // outputs: false
abc.print(); // outputs:
// {
//   "a": 0,
//   "b": ""
// }
```
</code-block>

<code-block title="JS">

```js
// library
class A {
  _data;

  constructor(initial) {
    this._data = initial;
  }
}

function b(parent) {
  return class extends parent {
    indentation = 2;

    print() {
      console.log(JSON.stringify(this._data, undefined, this.indentation));
    }
  };
}

function c(parent) {
  return class extends parent {
    isArray() {
      return Array.isArray(this._data);
    }
  };
}

// project
class ABC extends c(b(class extends A {})) {
  constructor(initial = undefined) {
    super(initial ?? { a: 0, b: '' });
  }
}

const abc = new ABC();

console.log(abc.isArray()); // outputs: false
abc.print(); // outputs:
// {
//   "a": 0,
//   "b": ""
// }
```
</code-block>
</code-group>

Of course, there is no ideal solution, but we hope you agree with us - mixins are the most optimal solution for the task.

