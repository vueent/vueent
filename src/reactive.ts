import { isRef, ref, unref, computed } from 'vue-demi';

export function trackedData() {
  const values = new WeakMap();

  function getter(inst: any) {
    const value = values.get(inst);

    if (!isRef(value)) values.set(inst, ref(value));

    return unref(values.get(inst));
  }

  function setter(inst: any, value: any) {
    const v = values.get(inst);

    isRef(v) ? (v.value = value) : values.set(inst, ref(value));
  }

  return { getter, setter };
}

export function tracked(target: object, propertyKey: string | symbol) {
  const { getter, setter } = trackedData();

  Reflect.defineProperty(target, propertyKey, {
    get() {
      return getter(this);
    },

    set(value: any) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}

export function calculatedData() {
  const values = new WeakMap();

  function getter(inst: any) {
    const value = values.get(inst);

    if (!isRef(value)) values.set(inst, computed(value));

    return unref(values.get(inst));
  }

  function setter(inst: any, value: any) {
    const v = values.get(inst);

    if (!isRef(v)) values.set(inst, computed(value));
  }

  return { getter, setter };
}

export function calculated(target: object, propertyKey: string | symbol) {
  const { getter, setter } = calculatedData();

  Reflect.defineProperty(target, propertyKey, {
    get() {
      return getter(this);
    },

    set(value: any) {
      setter(this, value);
    },

    enumerable: true,
    configurable: true
  });
}
