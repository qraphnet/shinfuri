import {collectCreditedAvg} from "./avg-crediting.js";
import {AdditionalPoint, calc} from "./department/additional-point.js";
import {apply as crApply} from "./department/course-requirements.js";
import {Department, getDepartmentInfo} from "./department/index.js";
import {apply as swApply} from "./department/specific-weights.js";
import {Repetition, disableAbsentBeforeRepetition} from "./repetition.js";
import {generateRequirements} from "./quota/shuryo.js";
import {FP, Rational} from "./rational.js";
import {ScoredCourseReport, SpecificReport, UnenrolledReport, isScoredReport} from "./report.js";
import {Karui, Group, LanguageOption, Phase} from "./type-utils.js";
import {Weighted, bundle, distributeBasic, distributeChoiki, distributeEng} from "./weights.js";

export type AverageType = '基本' | '工学' | '超域';

export type CalculationTicket<R extends SpecificReport> = {
  avgType: AverageType;
  weights: Weighted<R & ScoredCourseReport | UnenrolledReport>[];
  additionalPoint: AdditionalPoint<R>[];
  factor: Rational | undefined; // 取得単位数(上限90)を掛ける場合
};

export type Options = {
  karui: Karui;
  group: Group;
  langOption: LanguageOption;
  department: Department;
  phase: Phase;
  exclude: ScoredCourseReport['grade'][]; // 計算から除外するやつ
  lastRepetition?: Repetition;
};
export const makeTicket = <R extends SpecificReport>(reports: R[], options: Options): CalculationTicket<R> => {
  const { karui, langOption, department, phase, exclude, group, lastRepetition } = options;
  const requirements = generateRequirements({ karui, langOption, forCalculation: true });
  const { avgType, courseRequirementPatterns, specifiedWeightRules, additionalPointRules, doesMultiplyByAcquired } = getDepartmentInfo(department, phase, karui);
  if (courseRequirementPatterns.length == 0) courseRequirementPatterns.push([]);

  const additionalPoint = additionalPointRules.flatMap(rule => calc(reports, rule));
  const avgCredited = collectCreditedAvg(reports.filter(isScoredReport), langOption, group);
  const acquiredUnitSum = reports.filter(r => !['不可', '欠席', '未履修'].includes(r.grade) || avgCredited.has(r as any)).reduce((p, r) => p + r.course.credit, 0);
  const factor = doesMultiplyByAcquired ? Rational.int(Math.min(90, acquiredUnitSum)) : undefined;

  let res: CalculationTicket<R>;
  let avg = -1;

  const reportList = lastRepetition == null ? reports : reports.filter(disableAbsentBeforeRepetition(lastRepetition));
  for (const r of courseRequirementPatterns) {
    const reps = crApply(r, reportList);
    const weighted = { '基本': distributeBasic, '工学': distributeEng, '超域': distributeChoiki }[avgType](reps.filter(isScoredReport), requirements);
    swApply(weighted, specifiedWeightRules);
    const weights = bundle(weighted).filter(exclude.length === 0 ? () => true : w => !exclude.includes(w.report.grade));

    const ticket: CalculationTicket<R> = { avgType, weights, additionalPoint, factor };
    const score = calculate(ticket).toNumber();
    if (score > avg) {
      avg = score;
      res = ticket;
    }
  }

  return res!;
};

export const sumWeightedCredit = (weights: readonly Weighted<ScoredCourseReport>[]): Rational =>
  weights.reduce(
    (p, { weights }) => weights.reduce((p, { credit, value: weight }) => {
      const cr = Rational.int(credit);
      const wr = Rational.deci.mul(Rational.int(Math.round(weight * 10)));
      return p.add(cr.mul(wr));
    }, p),
    Rational.int(0),
  )
;

export const engPoint = (point: number): number => Math.min(10, Math.max(0, Math.ceil((point - 49) / 5)));
export const sumWeightedPoint = (weights: readonly Weighted<ScoredCourseReport>[], eng: boolean): Rational =>
  weights.reduce((p, { report: { point }, weights }) => {
    const sr = Rational.int(eng ? engPoint(point) : point);

    return weights.reduce((p, { credit, value: weight }) => {
      const cr = Rational.int(credit);
      const wr = Rational.deci.mul(Rational.int(Math.round(weight * 10)));
      return p.add(sr.mul(cr).mul(wr));
    }, p);
  }, Rational.int(0))
;

export const calculate = <R extends SpecificReport>(ticket: CalculationTicket<R>): Rational => {
  const credits = sumWeightedCredit(ticket.weights), points = sumWeightedPoint(ticket.weights, ticket.avgType === '工学');

  let avg = points.div(credits).mul(ticket.factor ?? Rational.int(1));
  for (const { point: p, valid } of ticket.additionalPoint) if (valid) {
    const point = Rational.deci.mul(Rational.int(Math.round(p * 10)));
    avg = avg.add(point);
  }

  return avg;
};

// 浮動小数点数で計算する

export const sumWeightedCreditFP = (weights: readonly Weighted<ScoredCourseReport>[]): FP =>
  weights.reduce(
    (p, { weights }) => weights.reduce((p, { credit, value: weight }) => {
      const cr = FP.int(credit);
      const wr = FP.deci.mul(FP.int(Math.round(weight * 10)));
      return p.add(cr.mul(wr));
    }, p),
    FP.int(0),
  )
;

export const sumWeightedPointFP = (weights: readonly Weighted<ScoredCourseReport>[], eng: boolean): FP =>
  weights.reduce((p, { report: { point }, weights }) => {
    const sr = FP.int(eng ? engPoint(point) : point);
    
    return weights.reduce((p, { credit, value: weight }) => {
      const cr = FP.int(credit);
      const wr = FP.deci.mul(FP.int(Math.round(weight * 10)));
      return p.add(sr.mul(cr).mul(wr));
    }, p);
  }, FP.int(0))
;

export const calculateFP = <R extends SpecificReport>(ticket: CalculationTicket<R>): FP => {
  const credits = sumWeightedCreditFP(ticket.weights), points = sumWeightedPointFP(ticket.weights, ticket.avgType === '工学');
  
  let avg = points.div(credits).mul(ticket.factor == null ? FP.int(1) : FP.from(ticket.factor));
  for (const { point: p, valid } of ticket.additionalPoint) {
    if (valid) {
      const point = FP.deci.mul(FP.int(Math.round(p * 10)));
      avg         = avg.add(point);
    }
  }
  
  return avg;
};