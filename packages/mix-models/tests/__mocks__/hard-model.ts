import { Base, BaseModel, PatternAssert, Rollback, Validate, Options, mixValidate, mixRollback } from '@vueent/mix-models';

import { Data as Credentials } from './credentials-model';

import { phoneRegex } from './regular-expressions';

export interface Data {
  id: string;
  phones?: string[];
  phone?: string;
  credentials: Credentials;
  documents?: Document[];
  items: Item[];
}

export interface Document {
  id: string;
  filename?: string;
}

export interface Item {
  value: Value[];
}
export interface Value {
  val: string;
}

export class DataModel extends BaseModel<Data> {}

export const validations = {
  id: (v: string) => v.length > 0 || 'invalid id',
  phones: {
    $each: (v?: string) => (v !== undefined && phoneRegex.test(v)) || 'invalid phone',
    $self: (v: unknown) => (Array.isArray(v) && v.length > 0) || 'invalid phones'
  },
  phone: (v?: string) => (v !== undefined && v.length > 0) || 'invalid id',
  credentials: {
    $sub: {
      first: (v: string) => v.length > 0 || 'invalid first name',
      second: (v: string) => v.length > 0 || 'invalid second name',
      last: (v: string) => v.length > 0 || 'invalid last name'
    }
  },
  documents: {
    $each: {
      id: (v: string) => v.length > 0 || 'invalid id',
      filename: (v: string) => v.length > 0 || 'invalid filename'
    }
  },
  items: {
    $each: {
      value: {
        $each: {
          val: (v: string) => v.length > 6 || 'invalid val'
        }
      }
    }
  }
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

class M<ModelOptions extends Options> extends mixRollback()(
  mixValidate<Validations>(validations)(class extends BaseModel<Data> {})
) {
  constructor(initialData?: Data, react = true, ...options: ModelOptions[]) {
    super(
      'id',
      initialData ?? { id: '', phones: [], credentials: { first: '', second: '', last: '' }, documents: [], items: [] },
      react,
      ...options
    );
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]) {
  return new M(basicData, react, ...options) as ModelType;
}
