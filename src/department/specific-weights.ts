import * as cr from "./course-requirements.js";
import {Scope} from "../course-code.js";
import {Karui} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {Weight, WeightedUnit, isSpecificWeightedUnit} from "../weights.js";
import {ordering} from "../report.js";

export type WeightRule = {
  scope: Scope;
  n: number | undefined; // 最大n科目
  weight: Weight;
  shutokuOnly: boolean; // 取得した単位のみを対象とするかどうか falseなら履修登録した科目のみ（0点算入はしない）
};
export type WeightRuleGenerator = (karui: Karui) => WeightRule[];

const $ = (scope: Scope, n: number | undefined, weight: Weight, shutokuOnly: boolean = false): WeightRule =>
  ({ scope, n, weight, shutokuOnly })
;

export const apply = (weighted: readonly WeightedUnit[], rules: readonly WeightRule[]) => {
  for (const { scope, n, weight, shutokuOnly } of rules) {
    const targets = weighted
      .filter(isSpecificWeightedUnit)
      .filter(w => scope.match(w.report.course.code))
      .filter(shutokuOnly ? (w => !['不可', '欠席', '未履修'].includes(w.report.grade)) : (_ => true))
      .toSorted((a, b) => -ordering(a.report, b.report));

    let count = 0;
    for (const w of targets) {
      if (n != null && count >= n) break;
      w.weight = weight;
      w.expls.push({ description: '指定重率' + weight, references: ['p.99~101'] });
      count += 1;
    }
  }
};

// 要求科目はすべて重率1と指定されている進学単位のために，要求科目からWeightRuleを返す関数
export const requiredCourseAllOne = (req: cr.CourseRequirement) => [
  $(new Scope(req.collect().map(r => r.code)), void 0, 1),
];

export const none: WeightRuleGenerator = () => [];
export const 地域文化研究: WeightRuleGenerator = () => [
  $(new Scope(['FC1']), 4, 1.5),
  $(new Scope(['FC2']), 4, 1.5),
];
export const 総合社会科学 = () => [
  $(new Scope(['FC6']), 8, 2),
  $(new Scope(['GCA2', 'GCA5', 'GCB1', 'GCB5', 'GCC1', 'GCC2', 'GCC3', 'GCC4', 'GCF3']), 4, 2),
];
export const 数理自然科学: WeightRuleGenerator = karui => karui.startsWith('NS') ? [
  $(new Scope(['FC3', 'FC8']), 8, 1.5),
] : [];
export const 物質基礎科学: WeightRuleGenerator = () => [
  $(new Scope([
    'GCE11', 'GCE12', 'GCE13', 'GCE14', 'GCE15', 'GCE19', 'GCE1a', 'GCE1c',
    'GCE34', 'GCE35',
    'GCE61', 'GCE62',
  ]), 8, 2),
];
export const 統合生命化学: WeightRuleGenerator = () => [
  $(new Scope([
    'FC881', 'FC882', 'FC885', 'FC886', 'FC888',
    'FC891', 'FC892', 'FC893', 
    'GCE11', 'GCE19', 'GCE1a', 'GCE1b',
    'GCE31', 'GCE31', 'GCE34', 'GCE35',
    'GCE62',
  ]), 8, 1.5),
];
export const 国際日本研究PEAK後期: WeightRuleGenerator = () => [
  $(new Scope(['FC11']), void 0, 2),
];
export const 初ゼミ０: WeightRuleGenerator = () => [
  $(new Scope(['FC510']), 2, 0),
];
export const 計数: WeightRuleGenerator = () => [
  $(new Scope(['FC871', 'FC873', 'FC874', 'FC875', 'FC876', 'FC881', 'FC882', 'FC883', 'FC884']), void 0, 2),
  $(new Scope(['FC3', 'FC885', 'FC886', 'FC887', 'FC888', 'FC891', 'FC892', 'FC893']), void 0, 1.5),
];
export const 地球惑星物理学: WeightRuleGenerator = () => [
  $(new Scope(['FC871', 'FC873', 'FC874', 'FC875', 'FC876', 'FC881', 'FC882', 'FC883', 'FC884', 'FC885', 'FC886']), 14, 2),
];
export const 生物化学: WeightRuleGenerator = karui => karui.startsWith('NS') ? [
  $(new Scope(['GCE', 'GCF']), 6, 2, true),
] : [];
export const 応用生物学: WeightRuleGenerator = () => [
  $(new Scope(['FC']), 16, 5),
  $(new Scope(['GC']), 4, 5),
];
export const 森林生物科学: WeightRuleGenerator = () => [
  $(new Scope(['FC', 'GC']), 20, 5),
];
export const 水圏生物科学: WeightRuleGenerator = karui => karui.startsWith('NS') ? [
  $(new Scope(['FC8']), 6, 5),
  $(new Scope(['GCA', 'GCB', 'GCC', 'GCD', 'GCE', 'GCF']), 6, 5, true),
] : [];
export const 生物素材化学: WeightRuleGenerator = karui => karui.startsWith('NS') ? [
  $(new Scope(['FC8']), 10, 5),
  $(new Scope(['GCD', 'GCE', 'GCF']), 4, 5, true),
] : [];
export const 農業資源経済学: WeightRuleGenerator = karui =>
  karui.startsWith('HSS') ? [ $(new Scope(['FC63']), 4, 2, true) ] :
  karui.startsWith('NS') ? [ $(new Scope(['GCC32', 'GCC41', 'GCC42']), 6, 2, true) ] :
  unreachable('文科と理科しかないことを想定して書いている');
export const フィールド科学: WeightRuleGenerator = () => [
  $(new Scope(['FC']), 10, 5),
];
export const 国際開発農学: WeightRuleGenerator = () => [
  $(new Scope([
    'FC1', 'FC2',
    'GCL1', 'GCL2', 'GCL3', 'GCL4', 'GCL5', 'GCL6', 'GCL7', 'GCL8', 'GCL9',
    'GCLa', 'GCLb', 'GCLc', 'GCLd', 'GCLe', 'GCLf', 'GCLg', 'GCLh', 'GCLi', 'GCLj', 'GCLk', 'GCLl', 'GCLm',
    'GCLn',
    'GCLo',
  ]), 10, 5, true),
];

