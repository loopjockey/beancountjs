import { parseNumber } from './parser'

test('the numbers should be parseable', () => {
  expect(parseNumber("ONE")[1]).toBe(1);
  expect(parseNumber("ZERO")[1]).toBe(0);
  expect(parseNumber("HALF")[1]).toBe(0.5);
  expect(parseNumber("123")[1]).toBe(123);
  expect(parseNumber("123.456")[1]).toBe(123.456);
  expect(parseNumber("1,123.456")[1]).toBe(1123.456);
  expect(parseNumber("1,123,123.456")[1]).toBe(1123123.456);
  expect(parseNumber("Howdy!")[1]).toBeNull();
});
