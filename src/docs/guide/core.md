# Core

This is a small library that integrates controllers and services patterns to the application. The package provides three main elements: a `Vueent` instance, abstract `Controller` and `Service` classes.

## Installation

<code-group>
<code-block title="NPM" active>
```bash
npm install --save-dev @vueent/core
```
</code-block>

<code-block title="YARN">
```bash
yarn add --dev @vueent/core
```
</code-block>
</code-group>

::: tip
This library has no [Vue](https://v3.vuejs.org/) dependencies.
:::

## Usage

::: warning

As of TypeScript 4.3, support of experimental decorators must be allowed by the following `tsconfig.json` options:

```json
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node",
    "useDefineForClassFields": false,
    "experimentalDecorators": true
  }
}
```

First of all, you should create a module to append `VueEnt` into your project. Use `initVueent()` which returns an object with several bound functions.
:::

<code-group>
<code-block title="Modern">

```ts
// file: vueent.ts
import { initVueent } from '@vueent/core';

export const { useVueent, registerService, registerController, useService, useController, injectService, injectController } =
  initVueent();
```

</code-block>
<code-block title="Legacy">

```ts
// file: vueent.ts
import { initVueent } from '@vueent/core';

export const {
  useVueent,
  registerService,
  registerController,
  useService,
  useController,
  legacyInjectService,
  legacyInjectController
} = initVueent();
```

</code-block>
</code-group>

If you want to use injection of subling controllers, you have to make your controllers persistent by setting the `persistentControllers` VueEnt option:

```ts
initVueent({ persistentControllers: true });
```

After that, all controllers will not be removed from the VueEnt instance along with its route components.

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

### legacyInjectService

The `legacyInjectService` experimental decorator injects a lazy-initialized instance of a registered service into a class property.

### injectController

The `injectController` decorator injects a lazy-initialized instance of a registered controller into a class property.

### legacyInjectController

The `legactInjectController` experimental decorator injects a lazy-initialized instance of a registered controller into a class property.

### Full example

You may create a `Vueent` instance directly using `useVueent` call, but it's not necessary, it will be created automatically after the first `useController` or `useService` call. `onBeforeMount`, `onMounted`, `onBeforeUnmount`, `onUnmounted`, `onBeforeUpdate`, `onUpdated`, `onActivated`, and `onDeactivated` hooks are automatically connected to `init`, `mounted`, `reset`, `destroy`, `willUpdated`, `updated`, `activated`, and `deactivated` methods of Controller.

::: danger
Do not use the following library provided functions directly: `useVueent`, `registerService`, `registerController`, `useService`, `useController`, `injectService`, `injectController`. That functions have to be bound to a context which contains a `Vueent` class instance. Use functions with the same names provided by the `initVueent` function.
:::

Let's write a simple example:

```vue
<!-- file: app.vue -->
<template>
  <div>
    <div>Started at: {{ timestamp }}</div>
    <div>Button clicks: {{ counter }}</div>
    <div>
      <button type="button" @click="increment">Increment</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

import { useController } from '@/vueent';

import AppController from './app';

function setup() {
  // creating a controller instance with parameters.
  const controller = useController(AppController, new Date().getTime());

  const increment = () => controller.increment();
  const counter = computed(() => controller.counter);

  return {
    timestamp: controller.date, // non-reactive value
    counter,
    increment
  };
}

export default defineComponent({ setup });
</script>
```

<code-group>
<code-block title="Modern">

```ts
// file: app.ts
import { Controller } from '@vueent/core';

import { registerController, injectService as service } from '@/vueent';
import ClickerService from '@/services/clicker';

export default class AppController extends Controller {
  // lazy service injection
  @service(ClickerService) private accessor clicker!: ClickerService;

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

  public mounted() {
    console.log('onMounted');
  }

  public reset() {
    console.log('onBeforeUnmount');
  }

  public destroy() {
    console.log('onUnmounted'); // stop watchers, timers, etc.
  }

  public willUpdate() {
    console.log('onBeforeUpdate');
  }

  public updated() {
    console.log('onUpdated');
  }

  public activated() {
    console.log('onActivated');
  }

  public deactivated() {
    console.log('onDeactivated');
  }

  public increment() {
    this.clicker.increment();
  }
}

registerController(AppController);
```

</code-block>

<code-block title="Legacy">

```ts
// file: app.ts
import { Controller } from '@vueent/core';

import { registerController, legacyInjectService as service } from '@/vueent';
import ClickerService from '@/services/clicker';

export default class AppController extends Controller {
  // lazy service injection
  @service(ClickerService) private readonly clicker!: ClickerService;

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

  public mounted() {
    console.log('onMounted');
  }

  public reset() {
    console.log('onBeforeUnmount');
  }

  public destroy() {
    console.log('onUnmounted'); // stop watchers, timers, etc.
  }

  public willUpdate() {
    console.log('onBeforeUpdate');
  }

  public updated() {
    console.log('onUpdated');
  }

  public activated() {
    console.log('onActivated');
  }

  public deactivated() {
    console.log('onDeactivated');
  }

  public increment() {
    this.clicker.increment();
  }
}

registerController(AppController);
```

</code-block>
</code-group>

<code-group>
<code-block title="Modern">

```ts
// file: services/clicker.ts
import { Service } from '@vueent/core';
import { tracked } from '@vueent/reactive'; // you may use built-in Vue's `ref`

import { registerService } from '@/vueent';

export default class ClickerService extends Service {
  @tracked private accessor _counter = 0;

  public get counter() {
    return this._counter;
  }

  public increment() {
    ++this._counter;
  }
}

registerService(ClickerService);
```

</code-block>

<code-block title="Legacy">

```ts
// file: services/clicker.ts
import { Service } from '@vueent/core';
import { legacyTracked as tracked } from '@vueent/reactive'; // you may use built-in Vue's `ref`

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

</code-block>
</code-group>
