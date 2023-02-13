import { Base, BaseModel, Constructor, CreateFunc, DestroyFunc, Options, SaveOptions, UpdateFunc } from '@vueent/mix-models';

import { AbstractCollection } from './abstract-collection';
import { Store } from './store';

export type GetModelDataType<T> = T extends BaseModel<infer Data> & Base<infer Data> ? Data : never;

export type CreateModelFunc<Data extends object, ModelType extends Base<Data>, ModelOptions extends Options = Options> = (
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

export interface CollectionOptions<
  Model extends BaseModel<Data> & ModelType,
  Data extends object = GetModelDataType<Model>,
  EncodedData = unknown,
  ModelType extends Base<Data> = Base<Data>
> extends Record<string, unknown> {
  /**
   * Model constructor.
   */
  readonly construct: Constructor<Data, Model>;
  /**
   * Single record loader.
   */
  readonly loadOneData?: LoadOneDataFunc<EncodedData>;
  /**
   * Multiple records loader.
   */
  readonly loadManyData?: LoadManyDataFunc<EncodedData>;
  /**
   * Record creator, which saves a record into the storage.
   */
  readonly createData?: CreateFunc<EncodedData>;
  /**
   * Record updator, which updates a record in the storage.
   */
  readonly updateData?: UpdateFunc<EncodedData>;
  /**
   * Record remover, which deletes a record from the storage.
   */
  readonly destroyData?: DestroyFunc<EncodedData>;
}

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
> = T extends Collection<Model, Data, EncodedData, ModelType, ModelOptions>
  ? new (options: CollectionOptions<Model, Data, EncodedData, ModelType>) => T
  : never;

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
  protected _store?: Store;
  protected readonly _instances: Set<ModelType>;
  protected readonly _trackedInstances: Map<string, ModelType>;
  protected readonly _applySaveMixinOptions: boolean;
  protected readonly _createModel: CreateModelFunc<Data, ModelType, ModelOptions>;
  protected readonly _loadOneData?: LoadOneDataFunc<EncodedData>;
  protected readonly _loadManyData?: LoadManyDataFunc<EncodedData>;
  protected readonly _create?: CreateFunc<Data>;
  protected readonly _update?: UpdateFunc<Data>;
  protected readonly _destroy?: DestroyFunc<Data>;
  protected readonly _react = true;

  /**
   *
   * @param options - collection options
   */
  constructor({
    construct,
    loadOneData,
    loadManyData,
    createData,
    updateData,
    destroyData
  }: CollectionOptions<Model, Data, EncodedData, ModelType>) {
    super();

    this._instances = new Set();
    this._trackedInstances = new Map();
    this._loadOneData = loadOneData;
    this._loadManyData = loadManyData;

    if (createData) {
      this._create = async (data: Data) => this.normalize((await createData(this.denormalize(data))) as EncodedData);
    }

    if (updateData) {
      this._update = async (pk: unknown, data: Data) =>
        this.normalize((await updateData(pk, this.denormalize(data))) as EncodedData);
    }

    if (destroyData) {
      this._destroy = (pk: unknown, data: Data) => destroyData(pk, this.denormalize(data));
    }

    const unload = this.unload.bind(this);
    const appendCreatedToInstances = this.appendCreatedToInstances.bind(this);

    const cl = class extends construct {
      afterDestroy(): void {
        super.afterDestroy();

        this.destroy();
        unload(this.uid, false);
      }

      afterCreate(): void {
        super.afterCreate();

        appendCreatedToInstances(this as unknown as ModelType);
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

        return new cl(initialData, this._react, ...options) as unknown as ModelType; // ToDo: fix type inference
      };
    } else {
      this._createModel = (initialData?: Data, options?: ModelOptions[]) =>
        new cl(initialData, this._react, ...(options ?? [])) as unknown as ModelType; // ToDo: fix type inference
    }
  }

  /**
   * Destroys a collection instance and all its local records.
   */
  public destroy() {
    this.unloadAll();
  }

  /**
   * Binds a store instance.
   *
   * @param store bound store
   */
  public setStore(store: Store) {
    this._store = store;
  }

  /**
   * Creates a model instance.
   *
   * @param initialData - initial instance data
   * @param options - model options
   * @returns record
   */
  public create(initialData?: Data, options?: ModelOptions[]): ModelType {
    const instance = this._createModel(initialData, options);

    if (!instance.new) {
      for (const inst of this._instances) {
        if (inst.pk === instance.pk) {
          instance.destroy();
          throw new Error('duplicate primary key');
        }
      }

      this._instances.add(instance);
    }

    this._trackedInstances.set(instance.uid, instance);

    return instance;
  }

  /**
   * Searches for a multiple records.
   *
   * This function scans a local cache if `reload` options is set to `false`.
   *
   * @param options - search options
   * @returns records list
   */
  public async find(options: FindOptions<Data> = { reload: true }): Promise<ModelType[]> {
    if (!options.reload) {
      const cached = this.peek(options);

      if (cached.length) return cached;
    }

    if (!this._loadManyData) return [];

    const loadedData = await this._loadManyData(options);
    const instances = [];

    if (options.localFilter) {
      // split cycles due to optimization
      for (const encoded of loadedData) {
        const data = this.normalize(encoded);

        if (!options.localFilter(data)) continue;

        const instance = this._createModel(data);

        this._trackedInstances.set(instance.uid, instance);
        instances.push(instance);
      }
    } else {
      for (const encoded of loadedData) {
        const data = this.normalize(encoded);
        const instance = this._createModel(data);

        this._trackedInstances.set(instance.uid, instance);
        instances.push(instance);
      }
    }

    for (const instance of instances) {
      for (const inst of this._instances) {
        if (inst.pk === instance.pk) {
          this._instances.delete(inst);
          break;
        }
      }

      this._instances.add(instance);
    }

    return instances;
  }

  /**
   * Searches for a single record.
   *
   * This function scans a local cache if `reload` options is set to `false`.
   *
   * @param pk - record primary key
   * @param options - search options
   * @returns record
   */
  public async findOne(pk: unknown, options: FindOptions<Data> = { reload: true }): Promise<ModelType | null> {
    if (!options.reload) {
      const cached = this.peekOne(pk);

      if (cached && (!options.localFilter || options.localFilter(cached.data))) return cached;
    }

    if (!this._loadOneData) return null;

    const loadedData = await this._loadOneData(pk);
    const data = this.normalize(loadedData);

    if (options.localFilter && !options.localFilter(data)) return null;

    const instance = this._createModel(data);

    for (const inst of this._instances) {
      if (inst.pk === instance.pk) {
        this._instances.delete(inst);
        break;
      }
    }

    this._instances.add(instance);
    this._trackedInstances.set(instance.uid, instance);

    return instance;
  }

  /**
   * Searches for a single record in a local cache.
   *
   * @param pk - record primary key
   * @param options - search options
   * @returns record
   */
  public peekOne(pk: unknown, options: PeekOptions<Data> = {}): ModelType | null {
    for (const instance of this._instances) {
      if (instance.pk === pk) {
        return !options.localFilter || options.localFilter(instance.data) ? instance : null;
      }
    }

    return null;
  }

  /**
   * Searches for some records in a local cache.
   *
   * @param options - search options
   * @returns records list
   */
  public peek(options: PeekOptions<Data> = {}): ModelType[] {
    const cached = [];

    for (const instance of this._instances) {
      if (!options.localFilter || options.localFilter(instance.data)) cached.push(instance);
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
    return { ...encoded } as unknown as Data;
  }

  /**
   * Converts an internal representation to the encoded.
   *
   * @param data - decoded data
   * @returns - encoded data
   */
  public denormalize(data: Data): EncodedData {
    return { ...(data as unknown as EncodedData) };
  }

  /**
   * Unloads an instance.
   *
   * @param uid - instance uid
   * @param callDestroy - call destroy method (do not use with parameter directly)
   */
  public unload(uid: string, callDestroy = true): void {
    const { _instances, _trackedInstances } = this;
    const trackedInstance = _trackedInstances.get(uid);

    if (trackedInstance) {
      if (callDestroy) trackedInstance.destroy();

      _trackedInstances.delete(uid);
    }

    for (const instance of _instances) {
      if (instance.uid === uid) {
        _instances.delete(instance);

        break;
      }
    }
  }

  /**
   * Unloads all instances.
   */
  public unloadAll(): void {
    for (const [, instance] of this._trackedInstances) instance.destroy();

    this._trackedInstances.clear();
    this._instances.clear();
  }

  protected appendCreatedToInstances(instance: ModelType): void {
    const { _instances } = this;

    for (const inst of _instances) {
      if (inst.pk === instance.pk) {
        this._instances.delete(inst);
        break;
      }
    }

    _instances.add(instance);
  }
}
