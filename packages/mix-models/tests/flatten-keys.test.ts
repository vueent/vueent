import { flattenKeys } from '../src/flatten-keys';

test('deep structure with an array of objects should be processed correctly', () => {
  const input = {
    nick: 'nick',
    official: {
      first: 'John',
      last: 'Doe'
    },
    phones: [
      { countryCode: '1', phoneNumber: '5554443322' },
      { countryCode: '1', phoneNumber: '5556665544' }
    ],
    id: 1,
    subjects: [{ value: 'me' }, { value: 'you' }, { value: 'we' }]
  };

  const expected = [
    'nick',
    'official.first',
    'official.last',
    'phones.[0].countryCode',
    'phones.[0].phoneNumber',
    'phones.[1].countryCode',
    'phones.[1].phoneNumber',
    'id',
    'subjects.[0].value',
    'subjects.[1].value',
    'subjects.[2].value'
  ];

  const result = flattenKeys(input);
  const equal = result.length !== expected.length ? false : result.every(line => expected.includes(line));

  expect(equal).toBe(true);
});
