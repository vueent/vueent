import {
  Base,
  BaseModel,
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

import { phoneRegex } from './regular-expressions';

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
} as const;

export const validations = {
  id: (v?: string) => (v !== undefined && v.length > 0) || 'invalid id',
  phones: {
    $each: (v?: string) => (v !== undefined && phoneRegex.test(v)) || 'invalid phone',
    $self: (v: unknown) => (Array.isArray(v) && v.length > 0) || 'invalid phones'
  }
} as const;

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

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? { id: undefined, phones: [], items: [] }, react, ...options);
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
