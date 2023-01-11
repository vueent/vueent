import { Base, BaseModel, Constructor, CreateFunc, DestroyFunc, Options, SaveOptions, UpdateFunc } from '@vueent/mix-models';

import { AbstractCollection } from './abstract-collection';

export type GetModelDataType<T> = T extends BaseModel<infer Data> & Base<infer Data> ? Data : never;

export type CreateModelFunc<Data extends object, ModelOptions extends Options, ModelType extends Base<Data>> = (
  initialData?: Data,
  options?: ModelOptions[]
) => ModelType;

export type LoadManyDataFunc<EncodedData, LoadOptions extends Record<string, unknown> = Record<string, unknown>> = (
  options: LoadOptions
) => Promise<EncodedData[]> | EncodedData[];

export type LoadOneDataFunc<EncodedData> = (pk: unknown) => Promise<EncodedData> | EncodedData;

export type PeekOptions<Data> = {
  localFilter?: (data: Data) => boolean;
};

export type FindOptions<Data> = PeekOptions<Data> & {
  reload?: boolean;
  params?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
} & Record<string, unknown>;

export type CollectionConstructor<
  Model extends BaseModel<Data> & ModelType,
  Data extends object = GetModelDataType<Model>,
  EncodedData = unknown,
  ModelType extends Base<Data> = Base<Data>,
  ModelOptions extends Options = Options,
  T extends Collection<Model, Data, EncodedData, ModelType, ModelOptions> = Collection<
    Model,
    Data,
    EncodedData,
    ModelType,
    ModelOptions
  >
> = T extends Collection<Model, Data, EncodedData, ModelType, ModelOptions> ? new (...args: any[]) => T : never;

/**
 * Collection class unites a model data, and its convertions.
 */
export abstract class Collection<
  Model extends BaseModel<Data> & ModelType,
  Data extends object = GetModelDataType<Model>,
  EncodedData = unknown,
  ModelType extends Base<Data> = Base<Data>,
  ModelOptions extends Options = Options
> extends AbstractCollection {
  protected readonly _instances: ModelType[];
  protected readonly _applySaveMixinOptions: boolean;
  protected readonly _createModel: CreateModelFunc<Data, ModelOptions, ModelType>;
  protected readonly _loadOneData?: LoadOneDataFunc<EncodedData>;
  protected readonly _loadManyData?: LoadManyDataFunc<EncodedData>;
  protected readonly _create?: CreateFunc<Data>;
  protected readonly _update?: UpdateFunc<Data>;
  protected readonly _destroy?: DestroyFunc<Data>;

  constructor({
    construct,
    loadOneData,
    loadManyData,
    createData,
    updateData,
    destroyData
  }: {
    readonly construct: Constructor<Data, Model>;
    readonly loadOneData?: LoadOneDataFunc<EncodedData>;
    readonly loadManyData?: LoadManyDataFunc<EncodedData>;
    readonly createData?: CreateFunc<EncodedData>;
    readonly updateData?: UpdateFunc<EncodedData>;
    readonly destroyData?: DestroyFunc<EncodedData>;
  }) {
    super();

    this._instances = [];
    this._loadOneData = loadOneData;
    this._loadManyData = loadManyData;

    if (createData)
      this._create = async (data: Data) => this.normalize((await createData(this.denormalize(data))) as EncodedData);

    if (updateData)
      this._update = async (pk: unknown, data: Data) =>
        this.normalize((await updateData(pk, this.denormalize(data))) as EncodedData);

    if (destroyData) this._destroy = (pk: unknown, data: Data) => destroyData(pk, this.denormalize(data));

    const unload = this.unload.bind(this);

    const cl = class extends construct {
      afterDestroy(): void {
        super.afterDestroy();

        this.destroy();
        unload(this.uid, false);
      }
    };

    this._applySaveMixinOptions = Boolean(createData || updateData || destroyData);

    if (this._applySaveMixinOptions) {
      this._createModel = (initialData?: Data, options?: ModelOptions[]) => {
        if (!options) options = [];

        (options as SaveOptions<Data>[]).push({
          mixinType: 'save',
          create: this._create,
          update: this._update,
          destroy: this._destroy
        });

        return (new cl(initialData, ...options) as unknown) as ModelType; // ToDo: fix type inference
      };
    } else {
      this._createModel = (initialData?: Data, options?: ModelOptions[]) =>
        (new cl(initialData, ...(options ?? [])) as unknown) as ModelType; // ToDo: fix type inference
    }
  }

  public create(initialData?: Data, options?: ModelOptions[]): ModelType {
    const instance = this._createModel(initialData, options);

    if (!instance.new) {
      for (const inst of this._instances) {
        if (inst.pk === instance.pk) throw new Error('duplicate primary key');
      }
    }

    this._instances.push(instance);

    return instance;
  }

  public async find(options: FindOptions<Data> = { reload: true }): Promise<ModelType[]> {
    if (!options.reload) {
      const cached = this.peek(options);

      if (cached.length) return cached;
    }

    if (!this._loadManyData) return [];

    const loadedData = await this._loadManyData(options);
    const instances = [];

    if (options.localFilter) {
      for (const encoded of loadedData) {
        const data = this.normalize(encoded);

        if (!options.localFilter(data)) continue;

        const instance = this._createModel(data);

        this._instances.push(instance); // ToDo: check for duplicates.
        instances.push(instance);
      }
    } else {
      for (const encoded of loadedData) {
        const data = this.normalize(encoded);
        const instance = this._createModel(data);

        this._instances.push(instance); // ToDo: check for duplicates.
        instances.push(instance);
      }
    }

    return instances;
  }

  public async findOne(pk: unknown, options: FindOptions<Data> = { reload: true }): Promise<ModelType | null> {
    if (!options.reload) {
      const cached = this.peekOne(pk);

      if (cached && (!options.localFilter || options.localFilter(cached.data))) return cached;
    }

    if (!this._loadOneData) return null;

    const loadedData = await this._loadOneData(pk);
    const data = this.normalize(loadedData);

    if (options.localFilter) {
      if (!options.localFilter(data)) return null;
    }

    const instance = this._createModel(data);

    this._instances.push(instance);

    return instance;
  }

  public peekOne(pk: unknown, options: PeekOptions<Data> = {}): ModelType | null {
    for (const inst of this._instances) {
      if (inst.pk === pk && (!options.localFilter || options.localFilter(inst.data))) return inst;
    }

    return null;
  }

  public peek(options: PeekOptions<Data> = {}): ModelType[] {
    if (!options.localFilter) return this._instances.slice();

    const cached = [];

    for (const inst of this._instances) {
      if (options.localFilter(inst.data)) cached.push(inst);
    }

    return cached;
  }

  /**
   * Converts an encoded data to internal.
   *
   * @param encoded - encoded data
   * @returns - decoded data
   */
  public normalize(encoded: EncodedData): Data {
    return (encoded as unknown) as Data;
  }

  /**
   * Converts an internal representation to the encoded.
   *
   * @param data - decoded data
   * @returns - encoded data
   */
  public denormalize(data: Data): EncodedData {
    return (data as unknown) as EncodedData;
  }

  /**
   * Unloads an instance.
   *
   * @param uid - instance uid
   * @param callDestroy - call destroy method (do not use with parameter directly)
   */
  public unload(uid: string, callDestroy = true): void {
    const { _instances } = this;

    for (let i = 0; i < _instances.length; ++i) {
      const inst = _instances[i];

      if (inst.uid === uid) {
        if (callDestroy) inst.destroy();

        _instances.splice(i, 1);

        break;
      }
    }
  }

  /**
   * Unloads all instances.
   */
  public unloadAll(): void {
    const { _instances } = this;

    for (const inst of _instances) inst.destroy();

    _instances.splice(0, _instances.length);
  }
}