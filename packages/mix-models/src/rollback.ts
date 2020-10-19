import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';

import { Constructor } from './model';
import { flattenKeys } from './flatten-keys';

export type RollbackArrayMask = RollbackMask & { $array: boolean; $index?: number[] };

export function isRollbackArrayMaskUnsafe(mask: RollbackMask | RollbackArrayMask): mask is RollbackArrayMask {
  return '$array' in mask;
}

export type RollbackMask = { [key: string]: RollbackMask | RollbackArrayMask | boolean | number[] };

export interface Rollback {
  maskPaths?: string[];

  rollback(mask?: RollbackMask): void;
}

export interface RollbackPrivate<T extends object> extends Rollback {
  _original: T;
  _maskPaths?: string[];

  updateOriginal(): void;
  recursivePathFinder(mask: string[], arrayPosition: number, path?: string): void;
}

export function mixRollback<T extends object, TBase extends Constructor<T>>(initialMask?: RollbackMask) {
  return function(parent: TBase) {
    return class extends parent implements RollbackPrivate<T> {
      _original: T;
      _maskPaths?: string[] = initialMask ? flattenKeys(initialMask) : undefined;

      constructor(...args: any[]) {
        super(...args);
        this._original = cloneDeep(args[1]);
      }

      updateOriginal() {
        this._original = cloneDeep(this._internal.data) as T;
      }

      afterCreate() {
        this.updateOriginal();
        super.afterCreate();
      }

      afterSave() {
        this.updateOriginal();
        super.afterSave();
      }

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
          this._internal.data = cloneDeep(this._original);
        }

        this._flags.dirty = false;
        this._flags.locked = false;

        this.afterRollback();
      }

      hasMixin(mixin: Function): boolean {
        return mixin === mixRollback || super.hasMixin(mixin);
      }

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
  };
}
