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
  items: Data[];
}

type ValidationsPattern = {
  name: (v: any) => boolean | string;
  items: {
    $each: ValidationsPattern;
  };
};

export const validations = {
  name: (v: any) => ((v as string).length > 0 && (v as string).length < 255 ? true : 'Unexpected name length')
} as ValidationsPattern;

validations.items = { $each: validations };

export interface ItemsValidations {
  readonly c: Validations[];
}

export interface ChildrenValidations {
  name: ValidationBase;
  items: ItemsValidations;
}

export interface Validations extends ValidationBase {
  readonly c: ChildrenValidations;
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, DataModel, typeof DataModel>(DataModel, mixRollback(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true) {
    super('name', initialData ?? { name: '', items: [] }, react);
  }
}

export function create(basicData?: Data, react = true): ModelType {
  return new Model(basicData, react);
}
