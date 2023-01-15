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

  const r1dup3 = await collection.findOne(1, { reload: false });

  expect(r1dup3).toBe(r1dup2);

  const r2dup = collection.peekOne(2);

  expect(r2dup).toBe(r2);

  r2.data.name = 'Alice in Wonderland';
  await r2.save();

  collection.unloadAll();

  const items = await collection.find({ queryParams: { name: 'Alice in Wonderland' } });

  expect(items.length).toBe(1);

  const alice = items[0];

  expect(alice.data.id).toBe(2);
  expect(alice.data.name).toBe('Alice in Wonderland');

  const bob = await collection.findOne(1);

  expect(bob).not.toBe(null);

  if (!bob) return;

  bob.delete();
  await bob.save();

  expect(bob.deleted).toBe(true);
  expect(bob.destroyed).toBe(true);
  expect(bob.instanceDestroyed).toBe(true);

  collection.unload(bob.uid);

  const bobDup = collection.peekOne(1);

  expect(bobDup).toBe(null);

  const unsavedJohn = collection.create();

  unsavedJohn.data.name = 'John';

  expect(unsavedJohn.destroyed).toBe(false);

  collection.unload(unsavedJohn.uid);

  expect(unsavedJohn.instanceDestroyed).toBe(true);

  const allItems = await collection.find();

  expect(allItems.length).toBe(1);

  const cachedItems = collection.peek();

  expect(cachedItems.length).toBe(1);
});
