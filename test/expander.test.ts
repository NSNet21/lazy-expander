import { normalize, expandPattern, detectStartChar, applyNumbering } from '../src/expander';

describe('normalize', () => {
  test('trims spaces around commas in braces', () => {
    expect(normalize('*:{ text-sm , font-bold }')).toBe('*:{text-sm,font-bold}');
  });
  test('leaves pattern without braces unchanged', () => {
    expect(normalize('text-sm')).toBe('text-sm');
  });
});

describe('expandPattern', () => {
  test('basic Tailwind prefix pattern', () => {
    expect(expandPattern('*:{text-sm,font-bold,text-gray-500}')).toEqual([
      '*:text-sm', '*:font-bold', '*:text-gray-500',
    ]);
  });
  test('numeric range', () => {
    expect(expandPattern('{1..5}')).toEqual(['1', '2', '3', '4', '5']);
  });
  test('range with step', () => {
    expect(expandPattern('{0..8..2}')).toEqual(['0', '2', '4', '6', '8']);
  });
  test('trims spaces before expanding', () => {
    expect(expandPattern('*:{ text-sm , font-bold }')).toEqual(['*:text-sm', '*:font-bold']);
  });
  test('no braces returns single item', () => {
    expect(expandPattern('text-sm')).toEqual(['text-sm']);
  });
  test('multiple brace groups (cartesian)', () => {
    expect(expandPattern('{hover,focus}:text-sm')).toEqual(['hover:text-sm', 'focus:text-sm']);
  });
});

describe('detectStartChar', () => {
  test('detects digit', () => expect(detectStartChar('0')).toBe('0'));
  test('detects 1',     () => expect(detectStartChar('1')).toBe('1'));
  test('detects lower', () => expect(detectStartChar('a')).toBe('a'));
  test('detects upper', () => expect(detectStartChar('A')).toBe('A'));
  test('uses first char only', () => expect(detectStartChar('abc')).toBe('a'));
  test('invalid returns null',  () => expect(detectStartChar('!')).toBeNull());
  test('empty returns null',    () => expect(detectStartChar('')).toBeNull());
});

describe('applyNumbering', () => {
  const items = ['text-sm', 'font-bold', 'text-gray-500'];

  test('zero-indexed', () => {
    expect(applyNumbering(items, '0')).toEqual([
      '0. text-sm', '1. font-bold', '2. text-gray-500',
    ]);
  });
  test('one-indexed', () => {
    expect(applyNumbering(items, '1')).toEqual([
      '1. text-sm', '2. font-bold', '3. text-gray-500',
    ]);
  });
  test('arbitrary start number', () => {
    expect(applyNumbering(items, '5')).toEqual([
      '5. text-sm', '6. font-bold', '7. text-gray-500',
    ]);
  });
  test('lowercase letters', () => {
    expect(applyNumbering(items, 'a')).toEqual([
      'a. text-sm', 'b. font-bold', 'c. text-gray-500',
    ]);
  });
  test('uppercase letters', () => {
    expect(applyNumbering(items, 'A')).toEqual([
      'A. text-sm', 'B. font-bold', 'C. text-gray-500',
    ]);
  });
  test('arbitrary start letter', () => {
    expect(applyNumbering(items, 'c')).toEqual([
      'c. text-sm', 'd. font-bold', 'e. text-gray-500',
    ]);
  });
});
