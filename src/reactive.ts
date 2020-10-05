import { isRef, ref, unref, computed } from 'vue-demi';

export interface Option<T> {
  get: () => T;
  set: (value: T) => void;
}

export function trackedData() {
  const values = new WeakMap();

  function getter<T extends Record<string, unknown>>(inst: T) {
    const value = values.get(inst);

    if (!isRef(value)) values.set(inst, ref(value));

    return unref(values.get(inst));
  }

  function setter<T extends Record<string, unknown>>(inst: T, value: unknown) {
    const v = values.get(inst);

    isRef(v) ? (v.value = value) : values.set(inst, ref(value));
  }

  return { getter, setter };
}

export function tracked<T extends Record<string, unknown>>(target: T, propertyKey: string | symbol) {
  const { getter, setter } = trackedData();

  Reflect.defineProperty(target, propertyKey, {
    get(this: T) {
      return getter(this);
    },

    set(this: T, value: unknown) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}

export function calculatedData() {
  const values = new WeakMap();

  function getter<T extends Record<string, unknown>>(inst: T) {
    const value = values.get(inst);

    if (!isRef(value)) values.set(inst, computed(value));

    return unref(values.get(inst));
  }

  function setter<T extends Record<string, unknown>, U>(inst: T, value: Option<U>['get']) {
    const v = values.get(inst);

    if (!isRef(v)) values.set(inst, computed(value));
  }

  return { getter, setter };
}

export function calculated<T extends Record<string, unknown>, U>(target: T, propertyKey: string | symbol) {
  const { getter, setter } = calculatedData();

  Reflect.defineProperty(target, propertyKey, {
    get(this: T) {
      return getter(this);
    },

    set(this: T, value: Option<U>['get']) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}
