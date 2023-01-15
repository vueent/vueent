import {
  Base,
  BaseModel,
  PatternAssert,
  RollbackPrivate,
  mixRollback,
  Rollback,
  ValidatePrivate,
  Validate,
  mixValidate,
  mix,
  Options,
  mixSave
} from '@vueent/mix-models';

export interface Data {
  first: string;
  second: string;
  last: string;
}

export class DataModel extends BaseModel<Data> {}

export const validations = {
  first: (v: string) => v.length > 0 || 'invalid first name',
  second: (v: string) => v.length > 0 || 'invalid second name',
  last: (v: string) => v.length > 0 || 'invalid last name'
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, DataModel, typeof DataModel>(DataModel, mixSave(), mixRollback(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? { first: '', second: '', last: '' }, react, ...options);
  }
}

export function create(basicData?: Data, react = true, ...options: Options[]): ModelType {
  return new Model(basicData, react, ...options);
}
