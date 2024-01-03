import {
  type Base,
  BaseModel,
  type PatternAssert,
  type Validate,
  type ValidatePrivate,
  mixValidate,
  mix,
  type Options,
  type Rollback,
  type RollbackPrivate,
  mixRollback,
  type Save,
  type SavePrivate,
  mixSave
  // type ValidationBase
} from '@vueent/mix-models';

export interface Data {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{ value: string }>;
}

export function makeInitialData(): Data {
  return {
    id: 0,
    age: 0,
    credentials: {
      firstName: '',
      lastName: ''
    },
    phones: []
  };
}

const age = (value: any) => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const firstName = (value: any) => {
  if (typeof value !== 'string') return 'First name must be a string.';
  else if (!value.length) return 'Enter first name.';
  else if (value.length > 255) return 'First name length exceeds 255 characters.';
  else return true;
};

const lastName = (value: any) => {
  if (typeof value !== 'string') return 'Last name must be a string.';
  else if (!value.length) return 'Enter last name.';
  else if (value.length > 255) return 'last name length exceeds 255 characters.';
  else return true;
};

const phone = (value: any) => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

const rollbackMask = {
  age: true,
  credentials: true,
  phones: true
} as const;

const validations = {
  age,
  credentials: {
    $sub: {
      firstName,
      lastName
    },
    $self: (v: any) => v !== undefined || 'Invalid credentials.'
  },
  phones: {
    $each: {
      value: phone
    },
    $self: (v: any) => (Array.isArray(v) && v.length > 0) || 'No enough phone numbers.'
  }
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

// interface CredentialsValidations extends ValidationBase {
//   readonly c: {
//     firstName: ValidationBase;
//     lastName: ValidationBase;
//   };
// }

// interface PhoneValidations extends ValidationBase {
//   readonly c: {
//     value: ValidationBase;
//   };
// }

// interface PhonesValidations extends ValidationBase {
//   readonly c: PhoneValidations[];
// }

// export interface Validations extends ValidationBase {
//   readonly c: {
//     age: ValidationBase;
//     credentials: CredentialsValidations;
//     phones: PhonesValidations;
//   };
// }

export class DataModel extends BaseModel<Data> {}

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixSave(),
  mixValidate(validations)
) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

export function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
