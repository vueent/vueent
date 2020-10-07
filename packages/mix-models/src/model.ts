import { reactive, watch } from 'vue-demi';

export interface ModelFlags {
  dirty: boolean;
  new: boolean;
  deleted: boolean;
  destroyed: boolean;
  locked: boolean;
}

export interface Base<T extends object> {
  readonly dirty: boolean;
  readonly new: boolean;
  readonly deleted: boolean;
  readonly destroyed: boolean;
  readonly data: T;

  delete: () => void;
}

export type Constructor<T extends object> = new (...args: any[]) => BaseModel<T>;

const unmix = () => undefined;

export abstract class BaseModel<T extends object> {
  readonly flags: ModelFlags;
  readonly idKey: string;
  readonly internal: { data: T };

  get dirty(): boolean {
    return this.flags.dirty;
  }

  get new(): boolean {
    return this.flags.new;
  }

  get deleted(): boolean {
    return this.flags.deleted;
  }

  get destroyed(): boolean {
    return this.flags.destroyed;
  }

  get data(): T {
    return this.internal.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(idKey: string, data: T, react = true, ...options: any[]) {
    this.flags = reactive({
      dirty: false,
      new: true,
      deleted: false,
      destroyed: false,
      locked: false
    });
    this.idKey = idKey;
    this.internal = react ? (reactive({ data }) as { data: T }) : { data };

    watch(
      () => this.internal,
      () => {
        if (this.flags.locked) this.flags.locked = false;
        else if (!this.flags.dirty) this.flags.dirty = true;
      },
      { deep: true }
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
    this.flags.deleted = true;
  }

  hasMixin(mixin: Function): boolean {
    return mixin === unmix;
  }
}
