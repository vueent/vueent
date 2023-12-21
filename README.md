# vueent

<p align="center">
  <img src="src/docs/.vuepress/public/img/logo.png">
</p>

_VueEnt_ is a library for building scalable Vue applications. See the [documentation](https://vueent.github.io/vueent/) for more information.

[![Build Status](https://travis-ci.com/vueent/vueent.svg?branch=main)](https://travis-ci.com/vueent/vueent) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Motivation

[_Vue_](https://vuejs.org/) is a wonderful web framework. Over the past few years, it has gained immense popularity. People use it every day at tons of projects. That projects are growing and _Vue_ is growing too. The third version of the framework introduced us a new _Composition API_ that allows to use reactivity outside of Vue components. The main problem of Vue, we think, is that it is positioned as a complete framework, but ties every application logic to the usage of its components. This approach works well for small applications, but doesn't for large tasks. In other words, your Vue components **is** the application that provides no instruments for the scaling. Do you remember the time when all your backend API calls were placed inside [_Vuex_](https://vuex.vuejs.org/) actions? Let's see [_Angular_](https://angular.io/) and [_Ember_](https://emberjs.com/) - _all-in-one_ frameworks. They provides a prepared project structure and typical approaches, splits the business logic, the transport layer, and the view, but along with it brings some complex conceptions that inceases the threshold of entry. In contrast, _React_ is just a UI library that **is used by** the application, therefore developers are free to choose between [_Redux_](https://redux.js.org/), [_MobX_](https://mobx.js.org/), etc. Vue keeps its place in the middle. The modern Composition API gives us a free hand to share the code outside of components, but it doesn't tell us how. If you are agree, welcome under the hood.

## Goals

The main goal of this project is to provide tools and typical approaches for building scalable web applications using Vue.

In the future, maybe, we'll replace a Vue 3/Vue Composition API dependency with [`@vue/reactivity`](https://www.npmjs.com/package/@vue/reactivity) and it will be possible to use VueEnt with React.

## Non-goals

Although VueEnt offers its own version of the file structure for projects, it is not the goal to enforce any strict structure. The creation of yet another all-in-one framework based on Vue is not the VueEnt's goal too.

## Installation

```sh
npm install --save-dev @vueent/<package_name>
```

VueEnt consists of three independent parts that can be used separately:

- [`@vueent/reactive`](./packages/reactive) - typescript decorators which allows to use `ref` and `computed` properties transparently inside of classes
- [`@vueent/core`](./packages/core) - a small library that integrates controllers and services patterns to the application
- [`@vueent/mix-models`](./packages/mix-models) - a library that provides reactive models classes for _nosql_ models with optionally saving, rollback and live validations

## Usage

## Toubleshooting

## LICENSE

[MIT](./LICENSE)
