import { computed, reactive } from 'vue-demi';

import { Options, Constructor, BaseModel } from './model';

/**
 * A function that creates a new record in the storage.
 *
 * @param data - model data
 * @returns - saved instance
 */
export type CreateFunc<T> = (data: T) => Promise<T | unknown> | T | unknown;

/**
 * A function that saves an existing record to the storage.
 *
 * @param id - data identifier
 * @param data - model data
 * @returns - saved instance
 */
export type UpdateFunc<T> = (id: unknown, data: T) => Promise<T | unknown> | T | unknown;

/**
 * A function that deletes an exisiting record from the storage.
 *
 * @param id - data identifier
 * @param data - model data
 */
export type DestroyFunc<T> = (id: unknown, data: T) => Promise<void> | void;

/**
 * Save mixin options.
 */
export interface SaveOptions<T extends object> extends Options {
  /**
   * Mixin name.
   */
  mixinType: 'save';

  /**
   * A function that creates a new record in the storage.
   *
   * {@link CreateFunc}
   */
  create?: CreateFunc<T>;

  /**
   * A function that saves an existing record to the storage.
   *
   * {@link UpdateFunc}
   */
  update?: UpdateFunc<T>;

  /**
   * A function that deletes an exisiting record from the storage.
   *
   * {@link DestroyFunc}
   */
  destroy?: DestroyFunc<T>;
}

/**
 * This flags indicate a state of mixin's operations.
 */
export interface SaveFlags {
  /**
   * Creating a record in the storage.
   */
  creating: boolean;

  /**
   * Updating a record in the storage.
   */
  updating: boolean;

  /**
   * Deleting a record from the storage.
   */
  destroying: boolean;

  /**
   * Saving a record to the storage.
   */
  saving: boolean;
}

/**
 * Public interface of the `save` mixin.
 */
export interface Save {
  /**
   * A flag indicating that the mixin is creating a record in the storage.
   *
   * {@link SaveFlags.creating}
   */
  readonly creating: boolean;

  /**
   * A flag indicating that the mixin is updating a record in the storage.
   *
   * {@link SaveFlags.updating}
   */
  readonly updating: boolean;

  /**
   * A flag indicating that the mixin is deleting a record from the storage.
   *
   * {@link SaveFlags.destroying}
   */
  readonly destroying: boolean;

  /**
   * A flag indicating that the mixin is saving a record to the storage.
   *
   * {@link SaveFlags.saving}
   */
  readonly saving: boolean;

  /**
   * Synchronizes a model state with the storage.
   */
  save(): Promise<void>;
}

export interface SavePrivate<T extends object> extends Save {
  /**
   * Flags that indicate a state of mixin's operations.
   *
   * {@link SaveFlags}
   */
  readonly _saveFlags: SaveFlags;

  /**
   * A function that creates a new record in the storage.
   *
   * {@link CreateFunc}
   */
  readonly _create: CreateFunc<T>;

  /**
   * A function that saves an existing record to the storage.
   *
   * {@link UpdateFunc}
   */
  readonly _update: UpdateFunc<T>;

  /**
   * A function that deletes an exisiting record from the storage.
   *
   * {@link DestroyFunc}
   */
  readonly _destroy: DestroyFunc<T>;

  processSavedInstance(resp?: T | unknown): void;
}

const dummy = () => undefined;

/**
 * Appends save mixin to the model class.
 *
 * @param parent - parent model class
 * @returns - mixed model class
 */
export function saveMixin<D extends object, T extends BaseModel<D>, C extends Constructor<D, T>>(parent: C) {
  return class extends parent implements SavePrivate<D> {
    /**
     * Flags that indicate a state of mixin's operations.
     *
     * {@link SaveFlags}
     */
    readonly _saveFlags: SaveFlags;

    /**
     * A function that creates a new record in the storage.
     *
     * {@link CreateFunc}
     */
    readonly _create: CreateFunc<D>;

    /**
     * A function that saves an existing record to the storage.
     *
     * {@link UpdateFunc}
     */
    readonly _update: UpdateFunc<D>;

    /**
     * A function that deletes an exisiting record from the storage.
     *
     * {@link DestroyFunc}
     */
    readonly _destroy: DestroyFunc<D>;

    /**
     * A flag indicating that the mixin is creating a record in the storage.
     *
     * {@link SaveFlags.creating}
     */
    get creating() {
      return this._saveFlags.creating;
    }

    /**
     * A flag indicating that the mixin is updating a record in the storage.
     *
     * {@link SaveFlags.updating}
     */
    get updating() {
      return this._saveFlags.updating;
    }

    /**
     * A flag indicating that the mixin is deleting a record from the storage.
     *
     * {@link SaveFlags.destroying}
     */
    get destroying() {
      return this._saveFlags.destroying;
    }

    /**
     * A flag indicating that the mixin is saving a record to the storage.
     *
     * {@link SaveFlags.saving}
     */
    get saving() {
      return this._saveFlags.saving;
    }

    constructor(...args: any[]) {
      super(...args);

      const options = args.slice(3).find(arg => arg?.mixinType === 'save') as SaveOptions<D> | undefined;

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

    /**
     * Processes a storage response.
     *
     * This method applies an updated model data to the data object or applies a data identifier that is generated by the storage.
     *
     * @param resp - storage response
     */
    processSavedInstance(resp?: T | unknown): void {
      if (resp === undefined) return;
      else if (typeof resp === 'object') {
        this._internal.data = resp as D;
      } else {
        (this.data as Record<string, unknown>)[this._idKey] = resp; // due to https://github.com/microsoft/TypeScript/issues/31661
      }
    }

    /**
     * Synchronizes a model state with the storage.
     */
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
            savedInstance = await this._create(this.data);
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
            savedInstance = await this._update((this.data as Record<string, unknown>)[this._idKey], this.data);
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

    /**
     * Returns `true` if the model has a mixin.
     *
     * @param mixin - mixin function
     */
    hasMixin(mixin: Function): boolean {
      return mixin === mixSave || super.hasMixin(mixin);
    }
  };
}

/**
 * Returns a typed function that extends a model class with the save mixin.
 *
 * This function can be used my {@see mix} function.
 *
 * @returns mixin function
 */
export function mixSave<D extends object, T extends BaseModel<D>, C extends Constructor<D, T>>() {
  return (parent: C) => saveMixin<D, T, C>(parent);
}

/**
 * Returns a typed function that extends a model class with the save mixin.
 *
 * @returns mixin function
 */
export function mixSave2() {
  return <D extends object, T extends BaseModel<D>, C extends Constructor<D, T>>(parent: C) => saveMixin<D, T, C>(parent);
}
