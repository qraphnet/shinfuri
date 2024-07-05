import {CourseCode} from "./course-code.js";

export interface Course {
  code: CourseCode;
  year: number; // 開講年度
  term: Term; // 開講セメスター/ターム
  credit: Credit; // 認定単位数
};
export const isCourse = (value: unknown): value is Course => {
  return 'object' === typeof value && value != null
    && 'year' in value && 'number' === typeof value.year
    && 'term' in value && isTerm(value.term)
    && 'credit' in value && isCredit(value.credit);
};

export const creditList = [1, 2] as const;
export type Credit = (typeof creditList)[number]; // 事実上1単位か2単位の科目しか存在しない
export const isCredit = (value: unknown): value is Credit => creditList.includes(value as any);
export const termList = ['S', 'S1', 'S2', 'A', 'A1', 'A2', 'W'] as const;
export const isTerm = (value: unknown): value is Term => termList.includes(value as any);
export type Term = (typeof termList)[number];

export const termToInt = (term: Term): number => ({ S: 0, S1: 0, S2: 1, A: 2, A1: 2, A2: 3, W: 4 })[term];

