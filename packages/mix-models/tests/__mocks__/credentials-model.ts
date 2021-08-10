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
  Options
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

export interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model<ModelOptions extends Options> extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(),
  mixValidate(validations)
) {
  constructor(initialData?: Data, react = true, ...options: ModelOptions[]) {
    super('id', initialData ?? { first: '', second: '', last: '' }, react, ...options);
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
