import {
  Base,
  BaseModel,
  mix,
  mixRollback,
  mixSave,
  Options,
  Rollback,
  RollbackPrivate,
  Save,
  SavePrivate
} from '@vueent/mix-models';

import { AbstractColllection } from './abstract_collection';
import { Collection, CollectionConstructor, ModelWithOptions } from './collection';

export class Store {
  private _collections: Set<AbstractColllection>;

  constructor() {
    this._collections = new Set();
  }

  get<
    Data extends object,
    EncodedData,
    ModelType extends Base<Data>,
    ModelOptions extends Options,
    Model extends BaseModel<Data> & ModelType & ModelWithOptions<ModelOptions>,
    T extends Collection<Data, EncodedData, ModelType, ModelOptions, Model>
  >(collection: CollectionConstructor<Data, EncodedData, ModelType, ModelOptions, Model, T>): T | null {
    for (const coll of this._collections) {
      if (coll instanceof collection) return coll as T;
    }

    return null;
  }
}

type Data = {
  name: string;
  official: {
    first: string;
    last: string;
  };
};
type EncodedData = Data;

class DataModel extends BaseModel<Data> {}

type ModelType = Base<Data> & Rollback & Save;

interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, SavePrivate<Data> {}

class Model<ModelOptions extends Options> extends mix<Data, DataModel, typeof DataModel>(DataModel, mixRollback(), mixSave()) {
  constructor(initialData?: Data, ...options: ModelOptions[]) {
    super('name', initialData ?? { name: '', official: { first: '', last: '' } }, true, ...options);
  }
}

// class DataCollection extends Collection<Data, EncodedData, ModelType, Model<infer ModelOptions>
