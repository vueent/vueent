/**
 * @ts mix
 */
import { BaseModel, Constructor } from './model';

/**
 * Applies mixins to the root model class.
 *
 * Due to the limitations of TypeScript the type of the result class is not saved.
 * You should write class interface manully - see the documentation.
 *
 * @param root - root model class
 * @param mixins - list of mixins functions
 * @returns - result class
 */
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
