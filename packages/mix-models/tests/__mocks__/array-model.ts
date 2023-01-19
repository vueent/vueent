import { Base, BaseModel, ValidationBase, Rollback, Validate, Options, validateMixin, rollbackMixin } from '@vueent/mix-models';

import { phoneRegex } from './regular-expressions';

export interface Data {
  id?: string;
  phones?: string[];
}

export class DataModel extends BaseModel<Data> {}

export const rollbackMask = {
  id: true,
  phones: true
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

// export interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

class RollbackModel extends rollbackMixin<Data, typeof DataModel>(DataModel, rollbackMask) {}
class ValidateModel extends validateMixin<Data, typeof RollbackModel, Validations>(RollbackModel, validations) {}

export class Model extends ValidateModel {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? { id: undefined, phones: undefined }, react, ...options);
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
