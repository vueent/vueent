import { computed, reactive } from 'vue-demi';

import { Options, Constructor } from './model';

export type CreateFunc<T> = (data: T) => Promise<T | unknown> | T | unknown;
export type UpdateFunc<T> = (id: unknown, data: T) => Promise<T | unknown> | T | unknown;
export type DestroyFunc<T> = (id: unknown, data: T) => Promise<void> | void;

export interface SaveOptions<T extends object> extends Options {
  mixinType: 'save';
  create?: CreateFunc<T>;
  update?: UpdateFunc<T>;
  destroy?: DestroyFunc<T>;
}

export interface SaveFlags {
  creating: boolean;
  updating: boolean;
  destroying: boolean;
  saving: boolean;
}

export interface Save {
  readonly creating: boolean;
  readonly updating: boolean;
  readonly destroying: boolean;
  readonly saving: boolean;

  save(): Promise<void>;
}

export interface SavePrivate<T extends object> extends Save {
  readonly _saveFlags: SaveFlags;
  readonly _create: CreateFunc<T>;
  readonly _update: UpdateFunc<T>;
  readonly _destroy: DestroyFunc<T>;

  processSavedInstance(resp?: T | unknown): void;
}

const dummy = () => undefined;

export function mixSave<T extends object, TBase extends Constructor<T>>() {
  return function(parent: TBase) {
    return class extends parent implements SavePrivate<T> {
      readonly _saveFlags: SaveFlags;
      readonly _create: CreateFunc<T>;
      readonly _update: UpdateFunc<T>;
      readonly _destroy: DestroyFunc<T>;

      get creating() {
        return this._saveFlags.creating;
      }

      get updating() {
        return this._saveFlags.updating;
      }

      get destroying() {
        return this._saveFlags.destroying;
      }

      get saving() {
        return this._saveFlags.saving;
      }

      constructor(...args: any[]) {
        super(...args);

        const options = args.slice(3).find(arg => arg?.mixinType === 'save') as SaveOptions<T> | undefined;

        this._create = options?.create ?? dummy;
        this._update = options?.update ?? dummy;
        this._destroy = options?.destroy ?? dummy;

        const saving = computed(() => this._saveFlags.creating || this._saveFlags.updating || this._saveFlags.destroying);

        this._saveFlags = reactive({
          creating: false,
          updating: false,
          destroying: false,
          saving: (saving as unknown) as boolean
        });
      }

      processSavedInstance(resp?: T | unknown): void {
        if (resp === undefined) return;
        else if (typeof resp === 'object') {
          this._internal.data = resp as T;
        } else {
          (this.data as Record<string, unknown>)[this._idKey] = resp; // due to https://github.com/microsoft/TypeScript/issues/31661
        }
      }

      async save(): Promise<void> {
        if (this.deleted) {
          this._saveFlags.destroying = true;
          this.beforeDestroy();

          try {
            await this._destroy((this.data as Record<string, unknown>)[this._idKey], this.data);
          } catch (e) {
            this._saveFlags.destroying = false;
            this._flags.deleted = false;
            throw e;
          }

          this.afterDestroy();
          this._saveFlags.destroying = false;
          this._flags.destroyed = true;
        } else {
          if (this.new) {
            this._saveFlags.creating = true;
            this.beforeCreate();

            let savedInstance;

            try {
              savedInstance = await this._create(this.data as T);
            } catch (e) {
              this._saveFlags.creating = false;
              throw e;
            }

            this.processSavedInstance(savedInstance);
            this.afterCreate();
            this._saveFlags.creating = false;
            this._flags.new = false;
          } else {
            this._saveFlags.updating = true;
            this.beforeSave();

            let savedInstance;

            try {
              savedInstance = await this._update((this.data as Record<string, unknown>)[this._idKey], this.data as T);
            } catch (e) {
              this._saveFlags.updating = false;
              throw e;
            }

            this.processSavedInstance(savedInstance);
            this.afterSave();
            this._saveFlags.updating = false;
          }

          this._flags.dirty = false;
        }
      }

      hasMixin(mixin: Function): boolean {
        return mixin === mixSave || super.hasMixin(mixin);
      }
    };
  };
}
