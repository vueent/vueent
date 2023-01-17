import {
  Base,
  BaseModel,
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

import { emailRegex, nameRegex, phoneRegex } from './regular-expressions';

export interface Human {
  firstName: string;
  lastName: string;
  patronymic: string;
}

export interface Phone {
  value: string;
}

export interface Data {
  id?: number;
  email: string;
  human?: Human;
  phones?: Phone[];
}

export class DataModel extends BaseModel<Data> {}

export const rollbackMask = {
  id: true,
  email: true,
  human: true,
  phones: true
} as const;

export const validations = {
  id: (v: unknown) => v === undefined || typeof v === 'number' || 'invalid id',
  email: (v?: string) => (v !== undefined && v.length > 0 && emailRegex.test(v)) || 'invalid e-mail',
  human: {
    $sub: {
      firstName: (v?: string) => (v !== undefined && nameRegex.test(v)) || 'invalid first name',
      lastName: (v?: string) => (v !== undefined && nameRegex.test(v)) || 'invalid last name',
      patronymic: (v?: string) => (v !== undefined && nameRegex.test(v)) || 'invalid patronymic'
    },
    $self: (v: unknown) => v !== undefined || 'invalid human'
  },
  phones: {
    $each: {
      value: (v?: string) => (v !== undefined && phoneRegex.test(v)) || 'invalid phone'
    },
    $self: (v: unknown) => (Array.isArray(v) && v.length > 0) || 'invalid phones'
  }
} as const;

export interface HumanValidation extends ValidationBase {
  readonly c: {
    firstName: ValidationBase;
    lastName: ValidationBase;
    patronymic: ValidationBase;
  };
}

export interface PhoneValidation extends ValidationBase {
  readonly c: {
    value: ValidationBase;
  };
}

export interface PhonesValidation extends ValidationBase {
  readonly c: PhoneValidation[];
}

export interface Validations extends ValidationBase {
  readonly c: {
    id: ValidationBase;
    email: ValidationBase;
    human: HumanValidation;
    phones: PhonesValidation;
  };
}

export type ModelType = Base<Data> & Rollback & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super(
      'id',
      initialData ?? {
        id: undefined,
        email: '',
        human: undefined,
        phones: undefined
      },
      react,
      ...options
    );
  }
}

export function create<ModelOptions extends Options>(basicData?: Data, react = true, ...options: ModelOptions[]): ModelType {
  return new Model(basicData, react, ...options);
}
