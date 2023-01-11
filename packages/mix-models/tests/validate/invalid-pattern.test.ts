import { validateMixin, Pattern } from '@vueent/mix-models';

import { Data, DataModel } from '../__mocks__/recursive-model';
import { create as createSimpleInvalidModel } from '../__mocks__/simple-invalid-model';
import { create as createSimpleNoPatternModel } from '../__mocks__/simple-no-pattern-model';
import '../__mocks__/vue-vm';

test('validate mixin should throw an error if pattern is not defined', () => {
  let error;

  try {
    createSimpleNoPatternModel();
  } catch (e) {
    error = e as any;
  }

  expect(error?.message).toBe('Pattern or predefined validations should be set');
});

test("validate mixin should throw an error if pattern's format is unsupported", () => {
  let error;

  try {
    createSimpleInvalidModel();
  } catch (e) {
    error = e as any;
  }

  expect(error?.message).toBe('Unsupported pattern format');
});

test('validate mixin should throw an error when the format of some validation rule is not supported', () => {
  class Model extends validateMixin<Data, DataModel, typeof DataModel>(DataModel, {
    name: () => true,
    items: 42
  } as unknown as Pattern) {
    constructor() {
      super('', { name: '', items: [] });
    }
  }

  let error;

  try {
    new Model();
  } catch (e) {
    error = e as any;
  }

  expect(error?.message).toBe('Unsupported pattern format');
});

test('pattern checker should break the chain when the $each argument is already exists in the leaf set', () => {
  const patterns: Pattern[] = [
    (() => {
      const validations: Pattern = {
        name: () => true
      };

      validations.items = { $each: validations };

      return validations;
    })(),
    (() => {
      const validations: Pattern = {
        name: () => true
      };

      validations.items = {
        $each: {
          name: () => true,
          items: {
            $each: validations
          }
        }
      };

      return validations;
    })(),
    (() => {
      const validations: Pattern = {};
      const items: any = {};

      items.$each = items;
      validations.items = items;

      return validations;
    })(),

    (() => {
      const validations: Pattern = {};
      const child: any = {};

      child.$sub = validations;
      validations.child = child;

      return validations;
    })()
  ];

  patterns.forEach(validations => {
    class Model extends validateMixin<Data, DataModel, typeof DataModel>(DataModel, validations) {}

    let error;

    try {
      new Model('', { name: '', items: [] });
    } catch (e) {
      error = e;
    }

    expect(error).toBe(undefined);
  });
});
