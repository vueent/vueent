import { isRef, ref, unref, computed } from 'vue-demi';

export interface Option<T> {
  get: () => T;
  set: (value: T) => void;
}

export type Instance = Record<string, unknown>;

export function trackedData() {
  const values = new WeakMap();

  function getter(inst: unknown) {
    const value = values.get(inst as Instance);

    if (!isRef(value)) values.set(inst as Instance, ref(value));

    return unref(values.get(inst as Instance));
  }

  function setter(inst: unknown, value: unknown) {
    const v = values.get(inst as Instance);

    isRef(v) ? (v.value = value) : values.set(inst as Instance, ref(value));
  }

  return { getter, setter };
}

export function tracked(target: unknown, propertyKey: string | symbol) {
  const { getter, setter } = trackedData();

  Reflect.defineProperty(target as Instance, propertyKey, {
    get(this: Instance) {
      return getter(this);
    },

    set(this: Instance, value: unknown) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}

export function calculatedData() {
  const values = new WeakMap();

  function getter(inst: unknown) {
    const value = values.get(inst as Instance);

    if (!isRef(value)) values.set(inst as Instance, computed(value));

    return unref(values.get(inst as Instance));
  }

  function setter<T>(inst: unknown, value: Option<T>['get']) {
    const v = values.get(inst as Instance);

    if (!isRef(v)) values.set(inst as Instance, computed(value));
  }

  return { getter, setter };
}

export function calculated<T>(target: unknown, propertyKey: string | symbol) {
  const { getter, setter } = calculatedData();

  Reflect.defineProperty(target as Instance, propertyKey, {
    get(this: Instance) {
      return getter(this);
    },

    set(this: Instance, value: Option<T>['get']) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}
