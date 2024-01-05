# Validate mixin

The `validate` mixin appends a reactive validation to the model data. It allows to dynamically validate data fields and provides validation error messages.

## Validation pattern

A validation pattern consists of two parts: a constant object with validation rules and a type of generated model validation property.

### Validation rule

Validation rule is a function that receives several parameters, including a value of the model data field, and returns a boolean result or an error message:

```ts
/**
 * A function type that checks a value from the data path and returns a result.
 *
 * @param value - checking data field
 * @param data - model data
 * @param path - field path
 * @returns - validation result
 */
type ValidationRule = (value: any, data: unknown, path: string[]) => boolean | string;
```

For example, let's write an age validation rule:

<code-group>
<code-block title="TS">

```ts
const age = (value: any) => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};
```

</code-block>
<code-block title="JS">

```js
const age = value => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};
```

</code-block>
</code-group>

### Validation rules object

Rules should be placed into an object corresponding to the model data:

<code-group>
<code-block title="TS">

```ts
interface Data {
  id: number;
  age: number;
  name: string;
}

const age = (value: any) => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const name = (value: any) => {
  if (typeof value !== 'string') return 'Name must be a string.';
  else if (!value.length) return 'Enter the name.';
  else if (value.length > 255) return 'The name length exceeds 255 characters.';
  else return true;
};

/**
 * Validation rules.
 */
const validations = {
  age,
  name
} as const;
```

</code-block>
<code-block title="JS">

```js
/**
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {string} name
 */

const age = value => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const name = value => {
  if (typeof value !== 'string') return 'Name must be a string.';
  else if (!value.length) return 'Enter the name.';
  else if (value.length > 255) return 'The name length exceeds 255 characters.';
  else return true;
};

/**
 * Validation rules.
 */
const validations = {
  age,
  name
};
```

</code-block>
</code-group>

Rules of internal objects and arrays may be declared using `$sub`, `$each`, and `$self` reserved words.

- `$sub` defines a rules set of the internal object fields
- `$each` defines a rules set of each item of the internal array
- `$self` defines a rule of the entire object or array

<code-group>
<code-block title="TS">

```ts
interface Data {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{
    value: string; // each phone must be placed into a separate object due to Vue's reactivity limitations
  }>;
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
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
  else return true;
};

const phone = (value: any) => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

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
```

</code-block>
<code-block title="JS">

```js
/**
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {{ firstName: string; lastName: string }} credentials
 * @property {Array<{ value: string }>} phones // each phone must be placed into a separate object due to Vue's reactivity limitations
 */

const age = value => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const firstName = value => {
  if (typeof value !== 'string') return 'First name must be a string.';
  else if (!value.length) return 'Enter first name.';
  else if (value.length > 255) return 'First name length exceeds 255 characters.';
  else return true;
};

const lastName = value => {
  if (typeof value !== 'string') return 'Last name must be a string.';
  else if (!value.length) return 'Enter last name.';
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
  else return true;
};

const phone = value => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

const validations = {
  age,child: ChildValidations;
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
};
```

</code-block>
</code-group>

### Validation property type

A validation property type provides a type helper corresponding to the model data type. This type can be defined manually (e.g. for recursive types) and calculated automatically using `PatternAssert`.

The manual definition must be based on `ValidationBase` type:

```ts
import type { ValidationBase } from '@vueent/mix-models';

// ... definitions of the `Data` type and the `validations` object.

interface CredentialsValidations extends ValidationBase {
  readonly c: {
    firstName: ValidationBase;
    lastName: ValidationBase;
  };
}

interface PhoneValidations extends ValidationBase {
  readonly c: {
    value: ValidationBase;
  };
}

interface PhonesValidations extends ValidationBase {
  readonly c: PhoneValidations[];
}

interface Validations extends ValidationBase {
  readonly c: {
    age: ValidationBase;
    credentials: CredentialsValidations;
    phones: PhonesValidations;
  };
}
```

The calculated definifion uses a model data type and a validation rules object:

```ts
import type { PatternAssert } from '@vueent/mix-models';

// ... definitions of the `Data` type and the `validations` object.

type Validations = PatternAssert<typeof validations, Data>;
```

The two definitions above are equal.

## Model definition

The mixin provides a factory function that returns a mixin function. The following example presents a typical use of the `validate` mixin:

<code-group>
<code-block title="TS">

```ts
import {
  type Base,
  BaseModel,
  type PatternAssert,
  type Validate,
  type ValidatePrivate,
  mixValidate,
  mix,
  type Options
} from '@vueent/mix-models';

interface Data {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{ value: string }>;
}

function makeInitialData(): Data {
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
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
  else return true;
};

const phone = (value: any) => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

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

type Validations = PatternAssert<typeof validations, Data>;

class DataModel extends BaseModel<Data> {}

interface Model extends DataModel, ValidatePrivate<Validations> {}

class Model extends mix<Data, typeof DataModel>(DataModel, mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

type ModelType = Base<Data> & Validate<Validations>;

function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
```

</code-block>

<code-block title="JS">

```js
import { BaseModel, mixValidate, mix } from '@vueent/mix-models';

function makeInitialData() {
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

const age = value => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const firstName = value => {
  if (typeof value !== 'string') return 'First name must be a string.';
  else if (!value.length) return 'Enter first name.';
  else if (value.length > 255) return 'First name length exceeds 255 characters.';
  else return true;
};

const lastName = value => {
  if (typeof value !== 'string') return 'Last name must be a string.';
  else if (!value.length) return 'Enter last name.';
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
  else return true;
};

const phone = value => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

const validations = {
  age,
  credentials: {
    $sub: {
      firstName,
      lastName
    },
    $self: v => v !== undefined || 'Invalid credentials.'
  },
  phones: {
    $each: {
      value: phone
    },
    $self: v => (Array.isArray(v) && v.length > 0) || 'No enough phone numbers.'
  }
};

class DataModel extends BaseModel<Data> {}

class Model extends mix(DataModel, mixValidate(validations)) {
  constructor(initialData = undefined, react = true, ...options) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

function create(initialData = undefined, react = true, ...options) {
  return new Model(initialData, react, ...options);
}
```

</code-block>
</code-group>

The mixin is most useful with TypeScript, because it allows a developer to use the validations autocompletion.

## Usage

A model instance with `validate` mixin has two equal properties `validations` and `v`. The `validations` property is of type `ValidationBase`, while the `v` property is of user-defined type `Validations` (see [above](#validation-property-type)):

```ts
const instance = create();

instance.v.c. // | Autocomplition
//               | age
//               | credentials
//               | phones

instance.v.c.phones.c[0].c. // | Autocomplition
//                             | value
```

### Nesting levels with flags, options, and methods

`v`/`validations` object is divided into levels according to the data model structure and is synchronously updated when it changes. Because any validated field contains many flags, options, and methods, each sublevel is accessible through a `c` or an untyped `children` property. Every validation object (including the root property `v`/`validations`) contains the following flags and methods:

- `c`/`children` - children validations
- `anyChildDirty` - indicating that at least one of children has the dirty flag
- `selfDirty` - indicating that the current data field is dirty
- `dirty` - indicating that the current data field or one of children is dirty
- `anyChildInvalid` - indicating that at least on of children has the invalid flag
- `selfInvalid` - indicating that validation of the current data field failed
- `invalid` - indicating the validation of the current data field or one of children failed
- `message` - validation error test
- `dirtyMessage` - validation error text, which is specified only if the `dirty` flag is set
- `touch()` - marks the current data field is dirty
- `reset()` - resets the current validation state to default values
- `checkValue()` - compares the specified value with the cached value of the current data field
- `destroy()` - destroys the current validation instance and its children (should not be called manually)

The following example demonstrates a usage of the model, defined above:

```ts
const instance = create();

console.log(instance.v.c.age.dirty); // outputs: false

instance.data.age = 30;

console.log(instance.v.c.age.dirty); // outputs: false
console.log(instance.v.c.age.invalid); // outputs: false

instance.v.c.age.touch();

console.log(instance.v.c.age.dirty); // outputs: true
console.log(instance.v.c.age.invalid); // outputs: false
console.log(instance.v.c.age.message); // outputs: ''
console.log(instance.v.c.age.dirtyMessage); // outputs: ''

instance.data.age = -1;

console.log(instance.v.c.age.dirty); // outputs: true
console.log(instance.v.c.age.invalid); // outputs: true
console.log(instance.v.c.age.message); // outputs: "Age cannot be a negative value."
console.log(instance.v.c.age.dirtyMessage); // outputs: "Age cannot be a negative value."

// do not use push and splice, it breaks reactivity.
instance.data.phones = [...instance.data.phones, { value: '+155533344' }];

// some children are invalid.
console.log(instance.v.invalid); // outputs: true
console.log(instance.v.dirty); // outputs: true

// autotouch is not enabled.
console.log(instance.v.c.phones.c[0].c.value.dirty); // outputs: false
console.log(instance.v.c.phones.c[0].c.value.invalid); // outputs: true
console.log(instance.v.c.phones.c[0].c.value.dirtyMessage); // outputs: ""

instance.v.c.phones.c[0].c.value.touch();

console.log(instance.v.c.phones.c[0].c.value.dirty); // outputs: true
console.log(instance.v.c.phones.c[0].c.value.dirtyMessage); // outputs: "Invalid phone number format."

instance.data.phones[0].value = '+15553334411';

console.log(instance.v.c.phones.c[0].c.value.invalid); // outputs: false

instance.v.reset(); // reset validations

console.log(instance.v.dirty); // outputs: false

instance.destroy();
```

## Combination with the Save and the Rollback mixins

Validation properties will be reset when the model instance is saved or rolled back.

<code-group>
<code-block title="TS">

```ts
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
} from '@vueent/mix-models';

interface Data {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{ value: string }>;
}

function makeInitialData(): Data {
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
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
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

type Validations = PatternAssert<typeof validations, Data>;

class DataModel extends BaseModel<Data> {}

interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask), mixSave(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
```

</code-block>
<code-block title="JS">

```js
import { BaseModel, mixValidate, mix, mixRollback, mixSave } from '@vueent/mix-models';

/**
 * @typedef {import('@vueent/mix-models').Options} Options
 */

/**
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {{ firstName: string; lastName: string }} credentials
 * @property {Array<{ value: string }>} phones
 */

function makeInitialData() {
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

const age = value => {
  if (typeof value !== 'number') return 'Age must be a number.';
  else if (!Number.isInteger(value)) return 'Age must be an integer value.';
  else if (value < 0) return 'Age cannot be a negative value.';
  else return true;
};

const firstName = value => {
  if (typeof value !== 'string') return 'First name must be a string.';
  else if (!value.length) return 'Enter first name.';
  else if (value.length > 255) return 'First name length exceeds 255 characters.';
  else return true;
};

const lastName = value => {
  if (typeof value !== 'string') return 'Last name must be a string.';
  else if (!value.length) return 'Enter last name.';
  else if (value.length > 255) return 'Last name length exceeds 255 characters.';
  else return true;
};

const phone = value => {
  if (typeof value !== 'string') return 'The phone number must be a string.';
  else if (!value.length) return 'Enter the phone number.';
  else if (!/^\+?[1-9]{1}[0-9]{10,12}$/.test(value)) return 'Invalid phone number format.';
  else return true;
};

const rollbackMask = {
  age: true,
  credentials: true,
  phones: true
};

const validations = {
  age,
  credentials: {
    $sub: {
      firstName,
      lastName
    },
    $self: v => v !== undefined || 'Invalid credentials.'
  },
  phones: {
    $each: {
      value: phone
    },
    $self: v => (Array.isArray(v) && v.length > 0) || 'No enough phone numbers.'
  }
};

class DataModel extends BaseModel {}

class Model extends mix(DataModel, mixRollback(rollbackMask), mixSave(), mixValidate(validations)) {
  /**
   * @param {Data=} initialData
   * @param {boolean=} react
   * @param {...Options} options
   */
  constructor(initialData = undefined, react = true, ...options) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}
```

</code-block>
</code-group>

## v9s integration

Our side project [v9s](https://vueent.github.io/v9s/) can be integrated with the `validate` mixin to make model definition more declarative. For example, let's rewrite the model from the page:

<code-group>
<code-block title="TS">

```ts
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
} from '@vueent/mix-models';
import { v9s, simplify } from 'v9s';

interface Data {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{ value: string }>;
}

function makeInitialData(): Data {
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

const phone = (value: string) => !/^\+?[1-9]{1}[0-9]{10,12}$/.test(value);

const rollbackMask = {
  age: true,
  credentials: true,
  phones: true
} as const;

const validations = {
  age: simplify(
    v9s<string>()
      .number('Age must be a number.', Number)
      .use(Number.isInteger, 'Age must be an integer value.')
      .gte(0, 'Age cannot be a negative value.')
  ),
  credentials: {
    $sub: {
      firstName: simplify(
        v9s<string>()
          .string('First name must be a string.')
          .minLength(1, 'Enter first name.')
          .maxLength(255, 'First name length exceeds 255 characters.')
      ),
      lastName: simplify(
        v9s<string>()
          .string('Last name must be a string.')
          .minLength(1, 'Enter last name.')
          .maxLength(255, 'Last name length exceeds 255 characters.')
      )
    },
    $self: (v: any) => v !== undefined || 'Invalid credentials.'
  },
  phones: {
    $each: {
      value: simplify(
        v9s<string>()
          .string('The phone number must be a string.')
          .minLength(1, 'Enter the phone number.')
          .use(phone, 'Invalid phone number format.')
      )
    },
    $self: (v: any) => (Array.isArray(v) && v.length > 0) || 'No enough phone numbers.'
  }
} as const;

type Validations = PatternAssert<typeof validations, Data>;

class DataModel extends BaseModel<Data> {}

interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask), mixSave(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
```

</code-block>

<code-block title="JS">

```js
import { BaseModel, mixValidate, mix, mixRollback, mixSave } from '@vueent/mix-models';
import { v9s, simplify } from 'v9s';

/**
 * @typedef {import('@vueent/mix-models').Options} Options
 */

/**
 * @typedef Data
 * @property {number} id
 * @property {number} age
 * @property {{ firstName: string; lastName: string }} credentials
 * @property {Array<{ value: string }>} phones
 */

function makeInitialData() {
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

const phone = value => !/^\+?[1-9]{1}[0-9]{10,12}$/.test(value);

const rollbackMask = {
  age: true,
  credentials: true,
  phones: true
};

const validations = {
  age: simplify(
    v9s()
      .number('Age must be a number.', Number)
      .use(Number.isInteger, 'Age must be an integer value.')
      .gte(0, 'Age cannot be a negative value.')
  ),
  credentials: {
    $sub: {
      firstName: simplify(
        v9s()
          .string('First name must be a string.')
          .minLength(1, 'Enter first name.')
          .maxLength(255, 'First name length exceeds 255 characters.')
      ),
      lastName: simplify(
        v9s()
          .string('Last name must be a string.')
          .minLength(1, 'Enter last name.')
          .maxLength(255, 'Last name length exceeds 255 characters.')
      )
    },
    $self: v => v !== undefined || 'Invalid credentials.'
  },
  phones: {
    $each: {
      value: simplify(
        v9s()
          .string('The phone number must be a string.')
          .minLength(1, 'Enter the phone number.')
          .use(phone, 'Invalid phone number format.')
      )
    },
    $self: v => (Array.isArray(v) && v.length > 0) || 'No enough phone numbers.'
  }
};

class Model extends mix(BaseModel, mixRollback(rollbackMask), mixSave(), mixValidate(validations)) {
  /**
   * @param {Data=} initialData
   * @param {boolean=} react
   * @param {...Options} options
   */
  constructor(initialData = undefined, react = true, ...options) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}
```

</code-block>
</code-group>
