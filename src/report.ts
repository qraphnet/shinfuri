import {CourseCode, courseCodeToInt} from "./course-code.js";
import { Course } from "./course.js";

/**
 * 成績表の各行に対応するデータ型
 */
export type Report =
  | { type: 'scored'; course: Course; grade: '優上' | '優' | '良' | '可' | '不可' | '欠席'; point: number }
  | { type: 'unscored'; course: Course; grade: '合格' | '不合格'; }
  | { type: 'unenrolled-specific'; course: Omit<Course, 'term'>;  grade: '未履修'; point: 0; descriotion?: string }
  | { type: 'unenrolled-somewhat'; course?: undefined, scope: (code: CourseCode) => boolean; grade: '未履修'; point: 0; }
;

export type SpecificReport<T = Report> = T extends { course: any } ? T : never;
export const isSpecificReport = <T extends Report>(r: T): r is T & SpecificReport => 'course' in r;
export type ScoredCourseReport<T = Report> = T extends { point: number } ? T : never;
export const isScoredReport = <T extends Report>(r: T): r is T & ScoredCourseReport => 'point' in r;
export type SpecificScoredReport = SpecificReport & ScoredCourseReport;
export type Grade = Report['grade'];
export type ScoredGrade<T = Report> =  T extends { type: 'scored', grade: any } ? T['grade'] : never;

/**
 * p.56で頻出の「成績上位」のためにソートするときに使う関数．
 */
export const ordering = (a: SpecificScoredReport, b: SpecificScoredReport) => {
  const pointOrd = a.point - b.point;
  const codeOrd = courseCodeToInt(a.course.code) - courseCodeToInt(b.course.code);
  // 評点が等しい科目間の順序は公開されていないので，とりあえず整理番号表の順番ということにした．ただ実際の成績表では整理番号表通りに並んでいない箇所もあるため分析すべき．
  return pointOrd ? pointOrd : -codeOrd;
};
