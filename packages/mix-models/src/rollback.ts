import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';

import { Constructor } from './model';
import { flattenKeys } from './flatten-keys';
import { isArray } from 'lodash';

export type RollbackMask = {
  [key: string]: RollbackMask | boolean | unknown[];
};

export interface Rollback {
  maskPaths?: string[];

  rollback(mask?: RollbackMask): void;
}

export interface RollbackPrivate<T extends object> extends Rollback {
  _original: T;
  _maskPaths?: string[];

  updateOriginal(): void;
  recursivePathFinder(mask: string[], result: string[]): void;
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

        if (customMask) {
          const maskArray = flattenKeys(customMask);

          for (const mask of maskArray) {
            const temp = mask.split('.');

            if (temp.find(val => val === '[]')) {
              const paths = this.recursivePathFinder(temp);

              for (const path of paths) {
                set(this._internal.data, path, get(this._original, path));
              }
            } else {
              set(this._internal.data, mask, get(this._original, mask));
            }
          }
        } else if (this._maskPaths) {
          for (const mask of this._maskPaths) {
            const temp = mask.split('.');

            if (temp.find(val => val === '[]')) {
              const paths = this.recursivePathFinder(temp);

              for (const path of paths) {
                set(this._internal.data, path, get(this._original, path));
              }
            } else {
              set(this._internal.data, mask, get(this._original, mask));
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

      recursivePathFinder(mask: string[], result: string[] = [], path = ''): string[] {
        const arrayPosition = mask.findIndex(value => value === '[]');

        if (arrayPosition > -1) {
          path += mask.splice(0, arrayPosition).join();
          mask.splice(0, 1);

          const el = get(this._internal.data, path);

          if (!isArray(el)) return result;

          for (let i = 0; i < el.length; i++) {
            const localPath = `${path}[${i}].`;
            const localMask = cloneDeep(mask);

            if (mask.find(val => val === '[]')) {
              this.recursivePathFinder(localMask, result, localPath);
            } else {
              result.push(`${localPath}${mask}`);
            }
          }
        }

        return result;
      }
    };
  };
}
