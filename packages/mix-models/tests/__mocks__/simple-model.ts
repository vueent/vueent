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

export interface Data {
  name: string;
}

export const validations = {
  name: (v: any) => ((v as string).length > 0 && (v as string).length < 255 ? true : 'Unexpected name length')
};

export interface Validations extends ValidationBase {
  readonly c: {
    name: ValidationBase;
  };
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(),
  mixValidate<Data, typeof DataModel, Validations>(validations)
) {
  constructor(initialData?: Data, react = true) {
    super('name', initialData ?? { name: '' }, react);
  }
}

export function create(basicData?: Data, react = true): ModelType {
  return new Model(basicData, react);
}
