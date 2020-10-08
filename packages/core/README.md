# @vueent/core

A small library (part of [_VueenT_])(https://github.com/vueent/vueent) that integrates controllers and services patterns to the application. The package provides three main elements: a `Vueent` instance, abstract `Controller` and `Service` classes.

## Installation

```sh
npm install -D @vueent/core
```

## Usage

You may create a `Vueent` instance directly using `useVueent()` call, but it's not necessary, it will be created automatically after the first `useController()` or `useService()` call.

Let's write a simple example:

```html
<!-- file: app.vue -->
<!-- section: template -->
<div>
  <div>Started at: {{ timestamp }}</div>
  <div>Button clicks: {{ counter }}</div>
  <div><button type="button" @click="increment">Increment</button></div>
</div>
```

```ts
// file: app.vue
// section: script
import { defineComponent, computed } from 'vue';
import { useController } from '@vueent/core';

import { AppController } from './app';

function setup() {
  const controller = useController(AppController, new Date().getTime()); // creating a controller instance with parameters.

  const increment = () => controller.increment();
  const counter = computed(() => controller.counter);

  return {
    timestamp: controller.date
  };
}

export default defineComponent({ setup });
```

```ts
// file: app.ts
import { Controller, injectService as service } from '@vueent/core';

import { ClickerService } from '@/services/clicker';

export class AppController extends {
  @inject(ClickerService) private readonly clicker!: ClickerService; // lazy service injection

  public get counter() {
    return this.clicker.counter;
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
```

```ts
// file: services/clicker.ts
import { Service } from '@vueent/core';
import { tracked } from '@vueent/reactive'; // you may use built-in Vue's `ref`

export class ClickerService {
  @tracked private _counter = 0;

  public get counter() {
    return this._counter;
  }

  public increment() {
    ++this._counter;
  }
}
```

## LICENSE

[MIT](./LICENSE)

```

```
