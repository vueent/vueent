import { WatchStopHandle, Ref, reactive, watch } from 'vue-demi';

export interface Options {
  mixinType: string;
}

export interface ModelFlags {
  dirty: boolean;
  new: boolean;
  deleted: boolean;
  destroyed: boolean;
  locked: boolean;
}

export interface Base<T extends object> {
  readonly uid: string;
  readonly dirty: boolean;
  readonly new: boolean;
  readonly deleted: boolean;
  readonly destroyed: boolean;
  readonly data: T;

  beforeCreate(): void;
  afterCreate(): void;
  beforeSave(): void;
  afterSave(): void;
  beforeDestroy(): void;
  afterDestroy(): void;
  beforeRollback(): void;
  afterRollback(): void;
  delete(): void;
  destroy(): void;
  hasMixin(mixin: Function): boolean;
}

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

export abstract class BaseModel<T extends object> {
  readonly uid: string;

  readonly _flags: ModelFlags;
  readonly _stopBaseWatcher: WatchStopHandle;
  readonly _idKey: string;
  readonly _internal: { data: T };

  get dirty(): boolean {
    return this._flags.dirty;
  }

  get new(): boolean {
    return this._flags.new;
  }

  get deleted(): boolean {
    return this._flags.deleted;
  }

  get destroyed(): boolean {
    return this._flags.destroyed;
  }

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

  beforeCreate(): void {
    // stub
  }

  afterCreate(): void {
    // stub
  }

  beforeSave(): void {
    // stub
  }

  afterSave(): void {
    // stub
  }

  beforeDestroy(): void {
    // stub
  }

  afterDestroy(): void {
    // stub
  }

  beforeRollback(): void {
    // stub
  }

  afterRollback(): void {
    // stub
  }

  delete(): void {
    this._flags.deleted = true;
  }

  destroy(): void {
    this._stopBaseWatcher();
  }

  hasMixin(mixin: Function): boolean {
    return mixin === unmix;
  }
}
