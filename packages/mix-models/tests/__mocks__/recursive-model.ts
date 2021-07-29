import { Base, BaseModel, Rollback, Validate, PatternAssert, rollbackMixin, validateMixin } from '@vueent/mix-models';
import { rollbackMask } from './deep-model';

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

export type Validations = PatternAssert<typeof validations, Data>;

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

class ValidateModel extends validateMixin<Data, DataModel, typeof DataModel, Validations>(DataModel, validations) {}
class RollbackModel extends rollbackMixin<Data, ValidateModel, typeof ValidateModel>(ValidateModel, rollbackMask) {}

export class Model extends RollbackModel {
  constructor(initialData?: Data, react = true) {
    super('name', initialData ?? { name: '', items: [] }, react);
  }
}

export function create(basicData?: Data, react = true): ModelType {
  return new Model(basicData, react);
}
