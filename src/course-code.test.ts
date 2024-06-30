import { describe, expect, test } from '@jest/globals';
import { CourseCode, Scope, getTitle, serialNumberMap, getCourseCode } from './course-code.js';
import { LanguageOption } from './type-utils.js';

describe('getTitle', () => {
  test('well mapped', () => {
    for (const [k, v] of Object.entries(serialNumberMap)) {
      for (const [l, w] of Object.entries(v)) {
        expect(getTitle((k + l) as CourseCode)).toBe(w[0]);
      }
    }
  });
});

describe('getCourseCode', () => {
  const option: LanguageOption = {
    firstForeignLanguage: 'de',
    secondForeignLanguage: {
      lang: 'fr',
      learned: false,
    },
  };

  test('first foreign language', () => {
    expect(getCourseCode('ドイツ語一列②', option)).toBe('FC122');
  });
  test('second foreign language', () => {
    expect(getCourseCode('フランス語二列', option)).toBe('FC223');
  });
  test('same code', () => {
    expect(getCourseCode('情報α', option)).toBe('FC300');
  });
});

describe('scope', () => {
  test('include', () => {
    expect(new Scope(['FC']).includes(new Scope(['FC1', 'FC2']))).toBe(true);
    expect(new Scope(['FC1', 'FC2']).includes(new Scope(['FC']))).toBe(false);
    expect(new Scope(['FC'], ['FC3']).includes(new Scope(['FC'], ['FC3', 'FC4']))).toBe(true);
    expect(new Scope(['FC'], ['FC3', 'FC4']).includes(new Scope(['FC'], ['FC4']))).toBe(false);
  });
});
