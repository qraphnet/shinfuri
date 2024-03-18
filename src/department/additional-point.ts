import {CourseCode, isSubcourseOf} from "../course-code.js";
import {SpecificReport} from "../report.js";
import {Karui} from "../type-utils.js";

// 履修点

export type AdditionalPointRule = {
  scope: (code: CourseCode) => boolean;
  max: number | undefined;
  point: 0.1 | 0.5 | 1 | 2;
};
export type AdditionalPoint = {
  code: CourseCode;
  point: 0.1 | 0.5 | 1 | 2;
  valid: boolean;
};
export type AdditionalPointRuleGenerator = (karui: Karui) => AdditionalPointRule[];
const $ = (scope: AdditionalPointRule['scope'], max: number | undefined, point: AdditionalPointRule['point']): AdditionalPointRule => ({ scope, max, point });

export const calc = (reports: SpecificReport[], rule: AdditionalPointRule): AdditionalPoint[] => {
  const { scope, max, point } = rule;
  return reports.filter(r => ['不可', '欠席', '不合格', '未履修'].includes(r.grade)).map(r => r.course.code).filter(scope).map((code, i) => ({ code, point, valid: max == null || (i + 1) <= max }));
};

export const none: AdditionalPointRuleGenerator = () => [];
export const 国際日本研究PEAK後期: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('PT100'), void 0, 1),
];
export const eng: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('GCD81', 'GCD91', 'GCE21', 'GCF45'), 1, 0.1),
];
export const aero: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('GCF21', 'GCF22'), 1, 0.1),
];
export const epp: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('GCE11', 'GCE15', 'GCE41', 'GCE42', 'GCE43', 'GCE4a', 'GCE4b'), 2, 1),
];
export const epe: AdditionalPointRuleGenerator = karui => karui.startsWith('NS')
  ? [ $(isSubcourseOf('GCD1', 'GCDb4', 'GCDb5', 'GCE1c', 'GCE31', 'GCE32', 'GCE33', 'GCE36', 'GCE38', 'GCE41', 'GCE42', 'GCE43', 'GCE44', 'GCE45', 'GCE46', 'GCE47', 'GCE51', 'GCE57', 'GCE61'), 4, 0.5) ]
  : [ $(isSubcourseOf('GCD1', 'GCDb4', 'GCDb5', 'GCE17', 'GCE18', 'GCE1a', 'GCE1b', 'GCE1c', 'GCE31', 'GCE32', 'GCE33', 'GCE36', 'GCE38', 'GCE4a', 'GCE4b', 'GCE43', 'GCE44', 'GCE45', 'GCE4c', 'GCE51', 'GCE57', 'GCE61'), 4, 0.5) ]
;
export const biochem: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('GCE36', 'GCE37'), 2, 1),
];
export const biol: AdditionalPointRuleGenerator = () => [
  $(isSubcourseOf('GCE37'), void 0, 2),
];
