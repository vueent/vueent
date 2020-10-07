import { computed, reactive } from 'vue-demi';

import { Constructor } from './model';

export type createFunc<T> = (data: T) => Promise<T | unknown> | T | unknown;
export type updateFunc<T> = (id: unknown, data: T) => Promise<T | unknown> | T | unknown;
export type destroyFunc<T> = (id: unknown, data: T) => Promise<void> | void;

export interface SaveOptions<T extends object> {
  mixinType: 'save';
  create?: createFunc<T>;
  update?: updateFunc<T>;
  destroy?: destroyFunc<T>;
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
  readonly create: createFunc<T>;
  readonly update: updateFunc<T>;
  readonly destroy: destroyFunc<T>;

  processSavedInstance(resp?: T | unknown): void;
}

const dummy = () => undefined;

export function mixSave<T extends object, TBase extends Constructor<T>>() {
  return function(parent: TBase) {
    return class extends parent implements SavePrivate<T> {
      readonly _saveFlags: SaveFlags;
      readonly create: createFunc<T>;
      readonly update: updateFunc<T>;
      readonly destroy: destroyFunc<T>;

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

        this.create = options?.create ?? dummy;
        this.update = options?.update ?? dummy;
        this.destroy = options?.destroy ?? dummy;

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
          this.internal.data = resp as T;
        } else {
          (this.data as Record<string, unknown>)[this.idKey] = resp; // due to https://github.com/microsoft/TypeScript/issues/31661
        }
      }

      async save(): Promise<void> {
        if (this.deleted) {
          this._saveFlags.destroying = true;
          this.beforeDestroy();

          try {
            await this.destroy((this.data as Record<string, unknown>)[this.idKey], this.data);
          } catch (e) {
            this._saveFlags.destroying = false;
            throw e;
          }

          this.afterDestroy();
          this._saveFlags.destroying = false;
          this.flags.destroyed = true;
        } else {
          if (this.new) {
            this._saveFlags.creating = true;
            this.beforeCreate();

            let savedInstance;

            try {
              savedInstance = await this.create(this.data as T);
            } catch (e) {
              this._saveFlags.creating = false;
              throw e;
            }

            this.processSavedInstance(savedInstance);
            this.afterCreate();
            this._saveFlags.creating = false;
            this.flags.new = false;
          } else {
            this._saveFlags.updating = true;
            this.beforeSave();

            let savedInstance;

            try {
              savedInstance = await this.update((this.data as Record<string, unknown>)[this.idKey], this.data as T);
            } catch (e) {
              this._saveFlags.updating = false;
              throw e;
            }

            this.processSavedInstance(savedInstance);
            this.afterSave();
            this._saveFlags.updating = false;
          }

          this.flags.dirty = false;
        }
      }

      hasMixin(mixin: Function): boolean {
        return mixin === mixSave || super.hasMixin(mixin);
      }
    };
  };
}
