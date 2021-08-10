import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';

import { Constructor, BaseModel } from '../model';
import { RollbackMask } from './interfaces';
import { flattenKeys } from './flatten-keys';

/**
 * Public interface of `rollback` mixin.
 */
export interface Rollback {
  /**
   * A list of flatten keys of an object mask.
   */
  maskPaths?: string[];

  /**
   * Reverts the original data state.
   *
   * @param mask - rollback mask
   */
  rollback(mask?: RollbackMask): void;
}

/**
 * Private interface of `rollback` mixin.
 */
export interface RollbackPrivate<T extends object> extends Rollback {
  /**
   * Previous data state.
   */
  _original: T;

  /**
   * A list of flatten keys of an object mask.
   */
  _maskPaths?: string[];

  /**
   * Rewrites the `_original` field with the current data value.
   */
  updateOriginal(): void;

  /**
   * Matches the mask to the data and returns a list of real paths.
   *
   * @param mask - splitted path
   * @param arrayPosition - position of array mark in the splitted path
   * @param path - path prefix
   * @returns - a list of subpaths
   */
  recursivePathFinder(mask: string[], arrayPosition: number, path?: string): string[];
}

/**
 * Appends `rollback` mixin to the model class.
 *
 * @param parent - parent model class
 * @param initialMask - initial rollback mask, @see {@link RollbackMask}
 * @returns - mixed model class
 */
export function rollbackMixin<D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C, initialMask?: RollbackMask) {
  return class extends parent implements RollbackPrivate<D> {
    /**
     * Previous data state.
     */
    _original: D;

    /**
     * A list of flatten keys of an object mask.
     */
    _maskPaths?: string[] = initialMask ? flattenKeys(initialMask) : undefined;

    /**
     * A list of flatten keys of an object mask.
     */
    get maskPaths() {
      return this._maskPaths;
    }

    constructor(...args: any[]) {
      super(...args);
      this._original = cloneDeep(args[1]);
    }

    /**
     * Rewrites the `_original` field with the current data value.
     */
    updateOriginal() {
      this._original = cloneDeep(this._internal.data);
    }

    /**
     * Is called after creating an instance in storage.
     */
    afterCreate() {
      this.updateOriginal();
      super.afterCreate();
    }

    /**
     * Is called after saving an existing instance to storage.
     */
    afterSave() {
      this.updateOriginal();
      super.afterSave();
    }

    /**
     * Reverts the original data state.
     *
     * @param mask - rollback mask
     */
    rollback(customMask?: RollbackMask) {
      if (!this.dirty) return;

      this.beforeRollback();

      this._flags.locked = true;

      if (customMask || this._maskPaths) {
        const maskArray = customMask ? flattenKeys(customMask) : (this._maskPaths as string[]);

        for (const mask of maskArray) {
          const temp = mask.split('.');
          const pos = temp.findIndex(val => val === '[]');

          if (pos > -1) {
            const paths = this.recursivePathFinder(temp, pos);

            for (const path of paths) {
              set(this._internal.data, path, cloneDeep(get(this._original, path)));
            }
          } else {
            set(this._internal.data, mask, cloneDeep(get(this._original, mask)));
          }
        }
      } else {
        for (const key in this._original) this._internal.data[key] = cloneDeep(this._original[key]);
      }

      this._flags.dirty = false;
      this._flags.locked = false;

      this.afterRollback();
    }

    /**
     * Returns `true` if the model has a mixin.
     *
     * @param mixin - mixin function
     */
    hasMixin(mixin: Function): boolean {
      return mixin === rollbackMixin || super.hasMixin(mixin);
    }

    /**
     * Matches the mask to the data and returns a list of real paths.
     *
     * @param mask - splitted path
     * @param arrayPosition - position of array mark in the splitted path
     * @param path - path prefix
     * @returns - a list of subpaths
     */
    recursivePathFinder(mask: string[], arrayPosition: number, path = ''): string[] {
      const result: string[] = [];

      if (arrayPosition > -1) {
        path += mask.slice(0, arrayPosition).join('.');

        const el = get(this._internal.data, path);

        if (!Array.isArray(el)) return result;

        const localMask = mask.slice(arrayPosition + 1);
        const pos = localMask.findIndex(val => val === '[]');
        const suffix = localMask.join('.');

        for (let i = 0; i < el.length; i++) {
          const localPath = `${path}.[${i}].`;

          if (pos > -1) {
            result.push(...this.recursivePathFinder(localMask, pos, localPath));
          } else {
            result.push(`${localPath}${suffix}`);
          }
        }
      }

      return result;
    }
  };
}

/**
 * Returns a typed function that extends a model class with `rollback` mixin.
 *
 * This function can be used my {@see mix} function.
 *
 * @param initialMask - initial rollback mask, @see {@link RollbackMask}
 * @returns - mixin function
 */
export function mixRollback<D extends object, C extends Constructor<D, BaseModel<D>>>(initialMask?: RollbackMask) {
  return (parent: C) => rollbackMixin<D, C>(parent, initialMask);
}

/**
 * Returns a typed function that extends a model class with `rollback` mixin.
 *
 * @param initialMask - initial rollback mask, @see {@link RollbackMask}
 * @returns - mixin function
 */
export function mixRollback2(initialMask?: RollbackMask) {
  return <D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) => rollbackMixin<D, C>(parent, initialMask);
}
