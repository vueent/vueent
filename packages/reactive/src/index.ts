import { isRef, ref, unref, computed, ComputedRef, WritableComputedRef } from 'vue-demi';

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
 * ATTENTION: This is a legacy decorator implementation.
 *
 * @param target - class
 * @param propertyKey - field name
 */
export function legacyTracked(target: unknown, propertyKey: string | symbol) {
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
 *  * Makes a class accessor a tracked property.
 *
 * A tracked property is a reactive property that can be tracked using calculated (computed) properties.
 *
 * @param target - accessor target
 * @param context - decorator context
 * @returns decorated accessor
 */
export function tracked<T, V>(
  target: ClassAccessorDecoratorTarget<T, V>,
  context: ClassAccessorDecoratorContext<T, V>
): ClassAccessorDecoratorResult<T, V> {
  if (context.kind !== 'accessor') throw new Error('Target must be an accessor');

  const { getter, setter } = trackedData();

  return {
    get(this): V {
      return getter(this);
    },

    set(this, value: V) {
      return setter(this, value);
    }
  };
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
 * ATTENTION: This is a legacy decorator implementation.
 *
 * @param target
 * @param propertyKey
 * @param descriptor - property descriptor
 */
export function legacyCalculated(target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const { getter, setter } = calculatedAccessorsData(descriptor);

  descriptor.get = getter;
  descriptor.set = setter;
}

/**
 * An interface supports lazy computed property initialization.
 */
interface ComputedProp<T = any> {
  get?: () => T;
  set?: (value: T) => void;
  computed?: ComputedRef<T> | WritableComputedRef<T>;
}

/**
 * The global WeakMap of all computed properties.
 */
const computeds = new WeakMap<object, ComputedProp>();

/**
 * Makes a class property a computed property.
 *
 * A calculated property differs with a pure property in that the calculated property
 * is lazy and updates its internal value when its dependencies are changed.
 *
 * @param value - property getter
 * @param context - decorator context
 * @returns decorated getter
 */
export function calculatedGetter<T extends object, V>(value: () => V, context: ClassGetterDecoratorContext<T, V>) {
  function initializer(this: T) {
    const prop = computeds.get(this);

    if (!prop) computeds.set(this, { get: value as () => V });
    else prop.get = value as () => V;
  }

  context.addInitializer(initializer);

  return function (this: T) {
    const prop = computeds.get(this);

    if (!prop) throw new Error('Calculated property was not initialized');

    if (!prop.computed) {
      if (!prop.get) throw new Error('Getter must be defined for calculated property');

      if (prop.set !== undefined) prop.computed = computed<V>({ get: prop.get.bind(this), set: prop.set.bind(this) });
      else prop.computed = computed<V>(prop.get.bind(this));
    }

    return prop.computed.value;
  } as () => V;
}

/**
 * Makes a class property a computed property.
 *
 * A calculated property differs with a pure property in that the calculated property
 * is lazy and updates its internal value when its dependencies are changed.
 *
 * @param value - property setter
 * @param context - decorator context
 * @returns decorated setter
 */
export function calculatedSetter<T extends object, V>(value: (value: V) => void, context: ClassSetterDecoratorContext<T, V>) {
  function initializer(this: T) {
    const prop = computeds.get(this);

    if (!prop) computeds.set(this, { set: value });
    else prop.set = value;
  }

  context.addInitializer(initializer);

  return function (this: T, value: any) {
    const prop = computeds.get(this);

    if (!prop) throw new Error('Calculated property was not initialized');

    if (!prop.computed) {
      if (!prop.get) throw new Error('Getter must be defined for calculated property');
      else if (!prop.set) throw new Error('Setter must be defined for writable calculated property');

      prop.computed = computed<V>({ get: prop.get.bind(this), set: prop.set.bind(this) });
    }

    (prop.computed as WritableComputedRef<V>).value = value;
  } as (value: V) => void;
}

/**
 * A getter or setter of the property.
 * @template T property value type
 */
export type ClassGetterSetterDecoratorValue<T> = (() => T) | ((value: T) => void);

/**
 * A decorated getter or setter of the property.
 * @template T incoming getter or setter of the property
 * @template V property value type
 */
export type ClassGetterSetterDecoratorResult<T extends ClassGetterSetterDecoratorValue<V>, V = any> = Parameters<T> extends [
  arg: { value: V }
]
  ? (value: V) => void
  : () => V;

/**
 * Makes a class property a computed property.
 *
 * A calculated property differs with a pure property in that the calculated property
 * is lazy and updates its internal value when its dependencies are changed.
 *
 * @param value - property getter or setter
 * @param context - decorator context
 * @returns decorated getter or setter
 */
export function calculated<T extends object, V>(
  value: ClassGetterSetterDecoratorValue<V>,
  context: ClassGetterDecoratorContext<T, V> | ClassSetterDecoratorContext<T, V>
) {
  if (context.kind === 'getter')
    return calculatedGetter(value as () => V, context) as ClassGetterSetterDecoratorResult<typeof value, V>;
  else if (context.kind === 'setter')
    return calculatedSetter(value as (value: V) => void, context) as ClassGetterSetterDecoratorResult<typeof value, V>;
  else throw new Error('Target must be a getter or setter');
}
