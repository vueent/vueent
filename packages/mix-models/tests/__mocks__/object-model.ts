import {
  Base,
  BaseModel,
  Pattern,
  ValidationBase,
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
  id?: string;
  internalData?: Data;
}

export class DataModel extends BaseModel<Data> {}

export const rollbackMask = {
  id: true,
  internalData: true
};

export const validations: Pattern = {
  id: (v?: string) => (v !== undefined && v.length > 0) || 'invalid id'
};

validations.internalData = { $sub: validations };

export interface Validations extends ValidationBase {
  readonly c: {
    id: ValidationBase;
    internalData: Validations;
  };
}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model<ModelOptions extends Options> extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixValidate<Data, typeof DataModel, Validations>(validations)
) {
  constructor(initialData?: Data, react = true, ...options: ModelOptions[]) {
    super('id', initialData ?? { id: undefined, internalData: { id: '2', internalData: undefined } }, react, ...options);
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
