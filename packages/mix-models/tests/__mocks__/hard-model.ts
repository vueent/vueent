import {
  Base,
  BaseModel,
  Pattern,
  ValidationBase,
  RollbackPrivate,
  mixRollback,
  Rollback,
  ValidatePrivate,
  Validate,
  mixValidate,
  mix,
  Options
} from '@vueent/mix-models';

import { phoneRegex } from './regular-expressions';

export interface Data {
  id: string;
  phones?: string[];
  credentials: Credentials;
  documents: Document[];
  items: Item[];
}

export interface Document {
  id: string;
  filename: string;
}

export interface Item {
  value: Value[];
}
export interface Value {
  val: string;
}

export interface Credentials {
  first: string;
  second: string;
  last: string;
}

export class DataModel extends BaseModel<Data> {}

export const validations: Pattern = {
  id: (v: string) => v.length > 0 || 'invalid id',
  phones: {
    $each: (v?: string) => (v !== undefined && phoneRegex.test(v)) || 'invalid phone',
    $self: (v: unknown) => (Array.isArray(v) && v.length > 0) || 'invalid phones'
  },
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
};

export interface PhonesValidation extends ValidationBase {
  readonly c: ValidationBase[];
}

export interface CredentialsValidation extends ValidationBase {
  readonly c: {
    first: ValidationBase;
    second: ValidationBase;
    last: ValidationBase;
  };
}

export interface DocumentsValidation extends ValidationBase {
  readonly c: DocumentValidation[];
}

export interface DocumentValidation extends ValidationBase {
  readonly c: {
    id: ValidationBase;
    filename: ValidationBase;
  };
}

export interface ValueValidation extends ValidationBase {
  readonly c: {
    val: ValidationBase;
  };
}

export interface ValuesValidation extends ValidationBase {
  readonly c: ValueValidation[];
}

export interface ItemValidation extends ValidationBase {
  readonly c: {
    value: ValuesValidation;
  };
}

export interface ItemsValidation extends ValidationBase {
  readonly c: ItemValidation[];
}

export interface Validations extends ValidationBase {
  readonly c: {
    id: ValidationBase;
    phones: PhonesValidation;
    credentials: CredentialsValidation;
    documents: DocumentsValidation;
    items: ItemsValidation;
  };
}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model<ModelOptions extends Options> extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model<ModelOptions extends Options> extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(),
  mixValidate<Data, typeof DataModel, Validations>(validations)
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

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
