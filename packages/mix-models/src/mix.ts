import { Constructor } from './model';

export function mix<T extends object, TBase extends Constructor<T>>(root: TBase, ...mixins: ((parent: TBase) => TBase)[]) {
  let result = root;

  for (const mixin of mixins) {
    result = mixin(result);
  }

  return result;
}
