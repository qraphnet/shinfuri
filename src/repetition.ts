import {SpecificReport} from "./report.js";

export interface Repetition {
  kind: '留年' | '降年';
  year: number; // 留年、降年が決まった年度
}
export const isRepetition = (value: unknown): value is Repetition => {
  if (!('object' === typeof value && value != null && 'kind' in value && 'year' in value)) return false;
  const { kind, year } = value;

  if (!['留年', '降年'].includes(kind as any)) return false;
  return 'number' === typeof year && (year | 0) === year && year > 2000;
}

export const disableAbsentBeforeRepetition: (repetition: Repetition) => (report: SpecificReport) => boolean = ({ kind, year }) =>
  report => {
    if ('year' in report.course) {
      if (report.course.year > year) return true;
      else if (report.course.year == year) return !(kind == '留年' || ['S', 'S1', 'S2'].includes(report.course.term));
      else return false;
    } else return true;
  }
