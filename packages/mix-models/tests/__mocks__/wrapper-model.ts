import {
  Base,
  BaseModel,
  Rollback,
  RollbackPrivate,
  mixRollback,
  Validate,
  ValidatePrivate,
  mixValidate,
  ValidationBase,
  mix
} from '@vueent/mix-models';

import { Data as Child, validations as childValidations, Validations as ChildValidations } from './simple-model';

export interface Data {
  id: number;
  child: Child;
}

export const validations = {
  child: {
    $sub: childValidations
  }
} as const;

export interface Validations extends ValidationBase {
  readonly c: {
    child: ChildValidations;
  };
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, DataModel, typeof DataModel>(DataModel, mixRollback(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true) {
    super('id', initialData ?? { id: 0, child: { name: '' } }, react);
  }
}

export function create(basicData?: Data, react = true): ModelType {
  return new Model(basicData, react);
}
