# @vueent/core

A small library (part of [_VueEnt_](https://github.com/vueent/vueent)) that integrates controllers and services patterns to the application. The package provides three main elements: `Vueent` class, abstract `Controller` and `Service` classes.

## Installation

```sh
npm install -D @vueent/core
```

This library has [Vue 3](https://v3.vuejs.org/guide/introduction.html) or [Vue composition API plugin for Vue 2](https://github.com/vuejs/composition-api) peer dependency, it means that your have to add this dependencies into your project (`package.json`) manually.

## Usage

First of all, you should create a module to append `VueEnt` into your project. Use `initVueent()` which returns an object with several bound functions.

```ts
// file: vueent.ts
import { initVueent } from '@vueent/core';

export const { useVueent, registerService, registerController, useService, useController, injectService, injectController } =
  initVueent();
```

### registerService

The `registerService` function registers a service class into the service registry of a `Vueent` instance.

### registerController

The `registerController` function registers a controller class into the controller registry of a `Vueent` instance.

### useVueent

The `useVueent` function returns a lazy-initialized instance of the `Vueent` class.

### useService

The `useService` function returns a lazy-initialized instance of a registered service.

### useController

The `useController` function returns a lazy-initialized instance of a registered controller.

### injectService

The `injectService` decorator injects a lazy-initialized instance of a registered service into a class property.

### injectController

The `injectController` decorator injects a lazy-initialized instance of a registered controller into a class property.

### Full example

You may create a `Vueent` instance directly using `useVueent` call, but it's not necessary, it will be created automatically after the first `useController` or `useService` call. `onBeforeMount`, `onBeforeUnmount`, and `onUnmounted` hooks are automatically connected to `init`, `reset`, `destroy` methods of Controller.

::: danger
Do not use the following library provided functions directly: `useVueent`, `registerService`, `registerController`, `useService`, `useController`, `injectService`, `injectController`. That functions have to be bound to a context which contains a `Vueent` class instance. Use functions with the same names provided by the `initVueent` function.
:::

Let's write a simple example:

```html
<!-- file: app.vue -->
<!-- section: template -->
<div>
  <div>Started at: {{ timestamp }}</div>
  <div>Button clicks: {{ counter }}</div>
  <div>
    <button type="button" @click="increment">Increment</button>
  </div>
</div>
```

```ts
// file: app.vue
// section: script
import { defineComponent, computed } from 'vue';

import { useController } from '@/vueent';

import AppController from './app';

function setup() {
  const controller = useController(AppController, new Date().getTime()); // creating a controller instance with parameters.

  const increment = () => controller.increment();
  const counter = computed(() => controller.counter);

  return {
    timestamp: controller.date, // non-reactive value
    counter,
    increment
  };
}

export default defineComponent({ setup });
```

```ts
// file: app.ts
import { Controller } from '@vueent/core';

import { registerController, injectService as service } from '@/vueent';
import ClickerService from '@/services/clicker';

export default class AppController extends Controller {
  @service(ClickerService) private readonly clicker!: ClickerService; // lazy service injection

  public readonly date: number;

  public get counter() {
    return this.clicker.counter;
  }

  constructor(date: number) {
    super();
    this.date = date;
  }

  public init() {
    console.log('onBeforeMount');
  }

  public reset() {
    console.log('onBeforeUnmount');
  }

  public destroy() {
    console.log('onUnmounted'); // stop watchers, timers, etc.
  }

  public increment() {
    this.clicker.increment();
  }
}

registerController(AppController);
```

```ts
// file: services/clicker.ts
import { Service } from '@vueent/core';
import { tracked } from '@vueent/reactive'; // you may use built-in Vue's `ref`

import { registerService } from '@/vueent';

export default class ClickerService extends Service {
  @tracked private _counter = 0;

  public get counter() {
    return this._counter;
  }

  public increment() {
    ++this._counter;
  }
}

registerService(ClickerService);
```

## LICENSE

[MIT](./LICENSE)
