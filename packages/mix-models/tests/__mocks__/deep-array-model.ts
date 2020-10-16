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
} from '../../src';

import { phoneRegex } from './deep-model';

export interface Data {
  id?: string;
  phones: {
    number: { tel: string }[];
    name: string;
  }[];
  items: Array<{ sub: { my: { values: number[] } } }>;
}

export class DataModel extends BaseModel<Data> {}

export const rollbackMask = {
  id: true,
  phones: { $array: true, number: true }
};

export const validations: Pattern = {
  id: (v?: string) => (v !== undefined && v.length > 0) || 'invalid id',
  phones: {
    $each: (v?: string) => (v !== undefined && phoneRegex.test(v)) || 'invalid phone',
    $self: (v: unknown) => (Array.isArray(v) && v.length > 0) || 'invalid phones'
  }
};

export interface PhonesValidation extends ValidationBase {
  readonly c: ValidationBase[];
}

export interface Validations extends ValidationBase {
  readonly c: {
    id: ValidationBase;
    phones: PhonesValidation;
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
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
