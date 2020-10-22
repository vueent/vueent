import { create as createSimpleInvalidModel } from '../__mocks__/simple-invalid-model';
import { create as createSimpleNoPatternModel } from '../__mocks__/simple-no-pattern-model';
import '../__mocks__/vue-vm';

test('validate mixin should throw an error if pattern is not defined', () => {
  let error;

  try {
    createSimpleNoPatternModel();
  } catch (e) {
    error = e;
  }

  expect(error?.message).toBe('Pattern or predefined validations should be set');
});

test("validate mixin should throw an error if pattern's format is unsupported", () => {
  let error;

  try {
    createSimpleInvalidModel();
  } catch (e) {
    error = e;
  }

  expect(error?.message).toBe('Unsupported pattern format');
});
