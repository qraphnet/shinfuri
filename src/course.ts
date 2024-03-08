import {CourseCode} from "./course-code.js";

export type Course = {
  code: CourseCode;
  term: Term; // 開講セメスター/ターム
  credit: Credit; // 認定単位数
};

export type Credit = 1 | 2; // 事実上1単位か2単位の科目しか存在しない
export type Term = `${ 2021 | 2022 | 2023 | 2024 }${'S' | 'S1' | 'S2' | 'A' | 'A1' | 'A2' | 'W'}`;

export const termToInt = (term: Term): number => {
  const y = +term.slice(0, 4), t = { S: 0, S1: 0, S2: 1, A: 2, A1: 2, A2: 3, W: 4 }[term.slice(4)]!;
  return y * 10 + t;
};
