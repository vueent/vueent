import { create as createHardModel, Validations as HardValidations } from '../__mocks__/hard-model';
import { create as createCredentialModel, Validations as CredentialValidations } from '../__mocks__/credentials-model';

import '../__mocks__/vue-vm';

function makeHardModel() {
  return createHardModel({
    id: '',
    credentials: { first: 'Dan', second: 'Vasilev', last: 'Grigoryevich' },
    phones: ['123456789'],
    documents: [{ id: '1', filename: '1.pdf' }],
    items: [{ value: [{ val: 'large test' }] }]
  });
}

test('Validation should work with deep objects', () => {
  const instance = makeHardModel();

  const sInstance = createCredentialModel({ first: 'Dan', second: 'Vasilev', last: 'Grigoryevich' });

  const hV: HardValidations = instance.v;

  const cV: CredentialValidations = hV.c.credentials;

  //When field credentials in hard model is't undefined where is no error

  hV.c.credentials = cV;

  instance.v.c.documents.c[0]?.c.filename.dirty;

  instance.v.c.phone.dirty;

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.id.dirty).toBe(false);
  expect(instance.v.c.credentials.c.first.dirty).toBe(false);
  expect(instance.v.c.documents.c[0]?.c.filename.dirty).toBe(false);
  expect(instance.v.c.phones.c[0]?.dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(false);

  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.id.dirty).toBe(true);
  expect(instance.v.c.credentials.c.first.dirty).toBe(true);
  expect(instance.v.c.documents.c[0]?.c.filename.dirty).toBe(true);
  expect(instance.v.c.phones?.c[0]?.dirty).toBe(true);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(true);

  instance.data.items[0].value[0].val = '';

  instance.v.touch();

  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(true);

  instance.rollback();

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.id.dirty).toBe(false);
  expect(instance.v.c.credentials.c.first.dirty).toBe(false);
  expect(instance.v.c.documents.c[0]?.c.filename.dirty).toBe(false);
  expect(instance.v.c.phones.c[0]?.dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(false);
});

test('Validation should work with rollback with $index mask', () => {
  const instance = makeHardModel();

  instance.data.items[0].value.splice(0, 1, { val: 'pls' });

  instance.v.touch();

  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(true);

  instance.rollback({ items: { $array: true, $index: [0], value: true } });

  expect(instance.data.items[0].value[0].val).toBe('large test');
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(false);
});

test('Validation should work then we rollback model with undefined field', () => {
  const instance = makeHardModel();

  instance.data.phones = undefined;

  instance.v.touch();

  expect(instance.v.c.phones.dirty).toBe(true);

  instance.rollback();

  instance.v.touch();

  expect(instance.v.c.phones.c[0]?.dirty).toBe(true);
});
