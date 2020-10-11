import { reactive, watch } from 'vue-demi';

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

  delete(): void;
}

export type Constructor<T extends object> = new (...args: any[]) => BaseModel<T>;

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
  constructor(idKey: string, data: T, react = true, ...options: any[]) {
    this.uid = String(++globalUidCounter);
    this._flags = reactive({
      dirty: false,
      new: true,
      deleted: false,
      destroyed: false,
      locked: false
    });
    this._idKey = idKey;
    this._internal = react ? (reactive({ data }) as { data: T }) : { data };

    watch(
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

  hasMixin(mixin: Function): boolean {
    return mixin === unmix;
  }
}
