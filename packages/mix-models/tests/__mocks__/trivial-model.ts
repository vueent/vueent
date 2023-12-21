import type {
  Base,
  Options,
  PatternAssert,
  Rollback,
  RollbackPrivate,
  Save,
  SavePrivate,
  Validate,
  ValidatePrivate
} from '@vueent/mix-models';
import { BaseModel, mix, mixRollback, mixSave, mixValidate } from '@vueent/mix-models';

export interface Data {
  id: number;
  age: string;
  name: string;
  desc?: string;
}

export interface EncodedData {
  id: number;
  age: number;
  name: string;
  desc?: string;
}

export function makeInitialData(): Data {
  return {
    id: 0,
    age: '',
    name: '',
    desc: undefined
  };
}

export const rollbackMask = { id: false, age: true, name: true, desc: true } as const;

export const validations = {
  age: (v: string) => {
    if (!v.length) return 'invalid age';

    const n = Number(v);

    return (!Number.isNaN(n) && Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n < 200) || 'invalid age';
  },
  name: (v: string) => (v.length > 0 && v.length < 255) || 'invalid name',
  desc: (v: string | undefined) => v === undefined || (v.length > 0 && v.length < 255) || 'invalid desc'
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

class DataModel extends BaseModel<Data> {}

export interface Model extends DataModel, SavePrivate<Data>, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixSave(),
  mixRollback(rollbackMask),
  mixValidate<Validations>(validations)
) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);

    if (initialData?.id && initialData.id > 0) this._flags.new = false; // reset the `new` flag
  }
}

export type ModelType = Base<Data> & Save & Rollback & Validate<Validations>;

export function create(initialData?: Data, react = true, ...options: Options[]): ModelType {
  return new Model(initialData, react, ...options);
}

export function normalize(encoded: EncodedData): Data {
  return {
    id: encoded.id,
    age: String(encoded.age),
    name: encoded.name,
    desc: encoded.desc
  };
}

export function denormalize(data: Data): EncodedData {
  return {
    id: data.id,
    age: Number(data.age),
    name: data.name,
    desc: data.desc
  };
}
