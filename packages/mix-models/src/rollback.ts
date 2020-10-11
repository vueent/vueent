import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';

import { Constructor } from './model';
import { flattenKeys } from './flatten-keys';

export type RollbackMask = {
  [key: string]: RollbackMask | boolean;
};

export interface Rollback {
  maskPaths?: string[];

  rollback(mask?: RollbackMask): void;
}

export interface RollbackPrivate<T extends object> extends Rollback {
  _original: T;
  _maskPaths?: string[];

  updateOriginal(): void;
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
            set(this._internal.data, mask, get(this._original, mask));
          }
        } else if (this._maskPaths) {
          for (const mask of this._maskPaths) {
            set(this._internal.data, mask, get(this._original, mask));
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
    };
  };
}
