import {AverageType} from "../index.js";
import {Karui, Phase} from "../type-utils.js";
import * as ap from "./additional-point.js";
import * as cr from "./course-requirements.js";
import * as sw from "./specific-weights.js";

export interface DepartmentInfo {
  avgType: AverageType;
  courseRequirementPatterns: cr.RequiredCourse[][];
  specifiedWeightRules: sw.WeightRule[];
  additionalPointRules: ap.AdditionalPointRule[];
  doesMultiplyByAcquired: boolean;
};

export const getDepartmentInfo = (d: Department, phase: Phase, karui: Karui): DepartmentInfo => {
  const avgType = sub(d, '工', '工学部指定平均点') ? '工学'
    : sub(d, '教養/教養学科/超域文化科学') && phase != 1 ? '超域'
    : '基本';

  const courseRequirement = (
    sub(d, '教養/統合自然科学科/数理自然科学') ? cr.integrated_mathsci :
    sub(d, '工/電子情報工学科', '工/電気電子工学科') ? cr.eeic :
    sub(d, '工/物理工学科') ? cr.ap :
    sub(d, '工/応用化学') ? cr.appchem :
    sub(d, '理/数学', '理/情報科学') ? cr.ms:
    sub(d, '理/物理学', '理/天文学', '理/化学') ? cr.phys :
    sub(d, '理/地球惑星物理学') ? cr.epp :
    sub(d, '理/地球惑星環境学') ? cr.epe :
    sub(d, '理/生物化学', '理/生物情報科学', '理/生物学') ? cr.biochem :
    sub(d, '農/応用生命科学/生命科学・工学') ? cr.seimeikagaku :
    sub(d, '農/獣医学課程獣医学専修') ? cr.veterinary :
    sub(d, '薬/薬科学科、薬学科') ? cr.pharm :
    sub(d, '医/医学科') ? cr.med :
    cr.none
  )(karui);

  const specifiedWeightRules = (
    sub(d, '教養/教養学科/地域文化研究') ? sw.地域文化研究 :
    sub(d, '教養/教養学科/総合社会科学') ? sw.総合社会科学 :
    sub(d, '教養/教養学科/国際日本研究コース') ? sw.総合社会科学 :
    sub(d, '教養/統合自然科学科/数理自然科学') ? sw.数理自然科学 :
    sub(d, '教養/統合自然科学科/物質基礎科学') ? sw.物質基礎科学 :
    sub(d, '教養/統合自然科学科/統合生命科学') ? sw.統合生命化学 :
    sub(d, '工/社会基盤学科', '工/建築学科', '工/機械工学科', '工/航空宇宙工学科', '工/精密工学科', '工/電子情報工学科', '工/電気電子工学科', '工/物理工学科', '工/計数工学科', '工/マテリアル工学科', '工/応用化学', '工/化学システム工学科', '工/化学生命工学科', '工/システム創生学科') ? sw.初ゼミ０ :
    sub(d, '理/地球惑星物理学') ? sw.地球惑星物理学 :
    sub(d, '理/生物化学') && phase != 3 ? sw.生物化学 :
    phase == 2 ? (
      sub(d, '農/応用生命科学/応用生物学', '農/環境資源科学/緑地環境学') ? sw.応用生物学 :
      sub(d, '農/応用生命科学/森林生物科学', '農/環境資源科学/森林環境資源科学') ? sw.森林生物科学 :
      sub(d, '農/応用生命科学/水圏生物科学') ? sw.水圏生物科学 :
      sub(d, '農/応用生命科学/生物素材化学', '農/環境資源科学/木質構造科学') ? sw.生物素材化学 :
      sub(d, '農/環境資源科学/農業・資源経済学') ? sw.農業資源経済学 :
      sub(d, '農/環境資源科学/フィールド科学') ? sw.フィールド科学 :
      sub(d, '農/環境資源科学/国際開発農学') ? sw.国際開発農学 :
      sw.none
    ) :
    sub(d, '理', '薬', '医') ? () => sw.requiredCourseAllOne(courseRequirement) :
    sw.none
  )(karui);
  if (sub(d, '工/計数工学科') && phase != 1) specifiedWeightRules.push(...sw.計数(karui));

  const additionalPointRules = (
    sub(d, '教養/教養学科/国際日本研究コース') ? ap.国際日本研究PEAK後期 :
    sub(d, '工/機械工学科', '工/精密工学科', '工/電子情報工学科', '工/電気電子工学科', '工/マテリアル工学科', '工/応用化学', '工/化学システム工学科') ? ap.eng :
    sub(d, '工/航空宇宙工学科') && phase != 1 ? ap.aero :
    sub(d, '理/地球惑星物理学') ? ap.epp :
    sub(d, '理/地球惑星環境学') && phase == 2 ? ap.epe :
    sub(d, '理/生物化学') && phase != 3 ? ap.biochem :
    sub(d, '理/生物学') && phase != 3 ? ap.biol :
    ap.none
  )(karui);

  const doesMultiplyByAcquired = phase == 2 ? sub(d, '工/システム創生学科') : sub(d, '農');

  return { avgType, courseRequirementPatterns: courseRequirement.satisfy(), specifiedWeightRules, additionalPointRules, doesMultiplyByAcquired };
};

type Substr<S extends string> = S extends `${infer T}/${infer U}` ? T | `${T}/${Substr<U>}` : S extends `${infer T}（${any}）` ? T : S;
const sub = (d: Department, ...ds: Substr<Department>[]) => ds.some(s => d.startsWith(s));
export type Department = (typeof department)[number];
export const department = [
  '基本平均点',
  '工学部指定平均点',
  '農学部指定平均点',
  '法/第1類',
  '法/第2類',
  '法/第3類',
  '経済/経済学科',
  '経済/経営学科',
  '経済/金融学科',
  '文/思想文化',
  '文/歴史文化/日本史学',
  '文/歴史文化/東洋史学',
  '文/歴史文化/西洋史学',
  '文/歴史文化/考古史学',
  '文/歴史文化/美術史学',
  '文/言語文化',
  '文/心理学',
  '文/社会心理学',
  '文/社会学',
  '教育/基礎教育学',
  '教育/教育社会科学/比較教育社会学',
  '教育/教育社会科学/教育実践・政策学',
  '教育/心身発達科学/教育心理学',
  '教育/心身発達科学/身体教育学',
  '教養/教養学科/超域文化科学',
  '教養/教養学科/地域文化研究',
  '教養/教養学科/総合社会科学',
  '教養/教養学科/国際日本研究コース（PEAK後期）',
  '教養/教養学科/国際環境学コース（PEAK後期）',
  '教養/統合自然科学科/数理自然科学',
  '教養/統合自然科学科/物質基礎科学',
  '教養/統合自然科学科/統合生命科学',
  '教養/統合自然科学科/認知行動科学',
  '教養/統合自然科学科/スポーツ科学',
  '教養/学際科学科/A群',
  '教養/学際科学科/B群',
  '工/社会基盤学科/A（設計・技術戦略）',
  '工/社会基盤学科/B（政策・計画）',
  '工/社会基盤学科/C（国際プロジェクト）',
  '工/建築学科',
  '工/都市工学科/都市環境工学（環境共生・国際公共衛生・水・環境バイオ）',
  '工/都市工学科/都市計画（都市と地域の分析・計画・デザイン）',
  '工/機械工学科/A（デザイン・エネルギー・ダイナミクス）',
  '工/機械工学科/B（ロボティクス・知能・ヒューマンインターフェース）',
  '工/航空宇宙工学科',
  '工/精密工学科',
  '工/電子情報工学科',
  '工/電気電子工学科',
  '工/物理工学科',
  '工/計数工学科',
  '工/マテリアル工学科/A（バイオマテリアル）',
  '工/マテリアル工学科/B（環境・基盤マテリアル）',
  '工/マテリアル工学科/C（ナノ・機能マテリアル）',
  '工/応用化学',
  '工/化学システム工学科',
  '工/化学生命工学科',
  '工/システム創生学科/A（環境・エネルギーシステム）',
  '工/システム創生学科/B（システムデザイン＆マネジメント）',
  '工/システム創生学科/C（知能社会システム）',
  '理/数学',
  '理/情報科学',
  '理/物理学',
  '理/天文学',
  '理/地球惑星物理学',
  '理/地球惑星環境学',
  '理/化学',
  '理/生物化学',
  '理/生物情報科学',
  '理/生物学',
  '農/応用生命科学/生命科学・工学',
  '農/応用生命科学/応用生物学',
  '農/応用生命科学/森林生物科学',
  '農/応用生命科学/水圏生物科学',
  '農/応用生命科学/動物生命システム科学',
  '農/応用生命科学/生物素材化学',
  '農/環境資源科学/緑地環境学',
  '農/環境資源科学/森林環境資源科学',
  '農/環境資源科学/木質構造科学',
  '農/環境資源科学/生物・環境工学',
  '農/環境資源科学/農業・資源経済学',
  '農/環境資源科学/フィールド科学',
  '農/環境資源科学/国際開発農学',
  '農/獣医学課程獣医学専修',
  '薬/薬科学科、薬学科',
  '医/医学科',
  '医/健康総合科学科',
] as const;

