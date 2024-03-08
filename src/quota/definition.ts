import {CourseCode} from "../course-code.js";
import {ScoredCourseReport, SpecificReport, SpecificScoredReport} from "../report.js";

export type Quota = {
  name: string;
  filter: (code: CourseCode) => boolean;
  n: number | undefined;
  subQuotas: readonly Quota[]; // the filters of the sub quotas must be mutually exclusive
  minSub: number;
  forCalculation: {
    constraints: CalculationConstraint[];
  }
};
export type CalculationConstraint = {
  description: string;
  references: string[];
  verify: (allocated: readonly ScoredCourseReport[], tobeAdded: SpecificScoredReport, weightRatio: 1 | 0.1) => boolean;
};

export const $quota = (name: string, n: number | undefined, filter: (code: CourseCode) => boolean, withSub: WithSub = { subQuotas: [], minSub: 0 }, withForCalculation: WithForCalculation = { forCalculation: { constraints: [] } }): Quota =>
  ({ name, filter, n, ...withSub, ...withForCalculation })
;
type WithSub = Pick<Quota, 'subQuotas' | 'minSub'>;
export const withSub = (min: number, ...subQuotas: Quota[]): WithSub => ({ subQuotas, minSub: min });
export const mergeWithSubs = (...subs: (WithSub | undefined)[]) => ({
  subQuotas: subs.flatMap(sub => sub == null ? [] : sub.subQuotas),
  minSub: subs.reduce((p, c) => p + (c == null ? 0 : c.minSub), 0),
});
type WithForCalculation = Pick<Quota, 'forCalculation'>;
export const withForCalculation = (...constraints: CalculationConstraint[]): WithForCalculation => ({
  forCalculation: { constraints },
});

export type Requirements = {
  min: number;
  quotas: readonly Quota[];
  surplusMin: number;
  surplusConstraints: {
    description: string;
    references: string[];
    verify: (allocated: readonly SpecificReport[], tobeAdded: SpecificReport) => boolean;
  }[];
};

