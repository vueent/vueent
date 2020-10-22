import { create as createHardModel } from '../__mocks__/hard-model';

import '../__mocks__/vue-vm';

test('Validation should work with deep objects', () => {
  const instance = createHardModel({
    id: '',
    credentials: { first: 'Dan', second: 'Borisov', last: 'Grigorevich' },
    phones: ['123456789'],
    documents: [{ id: '1', filename: '1.pdf' }],
    items: [{ value: [{ val: 'large test' }] }]
  });

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.id.dirty).toBe(false);
  expect(instance.v.c.credentials.c.first.dirty).toBe(false);
  expect(instance.v.c.documents.c[0].c.filename.dirty).toBe(false);
  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(false);

  instance.v.touch();

  expect(instance.v.dirty).toBe(true);
  expect(instance.v.c.id.dirty).toBe(true);
  expect(instance.v.c.credentials.c.first.dirty).toBe(true);
  expect(instance.v.c.documents.c[0].c.filename.dirty).toBe(true);
  expect(instance.v.c.phones.c[0].dirty).toBe(true);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(true);

  instance.data.items[0].value[0].val = '';

  instance.v.touch();

  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(true);

  instance.rollback();

  expect(instance.v.dirty).toBe(false);
  expect(instance.v.c.id.dirty).toBe(false);
  expect(instance.v.c.credentials.c.first.dirty).toBe(false);
  expect(instance.v.c.documents.c[0].c.filename.dirty).toBe(false);
  expect(instance.v.c.phones.c[0].dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.dirty).toBe(false);
  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(false);

  instance.data.items[0].value[0] = { val: 'pls' };

  instance.v.touch();

  expect(instance.v.c.items.c[0].c.value.c[0].c.val.invalid).toBe(true);
});
