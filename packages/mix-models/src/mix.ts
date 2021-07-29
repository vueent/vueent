import { BaseModel, Constructor } from './model';

export function mix<D extends object, T extends BaseModel<D>, C extends Constructor<D, T>>(
  root: C,
  ...mixins: ((parent: C) => C)[]
) {
  let result = root;

  for (const mixin of mixins) {
    result = mixin(result);
  }

  return result;
}
