import { WatchStopHandle, Ref, reactive, watch } from 'vue-demi';

/**
 * The interface provides a trivial type of mixin options.
 *
 * Each mixin extends this interface as needed.
 */
export interface Options {
  /**
   * A mixin type name.
   */
  mixinType: string;
}

/**
 * Reactive model flags.
 */
export interface ModelFlags {
  /**
   * The flag is set to `true` when the model data has been changed after saving of loading.
   */
  dirty: boolean;

  /**
   * The flag is set to `true` if the model has not been saved previously.
   */
  new: boolean;

  /**
   * The flag is set to `true` if the method {@link BaseModel.delete} has been called.
   */
  deleted: boolean;

  /**
   * The flag is set to `true` if the model data has been destroyed in storage.
   */
  destroyed: boolean;

  /**
   * This flag prevents the {@link ModelFlags.dirty} flag changes.
   */
  locked: boolean;
}

/**
 * The puclic interface of {@link BaseModel} class.
 */
export interface Base<T extends object> {
  /**
   * Unique model identifier.
   *
   * It is unique for each instance, regardless of the model class.
   */
  readonly uid: string;

  /**
   * The flag is set to `true` when the model data has been changed after saving of loading.
   *
   * {@link ModelFlags.dirty}.
   */
  readonly dirty: boolean;

  /**
   * The flag is set to `true` if the model has not been saved previously.
   *
   * {@link ModelFlags.new}.
   */
  readonly new: boolean;

  /**
   * The flag is set to `true` if the method {@link BaseModel.delete} has been called.
   *
   * {@link ModelFlags.deleted}.
   */
  readonly deleted: boolean;

  /**
   * The flag is set to `true` if the model data has been destroyed in storage.
   *
   * {@link ModelFlags.destroyed}.
   */
  readonly destroyed: boolean;

  /**
   * A model data object.
   */
  readonly data: T;

  /**
   * Is called before creating an instance in storage.
   */
  beforeCreate(): void;

  /**
   * Is called after creating an instance in storage.
   */
  afterCreate(): void;

  /**
   * Is called before saving an existing instance to storage.
   */
  beforeSave(): void;

  /**
   * Is called after saving an existing instance to storage.
   */
  afterSave(): void;

  /**
   * Is called before destroying the model.
   */
  beforeDestroy(): void;

  /**
   * Is called after destroying the model.
   */
  afterDestroy(): void;

  /**
   * Is called before rollback the model data.
   */
  beforeRollback(): void;

  /**
   * Is called after rollback the model data.
   */
  afterRollback(): void;

  /**
   * Marks a model as deleted.
   */
  delete(): void;

  /**
   * Destroys the model.
   *
   * The destroyed models should not be used, its data reactivity is lost.
   */
  destroy(): void;

  /**
   * Returns `true` if the model has a mixin.
   *
   * @param mixin - mixin function
   */
  hasMixin(mixin: Function): boolean;
}

/**
 * The unified model constructor function type.
 */
export type Constructor<D extends object, T extends BaseModel<D> = BaseModel<D>> = T extends BaseModel<D>
  ? new (...args: any[]) => T
  : never;

/**
 * Global uid counter.
 *
 * This counter provides a unique id for each model instance.
 */
let globalUidCounter = 0n;

const unmix = () => undefined;

/**
 * The abstract class of the base model.
 *
 * It contains a minimum number of required fields an methods.
 */
export abstract class BaseModel<T extends object> {
  /**
   * Unique model identifier.
   *
   * It is unique for each instance, regardless of the model class.
   */
  readonly uid: string;

  /**
   * Reactive model flags.
   */
  readonly _flags: ModelFlags;

  /**
   * A function that stops a data watcher.
   */
  readonly _stopBaseWatcher: WatchStopHandle;

  /**
   * A property name of the data which contains a store identifier.
   */
  readonly _idKey: string;
  readonly _internal: { data: T };

  /**
   * The flag is set to `true` when the model data has been changed after saving of loading.
   *
   * {@link Base.dirty}.
   */
  get dirty(): boolean {
    return this._flags.dirty;
  }

  /**
   * The flag is set to `true` if the model has not been saved previously.
   *
   * {@link Base.new}.
   */
  get new(): boolean {
    return this._flags.new;
  }

  /**
   * The flag is set to `true` if the method {@link BaseModel.delete} has been called.
   *
   * {@link Base.deleted}.
   */
  get deleted(): boolean {
    return this._flags.deleted;
  }

  /**
   * The flag is set to `true` if the model data has been destroyed in storage.
   *
   * {@link Base.destroyed}.
   */
  get destroyed(): boolean {
    return this._flags.destroyed;
  }

  /**
   * A model data object.
   */
  get data(): T {
    return this._internal.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(idKey: string, data: T | Ref<T>, react = true, ...options: any[]) {
    this.uid = String(++globalUidCounter);

    this._flags = reactive({
      dirty: false,
      new: true,
      deleted: false,
      destroyed: false,
      locked: false
    });

    this._idKey = idKey;
    this._internal = react ? reactive({ data: data as T }) : { data: data as T };

    this._stopBaseWatcher = watch(
      () => this._internal,
      () => {
        if (!this._flags.locked && !this._flags.dirty) this._flags.dirty = true;
      },
      { deep: true, flush: 'sync' }
    );
  }

  /**
   * Is called before creating an instance in storage.
   */
  beforeCreate(): void {
    // stub
  }

  /**
   * Is called after creating an instance in storage.
   */
  afterCreate(): void {
    // stub
  }

  /**
   * Is called before saving an existing instance to storage.
   */
  beforeSave(): void {
    // stub
  }

  /**
   * Is called after saving an existing instance to storage.
   */
  afterSave(): void {
    // stub
  }

  /**
   * Is called before deleting an existing instance from storage.
   */
  beforeDestroy(): void {
    // stub
  }

  /**
   * Is called after deleting an existing instance from storage.
   */
  afterDestroy(): void {
    // stub
  }

  /**
   * Is called before rollback the model data.
   */
  beforeRollback(): void {
    // stub
  }

  /**
   * Is called after rollback the model data.
   */
  afterRollback(): void {
    // stub
  }

  /**
   * Marks a model as deleted.
   */
  delete(): void {
    this._flags.deleted = true;
  }

  /**
   * Destroys the model.
   *
   * The destroyed models should not be used, its data reactivity is lost.
   */
  destroy(): void {
    this._stopBaseWatcher();
  }

  /**
   * Returns `true` if the model has a mixin.
   *
   * @param mixin - mixin function
   */
  hasMixin(mixin: Function): boolean {
    return mixin === unmix;
  }
}
