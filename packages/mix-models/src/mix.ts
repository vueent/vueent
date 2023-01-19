/**
 * @ts mix
 */
import { BaseModel, Constructor } from './model';

export type MixinFunction<D extends object, C extends Constructor<D, BaseModel<D>>> = (parent: C) => C;

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
export function mix<D extends object, C extends Constructor<D, BaseModel<D>>>(root: C, ...mixins: MixinFunction<D, C>[]) {
  let result = root;

  for (const mixin of mixins) {
    result = mixin(result);
  }

  return result;
}
