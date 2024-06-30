import {Scope} from "../course-code.js";
import {ScoredCourseReport, SpecificReport, SpecificScoredReport} from "../report.js";

export class Quota {
  subQuotas: Quota[]; // the filters of the sub quotas must be mutually exclusive
  minSub: number;
  forCalculation: {
    constraints: CalculationConstraint[];
  };

  constructor(readonly name: string, readonly n: number | undefined, readonly scope: Scope) {
    this.subQuotas = [];
    this.minSub = 0;
    this.forCalculation = { constraints: [] };
  }

  withSub(min: number, subQuotas: Quota[], apply: boolean = true): this {
    if (apply && subQuotas.length != 0) {
      this.minSub += min;
      this.subQuotas.push(...subQuotas);
    }
    return this;
  }
  
  withForCalc(constraints: CalculationConstraint[], apply: boolean = true): this {
    if (apply) this.forCalculation.constraints.push(...constraints);
    return this;
  }
}
export interface CalculationConstraint {
  description: string;
  references: string[];
  verify: Verifier;
};
export type Verifier = (allocated: readonly ScoredCourseReport[], tobeAdded: SpecificScoredReport, weightRatio: 1 | 0.1) => boolean;

export interface Requirements {
  min: number;
  quotas: readonly Quota[];
  surplusMin: number;
  surplusConstraints: SurplusConstraint[];
};
export type SurplusVerifier = (allocated: readonly SpecificReport[], tobeAdded: SpecificReport) => boolean;
export interface SurplusConstraint {
    description: string;
    references: string[];
    verify: SurplusVerifier;
}
