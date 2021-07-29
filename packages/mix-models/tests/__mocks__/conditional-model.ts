import get from 'lodash/get';
import { Base, BaseModel, Validate, ValidatePrivate, mixValidate, ValidationBase, mix } from '@vueent/mix-models';

import { nameRegex, emailRegex } from './regular-expressions';

export interface Data {
  name: string;
  email: string;
}

export const validations = {
  name: (v: string) => nameRegex.test(v) || 'invalid name',
  email: (v: string, data: unknown, path: string[]) =>
    !!get(data, [...path.slice(0, path.length - 1), 'name'].join('.')) || (v.length > 0 && emailRegex.test(v)) || 'invalid e-mail'
} as const;

export interface Validations extends ValidationBase {
  readonly c: {
    name: ValidationBase;
    email: ValidationBase;
  };
}

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Validate<Validations>;

export interface Model extends DataModel, ValidatePrivate<Validations> {}

export class Model extends mix<Data, DataModel, typeof DataModel>(DataModel, mixValidate(validations)) {
  constructor(initialData?: Data, react = true) {
    super('', initialData ?? { name: '', email: '' }, react);
  }
}

export function create(basicData?: Data, react = true) {
  return new Model(basicData, react) as ModelType;
}
