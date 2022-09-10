import { Base, BaseModel, Constructor, CreateFunc, DestroyFunc, Options, SaveOptions, UpdateFunc } from '@vueent/mix-models';

import { AbstractColllection } from './abstract_collection';

export type CreateModelFunc<Data extends object, ModelOptions extends Options, ModelType extends Base<Data>> = (
  initialData?: Data,
  options?: ModelOptions[]
) => ModelType;

export type LoadManyDataFunc<EncodedData, LoadOptions extends Record<string, unknown> = Record<string, unknown>> = (
  options: LoadOptions
) => Promise<EncodedData[]> | EncodedData[];

export type LoadOneDataFunc<EncodedData> = (pk: unknown) => Promise<EncodedData> | EncodedData;

export type ModelWithOptions<O extends Options> = unknown;

export type PeekOptions<Data> = {
  localFilter?: (data: Data) => boolean;
};

export type FindOptions<Data> = PeekOptions<Data> & {
  reload?: boolean;
  params?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
} & Record<string, unknown>;

export type CollectionConstructor<
  Data extends object,
  EncodedData,
  ModelType extends Base<Data>,
  ModelOptions extends Options,
  Model extends BaseModel<Data> & ModelType & ModelWithOptions<ModelOptions>,
  T extends Collection<Data, EncodedData, ModelType, ModelOptions, Model> = Collection<
    Data,
    EncodedData,
    ModelType,
    ModelOptions,
    Model
  >
> = T extends Collection<Data, EncodedData, ModelType, ModelOptions, Model>
  ? new (
      construct: Constructor<Data, Model>,
      loadOneData?: LoadOneDataFunc<EncodedData>,
      loadManyData?: LoadManyDataFunc<EncodedData>,
      createData?: CreateFunc<EncodedData>,
      updateData?: UpdateFunc<EncodedData>,
      destroyData?: DestroyFunc<EncodedData>
    ) => T
  : never;

/**
 * Collection class unites a model data, and its convertions.
 */
export class Collection<
  Data extends object,
  EncodedData,
  ModelType extends Base<Data>,
  ModelOptions extends Options,
  Model extends BaseModel<Data> & ModelType & ModelWithOptions<ModelOptions>
> extends AbstractColllection {
  private readonly _createModel: CreateModelFunc<Data, ModelOptions, ModelType>;
  private readonly _instances: ModelType[];
  private readonly _loadOneData?: LoadOneDataFunc<EncodedData>;
  private readonly _loadManyData?: LoadManyDataFunc<EncodedData>;
  private readonly _createData?: CreateFunc<Data>;
  private readonly _updateData?: UpdateFunc<Data>;
  private readonly _destroyData?: DestroyFunc<Data>;
  private readonly _applySaveMixinOptions: boolean;

  constructor(
    construct: Constructor<Data, Model>,
    loadOneData?: LoadOneDataFunc<EncodedData>,
    loadManyData?: LoadManyDataFunc<EncodedData>,
    createData?: CreateFunc<EncodedData>,
    updateData?: UpdateFunc<EncodedData>,
    destroyData?: DestroyFunc<EncodedData>
  ) {
    super();

    this._instances = [];
    this._loadOneData = loadOneData;
    this._loadManyData = loadManyData;

    if (createData)
      this._createData = async (data: Data) => this.normalize((await createData(this.denormalize(data))) as EncodedData);

    if (updateData)
      this._updateData = async (pk: unknown, data: Data) =>
        this.normalize((await updateData(pk, this.denormalize(data))) as EncodedData);

    if (destroyData) this._destroyData = (pk: unknown, data: Data) => destroyData(pk, this.denormalize(data));

    const unloadRecord = this.unloadRecord.bind(this);

    const cl = class extends construct {
      afterDestroy(): void {
        super.afterDestroy();

        this.destroy();
        unloadRecord(this.uid, false);
      }
    };

    this._applySaveMixinOptions = Boolean(createData || updateData || destroyData);

    if (this._applySaveMixinOptions) {
      this._createModel = (initialData?: Data, options?: ModelOptions[]) => {
        if (!options) options = [];

        (options as SaveOptions<Data>[]).push({
          mixinType: 'save',
          create: this._createData,
          update: this._updateData,
          destroy: this._destroyData
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
   * @returns decoded data
   */
  public normalize(encoded: EncodedData): Data {
    return (encoded as unknown) as Data;
  }

  public denormalize(data: Data): EncodedData {
    return (data as unknown) as EncodedData;
  }

  public unloadRecord(uid: string, callDestroy = true) {
    for (let i = 0; i < this._instances.length; ++i) {
      const inst = this._instances[i];

      if (inst.uid === uid) {
        if (callDestroy) inst.destroy();

        this._instances.splice(i, 1);

        break;
      }
    }
  }
}
