import { isRef, ref, unref, computed } from 'vue-demi';

// export const trackedProperties = Symbol('trackedProperties');

// export function getTrackedProperties(inst: any) {
//   let properties = Reflect.get(inst, trackedProperties);

//   if (!properties) {
//     properties = {};
//     inst[trackedProperties] = properties;
//   }

//   return properties;
// }

// export function tracked(target: object, propertyKey: string | symbol) {
//   Reflect.defineProperty(target, propertyKey, {
//     get() {
//       const values = getTrackedProperties(this);
//       const value = values[propertyKey];

//       if (!isRef(value)) values[propertyKey] = ref(value);

//       return unref(values[propertyKey]);
//     },

//     set(value: any) {
//       const values = getTrackedProperties(this);
//       console.log(values);
//       const v = values[propertyKey];

//       isRef(v) ? (v.value = value) : (values[propertyKey] = ref(value));
//     },

//     enumerable: true,
//     configurable: true
//   });
// }

// export function calculated(target: object, propertyKey: string | symbol) {
//   Reflect.defineProperty(target, propertyKey, {
//     get() {
//       const values = getTrackedProperties(this);
//       const value = values[propertyKey];

//       if (!isRef(value)) values[propertyKey] = computed(value);

//       return unref(values[propertyKey]);
//     },

//     set(value: any) {
//       const values = getTrackedProperties(this);
//       const v = values[propertyKey];

//       if (!isRef(v)) values[propertyKey] = computed(value);
//     },

//     enumerable: true,
//     configurable: true
//   });
// }

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
