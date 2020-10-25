# @vueent/core

A small library (part of [_VueenT_](../../)) that integrates controllers and services patterns to the application. The package provides three main elements: a `Vueent` instance, abstract `Controller` and `Service` classes.

## Installation

```sh
npm install -D @vueent/core
```

## Usage

You may create a `Vueent` instance directly using `useVueent()` call, but it's not necessary, it will be created automatically after the first `useController()` or `useService()` call. `onBeforeMount`, `onBeforeUnmount`, and `onUnmounted` hooks are automatically connected to `init`, `reset`, `destroy` methods of Controller.

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
import { useController } from '@vueent/core';

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

```ts
// file: app.ts
import {
  Controller,
  registerController,
  injectService as service
} from '@vueent/core';

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
import { Service, registerService } from '@vueent/core';
import { tracked } from '@vueent/reactive'; // you may use built-in Vue's `ref`

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
