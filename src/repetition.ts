import {SpecificReport} from "./report.js";

export interface Repetition {
  kind: '留年' | '降年';
  year: number; // 留年、降年が決まった年度
}

export const disableAbsentBeforeRepetition: (repetition: Repetition) => (report: SpecificReport) => boolean = ({ kind, year }) =>
  report => {
    if ('year' in report.course) {
      if (report.course.year > year) return true;
      else if (report.course.year == year) return !(kind == '留年' || ['S', 'S1', 'S2'].includes(report.course.term));
      else return false;
    } else return true;
  }
