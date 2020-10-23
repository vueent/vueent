import { Ref } from 'vue-demi';

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
  mix,
  Options,
  ValidateOptions
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

export interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model<ModelOptions extends Options> extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(),
  mixValidate<Data, typeof DataModel, Validations>(validations)
) {
  constructor(initialData?: Data | Ref<Data>, react = true, ...options: ModelOptions[]) {
    super('name', initialData ?? { name: '' }, react, ...options);
  }
}

export function create(basicData?: Data | Ref<Data>, react = true, validations?: ValidationBase): ModelType {
  const options: ValidateOptions[] = [];

  if (validations) options.push({ mixinType: 'validate', validations });

  return new Model(basicData, react, ...options);
}
