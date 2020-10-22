import { Base, BaseModel, Validate, ValidatePrivate, Pattern, mixValidate, mix } from '@vueent/mix-models';

export interface Data {
  name: string;
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Validate;

export interface Model extends DataModel, ValidatePrivate {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixValidate((42 as unknown) as Pattern)) {
  constructor(initialData?: Data, react = true) {
    super('', initialData ?? { name: '' }, react);
  }
}

export function create(basicData?: Data, react = true): ModelType {
  return new Model(basicData, react);
}
