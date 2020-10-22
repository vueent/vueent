import {
  BaseModel,
  Rollback,
  RollbackPrivate,
  Save,
  SavePrivate,
  mixRollback,
  mixSave,
  SaveOptions,
  mix,
  Base
} from '@vueent/mix-models';

export interface Data {
  name: string;
  official: {
    first: string;
    last: string;
  };
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Save;

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data> {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(), mixSave()) {
  constructor(initialData?: Data, react = true, saveOptions?: SaveOptions<Data>) {
    super('name', initialData ?? { name: '', official: { first: '', last: '' } }, react, saveOptions);
  }
}

export function create(basicData?: Data, react = true, saveOptions?: SaveOptions<Data>): ModelType {
  return new Model(basicData, react, saveOptions);
}
