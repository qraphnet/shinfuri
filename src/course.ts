import {CourseCode} from "./course-code.js";

export type Course = {
  code: CourseCode;
  year: number; // 開講年度
  term: Term; // 開講セメスター/ターム
  credit: Credit; // 認定単位数
};

export type Credit = 1 | 2; // 事実上1単位か2単位の科目しか存在しない
export type Term = 'S' | 'S1' | 'S2' | 'A' | 'A1' | 'A2' | 'W';

export const termToInt = (term: Term): number => ({ S: 0, S1: 0, S2: 1, A: 2, A1: 2, A2: 3, W: 4 })[term];

