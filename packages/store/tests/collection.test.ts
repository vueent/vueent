import './__mocks__/vue-vm';
import { EncodedData, StorableCollection } from './__mocks__/storable';

test('CRUD methods working', async () => {
  let pkCounter = 0;
  const getNewPk = () => ++pkCounter;
  const serverStore = new Map<number, EncodedData>();
  const collection = new StorableCollection(serverStore, getNewPk);

  const r1 = collection.create();

  r1.data.name = 'Bob';
  await r1.save();

  expect(r1.data.id).toBe(1);

  const r2 = collection.create({ id: 0, name: 'Alice' });

  await r2.save();

  expect(r2.data.id).toBe(2);

  const r1dup = await collection.findOne(1, { reload: false });

  expect(r1dup).toBe(r1);

  const r1dup2 = await collection.findOne(1);

  expect(r1.data).toEqual(r1dup2?.data);
  expect(r1).not.toBe(r1dup2);

  console.log('before create r1dup3');

  const r1dup3 = await collection.findOne(1, { reload: false });

  console.log('after create r1dup3');

  expect(r1dup3).toBe(r1dup2);
});
