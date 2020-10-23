import {
  Base,
  BaseModel,
  Validate,
  ValidatePrivate,
  mixValidate,
  mix,
  Options,
  ValidationBase,
  ValidateOptions
} from '@vueent/mix-models';

export interface Data {
  name: string;
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Validate;

export interface Model<ModelOptions extends Options> extends DataModel, ValidatePrivate {}

export class Model<ModelOptions extends Options> extends mix<Data, typeof DataModel>(DataModel, mixValidate()) {
  constructor(initialData?: Data, react = true, ...options: ModelOptions[]) {
    super('', initialData ?? { name: '' }, react, ...options);
  }
}

export function create(basicData?: Data, react = true, validations?: ValidationBase): ModelType {
  const options: ValidateOptions[] = [];

  if (validations) options.push({ mixinType: 'validate', validations });

  return new Model(basicData, react, ...options);
}
