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
} from '../../src';

export const emailRegex = /(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
export const phoneRegex = /^(([0-9]){10})$/;
export const nameRegex = /^[0-9a-zA-Z. \\-]+$/;

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
};

export const validations: Pattern = {
  id: (v: unknown) => v === undefined || typeof v === 'number' || 'invalid id',
  email: (v: string) => emailRegex.test(v) || 'invalid e-mail',
  human: {
    $sub: {
      firstName: (v: string) => nameRegex.test(v) || 'invalid first name',
      lastName: (v: string) => nameRegex.test(v) || 'invalid last name',
      patronymic: (v: string) => nameRegex.test(v) || 'invalid patronymic'
    },
    $self: (v: unknown) => v !== undefined || 'invalid human'
  },
  phones: {
    $each: {
      value: (v: string) => phoneRegex.test(v) || 'invalid phone'
    }
  }
};

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

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixValidate<Data, typeof DataModel, Validations>(validations)
) {
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

export function create(basicData?: Data, react = true, ...options: Options[]): ModelType {
  return new Model(basicData, react, ...options);
}
