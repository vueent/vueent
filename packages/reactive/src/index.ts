import { isRef, ref, unref, computed } from 'vue-demi';

/**
 * A unified interface of the class property.
 */
export interface Option {
  get: () => unknown;
  set: (value: unknown) => void;
}

type Instance = Record<string, unknown>;

/**
 * Returns a getter and a setter of the reactive property.
 */
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

/**
 * Makes a class field a tracked property.
 *
 * A tracked property is a reactive property that can be tracked using calculated (computed) properties.
 *
 * @param target - class
 * @param propertyKey - field name
 */
export function tracked(target: unknown, propertyKey: string | symbol) {
  const { getter, setter } = trackedData();

  Reflect.deleteProperty(target as Instance, propertyKey);

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

/**
 * Returns a getter and an optional setter of the calculated property.
 *
 * @param descriptor - a property descriptor
 */
export function calculatedAccessorsData(descriptor: PropertyDescriptor) {
  const values = new WeakMap();

  const { set, get } = descriptor;

  if (!get) throw new Error('Getter must be defined for calculated property');

  function getter(this: Instance) {
    let v = values.get(this);

    if (!isRef(v)) {
      if (set) v = computed({ get: (get as Option['get']).bind(this), set: set.bind(this) });
      else v = computed((get as Option['get']).bind(this));

      values.set(this, v);
    }

    return unref(v.value);
  }

  function setter(this: Instance, value: Option['get']) {
    let v = values.get(this);

    if (!isRef(v)) {
      v = computed({
        get: (get as Option['get']).bind(this),
        set: (set as Option['set']).bind(this)
      });

      values.set(this, v);
    }

    v.value = value;
  }

  return { getter, setter: set ? setter : undefined };
}

/**
 * Makes a class property a computed property.
 *
 * A calculated property differs with a pure property in that the calculated property
 * is lazy and updates its internal value when its dependencies are changed.
 *
 * @param target
 * @param propertyKey
 * @param descriptor - property descriptor
 */
export function calculated(target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const { getter, setter } = calculatedAccessorsData(descriptor);

  descriptor.get = getter;
  descriptor.set = setter;
}
